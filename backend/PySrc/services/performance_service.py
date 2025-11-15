from models.performance import EquipmentLog
from models.wind import WindMinData, WindMinDataArchive
from extensions import db
from sqlalchemy import and_, func, select, text, case
from dateutil.relativedelta import relativedelta
from datetime import datetime, timedelta
import calendar

class PerformanceService:
    @staticmethod
    def create_equipment_log(log_data):
        try:
            required_fields = ['siteid', 'equip_id', 'equip_type']
            for field in required_fields:
                if field not in log_data:
                    raise ValueError(f"Missing required field: {field}")

            new_log = EquipmentLog(
                siteid=log_data['siteid'],
                equip_id=log_data['equip_id'],
                equip_type=log_data['equip_type'],
                powder_gen=log_data.get('powder_gen'),
                voltage=log_data.get('voltage'),
                current=log_data.get('current'),
                wind_speed=log_data.get('wind_speed'),
                run_speed=log_data.get('run_speed'),
                temperature=log_data.get('temperature'),
                humidity=log_data.get('humidity'),
                emissions=log_data.get('emissions')
            )
            
            db.session.add(new_log)
            db.session.commit()
            return new_log.to_dict()
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_equipment_logs(scope=None, time_range='year', start=None, end=None, **filters):
        try:
            print(f"Received parameters: scope={scope}, time_range={time_range}")
            print(f"Date range: {start} to {end}")
            
            time_series = PerformanceService.generate_time_series(time_range, start, end)
            print(f"Generated time series: {time_series}")
            
            query = EquipmentLog.query
            if start and end:
                query = query.filter(EquipmentLog.log_time.between(start, end))
            
            # 根據時間範圍選擇正確的格式化字符串
            time_format = {
                'year': '%Y-%m',
                'quarter': '%Y-%U',
                'month': '%Y-%m-%d',
                'day': '%Y-%m-%d %H'
            }.get(time_range, '%Y-%m-%d %H:%i')
            
            # 分組字段
            group_fields = []
            if scope == 'site':
                group_fields.append(EquipmentLog.siteid)
            elif scope == 'equip':
                group_fields.append(EquipmentLog.equip_id)
            elif scope == 'type':
                group_fields.append(EquipmentLog.equip_type)
            
            # 使用 func.date_format 直接格式化時間
            results = query.with_entities(
                *group_fields,
                func.date_format(EquipmentLog.log_time, time_format).label('time_slot'),
                func.sum(EquipmentLog.powder_gen).label('total_power')
            ).group_by(
                func.date_format(EquipmentLog.log_time, time_format),
                *group_fields
            ).all()
            
            print(f"Query results: {results}")
            
            # 處理結果
            processed = {'total': {}}
            
            for result in results:
                if group_fields:
                    group_key = result[0]
                    time_key = result[-2]
                    value = float(result[-1]) if result[-1] else 0
                else:
                    group_key = 'total'
                    time_key = result[0]
                    value = float(result[1]) if result[1] else 0
                
                if group_key not in processed:
                    processed[group_key] = {}
                processed[group_key][time_key] = value
                
                # 同時累加到 total
                if group_key != 'total':
                    processed['total'].setdefault(time_key, 0)
                    processed['total'][time_key] += value
            
            # 填充缺失時間段
            for time_slot in time_series:
                for group in processed.keys():
                    if time_slot not in processed[group]:
                        processed[group][time_slot] = 0
            
            print(f"Processed data: {processed}")
            return processed
            
        except Exception as e:
            print(f"Error in get_equipment_logs: {str(e)}")
            raise e

    @staticmethod
    def get_site_power_data(site_id, period_type='day', start_date=None, end_date=None):
        try:
            # 判斷是否提供了日期參數
            if start_date is None or end_date is None:
                # 如果沒有提供日期，使用當前日期
                current_date = datetime.now()
                
                # 根據週期類型設置日期範圍
                if period_type == 'year':
                    start_date = datetime(current_date.year, 1, 1) if start_date is None else start_date
                    end_date = datetime(current_date.year, 12, 31) if end_date is None else end_date
                elif period_type == 'month':
                    start_date = datetime(current_date.year, current_date.month, 1) if start_date is None else start_date
                    last_day = calendar.monthrange(current_date.year, current_date.month)[1]
                    end_date = datetime(current_date.year, current_date.month, last_day) if end_date is None else end_date
                elif period_type == 'day':
                    start_date = datetime(current_date.year, current_date.month, current_date.day) if start_date is None else start_date
                    end_date = start_date.replace(hour=23, minute=59, second=59) if end_date is None else end_date
            
            # 確保 end_date 包含到當天最後一刻
            if period_type == 'day' and isinstance(end_date, datetime) and end_date.hour == 0 and end_date.minute == 0 and end_date.second == 0:
                end_date = end_date.replace(hour=23, minute=59, second=59)

            # 構建查詢
            if period_type == 'year':
                # 按月統計
                query = db.session.query(
                    WindMinData.site_id,
                    func.date_format(func.str_to_date(WindMinData.period, '%Y-%m-%d %H:%i'), '%Y-%m').label('period'),
                    func.sum(WindMinData.sum_output_power).label('wind_power'),
                    func.sum(WindMinData.sum_power_pac).label('grid_power')
                )
            elif period_type == 'month':
                # 按日統計
                query = db.session.query(
                    WindMinData.site_id,
                    func.date_format(func.str_to_date(WindMinData.period, '%Y-%m-%d %H:%i'), '%Y-%m-%d').label('period'),
                    func.sum(WindMinData.sum_output_power).label('wind_power'),
                    func.sum(WindMinData.sum_power_pac).label('grid_power')
                )
            else:
                # 按小時統計
                query = db.session.query(
                    WindMinData.site_id,
                    func.date_format(func.str_to_date(WindMinData.period, '%Y-%m-%d %H:%i'), '%H').label('period'),
                    func.sum(WindMinData.sum_output_power).label('wind_power'),
                    func.sum(WindMinData.sum_power_pac).label('grid_power')
                )

            # 添加站點過濾條件
            query = query.filter(WindMinData.site_id == site_id)

            # 添加時間範圍過濾條件
            query = query.filter(
                and_(
                    func.str_to_date(WindMinData.period, '%Y-%m-%d %H:%i') >= start_date,
                    func.str_to_date(WindMinData.period, '%Y-%m-%d %H:%i') <= end_date
                )
            )

            # 分組和排序
            if period_type == 'year':
                query = query.group_by(
                    WindMinData.site_id,
                    func.date_format(func.str_to_date(WindMinData.period, '%Y-%m-%d %H:%i'), '%Y-%m')
                )
            elif period_type == 'month':
                query = query.group_by(
                    WindMinData.site_id,
                    func.date_format(func.str_to_date(WindMinData.period, '%Y-%m-%d %H:%i'), '%Y-%m-%d')
                )
            else:
                query = query.group_by(
                    WindMinData.site_id,
                    func.date_format(func.str_to_date(WindMinData.period, '%Y-%m-%d %H:%i'), '%H')
                )

            query = query.order_by('period')
            
            print("Generated SQL:", str(query))  # 調試用
            results = query.all()
            print("Query results:", results)  # 調試用

            # 創建完整的時間序列（修改這部分）
            complete_series = []
            if period_type == 'year':
                # 使用 start_date 的年份
                year = start_date.year if isinstance(start_date, datetime) else datetime.now().year
                for month in range(1, 13):
                    complete_series.append(f"{year}-{month:02d}")
            elif period_type == 'month':
                # 使用 start_date 的年月
                year = start_date.year if isinstance(start_date, datetime) else datetime.now().year
                month = start_date.month if isinstance(start_date, datetime) else datetime.now().month
                days_in_month = calendar.monthrange(year, month)[1]
                for day in range(1, days_in_month + 1):
                    complete_series.append(f"{year}-{month:02d}-{day:02d}")
            elif period_type == 'day':
                for hour in range(24):
                    complete_series.append(f"{hour:02d}")

            # 將查詢結果轉換為字典，方便查找
            result_dict = {row.period: {
                'wind_power': float(row.wind_power) if row.wind_power else 0,
                'grid_power': float(row.grid_power) if row.grid_power else 0
            } for row in results}

            # 格式化結果，包含所有時間點
            formatted_results = []
            for period in complete_series:
                # 如果超過當前時間，或沒有數據，則填充0
                if period in result_dict:
                    data = result_dict[period]
                else:
                    data = {'wind_power': 0, 'grid_power': 0}
                
                formatted_results.append({
                    'site_id': site_id,
                    'period': period,
                    'wind_power': data['wind_power'],
                    'grid_power': data['grid_power']
                })

            return formatted_results

        except Exception as e:
            print(f"Error in get_site_power_data: {str(e)}")
            raise e

    @staticmethod
    def get_archive_power_data(site_id, period_type='day', query_day=None):
        try:
            if query_day is None:
                query_day = datetime.now()
            elif isinstance(query_day, str):
                query_day = datetime.strptime(query_day, '%Y-%m-%d')

            # 构建基础查询
            query = db.session.query(WindMinDataArchive.site_id)

            # 根据period_type设置不同的分组和过滤条件
            if period_type == 'day':
                # 按小时统计
                query = query.add_columns(
                    WindMinDataArchive.period_hr.label('period'),  # 不需要额外处理，使用原始的 period_hr
                    func.sum(WindMinDataArchive.sum_output_power).label('wind_power'),
                    func.sum(WindMinDataArchive.sum_power_pac).label('grid_power')
                )
                # 过滤当天数据
                query = query.filter(
                    WindMinDataArchive.period_day == query_day.strftime('%Y-%m-%d'),
                    WindMinDataArchive.site_id == site_id
                )
                # 分组和排序
                query = query.group_by(
                    WindMinDataArchive.site_id,
                    WindMinDataArchive.period_hr
                ).order_by(WindMinDataArchive.period_hr)
                
                # 修改这里，生成完整的时间序列
                complete_series = [f"{query_day.strftime('%Y-%m-%d')} {hour:02d}" for hour in range(24)]

            elif period_type == 'month':
                # 按日统计
                query = query.add_columns(
                    WindMinDataArchive.period_day.label('period'),
                    func.sum(WindMinDataArchive.sum_output_power).label('wind_power'),
                    func.sum(WindMinDataArchive.sum_power_pac).label('grid_power')
                )
                # 过滤当月数据
                query = query.filter(
                    WindMinDataArchive.period_mon == query_day.strftime('%Y-%m'),
                    WindMinDataArchive.site_id == site_id
                )
                # 分组和排序
                query = query.group_by(
                    WindMinDataArchive.site_id,
                    WindMinDataArchive.period_day
                ).order_by(WindMinDataArchive.period_day)
                
                # 修改这里，生成从月初到月末的日期序列
                year = query_day.year
                month = query_day.month
                last_day = calendar.monthrange(year, month)[1]
                complete_series = [f"{year}-{month:02d}-{day:02d}" for day in range(1, last_day + 1)]

            else:  # year
                # 按月统计
                query = query.add_columns(
                    WindMinDataArchive.period_mon.label('period'),
                    func.sum(WindMinDataArchive.sum_output_power).label('wind_power'),
                    func.sum(WindMinDataArchive.sum_power_pac).label('grid_power')
                )
                # 过滤当年数据
                query = query.filter(
                    func.left(WindMinDataArchive.period_mon, 4) == query_day.strftime('%Y'),
                    WindMinDataArchive.site_id == site_id
                )
                # 分组和排序
                query = query.group_by(
                    WindMinDataArchive.site_id,
                    WindMinDataArchive.period_mon
                ).order_by(WindMinDataArchive.period_mon)
                
                # 修改这里，生成完整的年月序列
                year = query_day.year
                complete_series = [f"{year}-{month:02d}" for month in range(1, 13)]

            print(f"Generated SQL: {str(query)}")  # 添加调试信息
            results = query.all()
            print(f"Query results: {results}")  # 添加调试信息

            # 将查询结果转换为字典
            result_dict = {row.period: {
                'wind_power': float(row.wind_power) if row.wind_power else 0,
                'grid_power': float(row.grid_power) if row.grid_power else 0
            } for row in results}

            # 格式化结果，包含所有时间点
            formatted_results = []
            for period in complete_series:
                data = result_dict.get(period, {'wind_power': 0, 'grid_power': 0})
                formatted_results.append({
                    'site_id': site_id,
                    'period': period,
                    'wind_power': data['wind_power'],
                    'grid_power': data['grid_power']
                })

            return formatted_results

        except Exception as e:
            print(f"Error in get_archive_power_data: {str(e)}")
            raise e

    @staticmethod
    def get_device_archive_power_data(device_id, period_type='min'):
        try:
            # 构建基础查询
            query = db.session.query(WindMinDataArchive.device_id)

            # 根据不同的period_type设置不同的查询逻辑
            if period_type == 'min':
                # 查询最新60笔数据
                query = query.add_columns(
                    WindMinDataArchive.period.label('period'),
                    WindMinDataArchive.sum_output_power.label('wind_power'),
                    WindMinDataArchive.sum_power_pac.label('grid_power')
                ).filter(
                    WindMinDataArchive.device_id == device_id
                ).order_by(
                    WindMinDataArchive.period.desc()
                ).limit(60)

            elif period_type == 'hr':
                # 按小时分组查询最新24小时
                query = query.add_columns(
                    WindMinDataArchive.period_hr.label('period'),
                    func.sum(WindMinDataArchive.sum_output_power).label('wind_power'),
                    func.sum(WindMinDataArchive.sum_power_pac).label('grid_power')
                ).filter(
                    WindMinDataArchive.device_id == device_id
                ).group_by(
                    WindMinDataArchive.device_id,
                    WindMinDataArchive.period_hr
                ).order_by(
                    WindMinDataArchive.period_hr.desc()
                ).limit(24)

            elif period_type == 'day':
                # 按天分组查询最新30天
                query = query.add_columns(
                    WindMinDataArchive.period_day.label('period'),
                    func.sum(WindMinDataArchive.sum_output_power).label('wind_power'),
                    func.sum(WindMinDataArchive.sum_power_pac).label('grid_power')
                ).filter(
                    WindMinDataArchive.device_id == device_id
                ).group_by(
                    WindMinDataArchive.device_id,
                    WindMinDataArchive.period_day
                ).order_by(
                    WindMinDataArchive.period_day.desc()
                ).limit(30)

            else:  # mon
                # 按月分组查询最新12个月
                query = query.add_columns(
                    WindMinDataArchive.period_mon.label('period'),
                    func.sum(WindMinDataArchive.sum_output_power).label('wind_power'),
                    func.sum(WindMinDataArchive.sum_power_pac).label('grid_power')
                ).filter(
                    WindMinDataArchive.device_id == device_id
                ).group_by(
                    WindMinDataArchive.device_id,
                    WindMinDataArchive.period_mon
                ).order_by(
                    WindMinDataArchive.period_mon.desc()
                ).limit(12)

            print(f"Generated SQL: {str(query)}")  # 添加调试信息
            results = query.all()
            print(f"Query results: {results}")  # 添加调试信息

            # 格式化结果
            formatted_results = []
            for row in results:
                formatted_results.append({
                    'device_id': device_id,
                    'period': row.period,
                    'wind_power': float(row.wind_power) if row.wind_power else 0,
                    'grid_power': float(row.grid_power) if row.grid_power else 0
                })

            # 反转结果列表，使其按时间正序排列
            formatted_results.reverse()

            return formatted_results

        except Exception as e:
            print(f"Error in get_device_archive_power_data: {str(e)}")
            raise e


