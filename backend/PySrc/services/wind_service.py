from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy import desc, and_
from models.wind import (
    WindDataMinView,
    WindDataHrsView,
    WindDataDayView,
    WindDataMonView
)
from extensions import db
import logging

logger = logging.getLogger(__name__)

# 視圖映射配置
VIEW_MAPPING = {
    'min': {
        'model': WindDataMinView,
        'time_column': 'period',
        'limit': 60
    },
    'hour': {
        'model': WindDataHrsView,
        'time_column': 'period',
        'limit': 24
    },
    'day': {
        'model': WindDataDayView,
        'time_column': 'period',
        'limit': 30
    },
    'mon': {
        'model': WindDataMonView,
        'time_column': 'period',
        'limit': 12
    }
}

class WindService:
    @staticmethod
    def get_wind_data(device_id, period_type, query_date=None):
        """
        獲取風力發電數據
        :param device_id: 設備ID
        :param period_type: 時間週期類型(min/hour/day/mon)
        :param query_date: 查詢日期，格式為 YYYY-MM-DD，默認為 None (當前時間)
        :return: 格式化後的數據列表
        """
        try:
            # 強制類型檢查
            config = VIEW_MAPPING.get(period_type)
            if not config:
                raise ValueError(f"不支持的週期類型: {period_type}")

            model = config['model']
            time_column = config['time_column']
            limit = config['limit']

            # 處理查詢日期
            if query_date:
                try:
                    if isinstance(query_date, str):
                        query_date = datetime.strptime(query_date, '%Y-%m-%d')
                    
                    # 設置結束時間為查詢日期的23:59:59
                    end_time = query_date.replace(hour=23, minute=59, second=59)
                    
                    # 根據不同的period_type計算開始時間
                    if period_type == 'min':
                        # 往前取60分鐘
                        start_time = end_time - timedelta(minutes=60)
                    elif period_type == 'hour':
                        # 往前取24小時
                        start_time = end_time - timedelta(hours=24)
                    elif period_type == 'day':
                        # 往前取30天
                        start_time = end_time - timedelta(days=30)
                    elif period_type == 'mon':
                        # 往前取12個月
                        start_time = end_time - timedelta(days=365)
                        # 調整到月初
                        start_time = start_time.replace(day=1, hour=0, minute=0, second=0)
                    
                    # 構建時間範圍查詢
                    query = db.session.query(
                        getattr(model, 'period').label('period'),
                        model.avg_wind_speed,
                        model.wind_power,
                        model.grid_power,
                        model.min_wind_speed,
                        model.max_wind_speed
                    ).filter(
                        model.device_id == device_id,
                        and_(
                            getattr(model, time_column) >= start_time,
                            getattr(model, time_column) <= end_time
                        )
                    ).order_by(
                        desc(getattr(model, time_column))
                    )
                except ValueError as e:
                    logger.error(f"日期格式錯誤: {str(e)}")
                    raise ValueError("日期格式錯誤，請使用 YYYY-MM-DD 格式")
            else:
                # 使用當前時間
                query = db.session.query(
                    getattr(model, 'period').label('period'),
                    model.avg_wind_speed,
                    model.wind_power,
                    model.grid_power,
                    model.min_wind_speed,
                    model.max_wind_speed
                ).filter(
                    model.device_id == device_id
                ).order_by(
                    desc(getattr(model, time_column))
                ).limit(limit)

            logger.debug(f"執行查詢: {query}")
            results = query.all()

            # 格式化結果
            formatted_data = [{
                'period': item.period.isoformat() if hasattr(item.period, 'isoformat') else item.period,
                'wind_power': float(item.wind_power) if item.wind_power is not None else 0.0,
                'grid_power': float(item.grid_power) if item.grid_power is not None else 0.0,
                'avg_wind_speed': float(item.avg_wind_speed) if item.avg_wind_speed is not None else 0.0,
                'min_wind_speed': float(item.min_wind_speed) if item.min_wind_speed is not None else 0.0,
                'max_wind_speed': float(item.max_wind_speed) if item.max_wind_speed is not None else 0.0
            } for item in results]

            # 按時間正序排列
            return sorted(formatted_data, key=lambda x: x['period'])
            
        except Exception as e:
            logger.error(f"查詢風力數據失敗: {str(e)}", exc_info=True)
            raise

    @staticmethod
    def get_multi_wind_data(device_ids, period_type):
        """
        獲取多個風機的數據
        :param device_ids: 設備ID列表
        :param period_type: 時間週期類型
        :return: 按設備ID分組的數據字典
        """
        try:
            config = VIEW_MAPPING.get(period_type)
            if not config:
                raise ValueError(f"不支持的週期類型: {period_type}")

            model = config['model']
            time_column = config['time_column']
            limit = config['limit']

            # 構建查詢
            query = db.session.query(
                model.device_id,
                getattr(model, 'period').label('period'),
                model.wind_power,
                model.grid_power,
                model.avg_wind_speed
            ).filter(
                model.device_id.in_(device_ids)
            ).order_by(
                desc(getattr(model, time_column))
            ).limit(limit * len(device_ids))  # 每個設備取limit條

            logger.debug(f"執行批量查詢: {query}")
            results = query.all()

            # 按設備ID分組數據
            grouped_data = {}
            for item in results:
                device_data = grouped_data.setdefault(item.device_id, [])
                if len(device_data) < limit:
                    formatted = {
                        'period': item.period.isoformat() if hasattr(item.period, 'isoformat') else item.period,
                        'wind_power': float(item.wind_power) if item.wind_power is not None else 0.0,
                        'grid_power': float(item.grid_power) if item.grid_power is not None else 0.0,
                        'avg_wind_speed': float(item.avg_wind_speed) if item.avg_wind_speed is not None else 0.0,
                        'min_wind_speed': float(item.min_wind_speed) if item.min_wind_speed is not None else 0.0,
                        'max_wind_speed': float(item.max_wind_speed) if item.max_wind_speed is not None else 0.0
                    }
                    device_data.append(formatted)

            # 對每個設備的數據按時間排序
            for device_id in grouped_data:
                grouped_data[device_id].sort(key=lambda x: x['period'])
                
            return grouped_data
            
        except Exception as e:
            logger.error(f"批量查詢風力數據失敗: {str(e)}", exc_info=True)
            raise

    @staticmethod
    def get_wind_min_data_full(device_id):
        """
        獲取風機分鐘數據的全部信息
        :param device_id: 設備ID
        :return: 設備的完整分鐘數據
        """
        try:
            # 使用 WindMinDataView 模型
            model = WindMinDataView
            
            # 構建查詢，獲取所有列
            query = db.session.query(model).filter(
                model.device_id == device_id
            ).order_by(
                desc(model.period)
            )
            
            logger.debug(f"執行完整分鐘數據查詢: {query}")
            results = query.all()
            
            # 格式化結果 - 將所有欄位轉換為字典
            formatted_data = []
            for item in results:
                data_dict = {}
                for column in item.__table__.columns:
                    column_name = column.name
                    value = getattr(item, column_name)
                    
                    # 處理特殊類型
                    if hasattr(value, 'isoformat'):  # datetime 類型
                        data_dict[column_name] = value.isoformat()
                    elif value is not None and hasattr(value, 'real'):  # Decimal 類型
                        data_dict[column_name] = float(value)
                    else:
                        data_dict[column_name] = value
                        
                formatted_data.append(data_dict)
                
            return formatted_data
            
        except Exception as e:
            logger.error(f"查詢風機完整分鐘數據失敗: {str(e)}", exc_info=True)
            raise

    @staticmethod
    def get_latest_wind_min_data(device_id):
        """
        獲取風機分鐘數據的最新一筆記錄，並檢查時間戳連續性
        :param device_id: 設備ID
        :return: 設備的最新一筆完整分鐘數據，包含服務器狀態
        """
        try:
            # 使用 WindMinDataView 模型
            model = WindMinDataView
            
            # 構建查詢，獲取最後兩筆記錄
            query = db.session.query(model).filter(
                model.device_id == device_id
            ).order_by(
                desc(model.period)
            ).limit(2)
            
            logger.debug(f"執行最新兩筆風機數據查詢: {query}")
            results = query.all()
            
            # 如果沒有找到記錄，返回空對象
            if not results:
                return {}
                
            # 檢查是否有至少兩筆記錄
            server_status = 0  # 默認為不連續
            
            if len(results) >= 2:
                latest_period = results[0].period
                previous_period = results[1].period
                
                # 檢查 period 是否是字符串類型，如是則轉換為日期時間對象
                from datetime import datetime
                
                if isinstance(latest_period, str):
                    try:
                        latest_period = datetime.strptime(latest_period, "%Y-%m-%d %H:%M")
                    except ValueError:
                        logger.error(f"無法解析時間戳: {latest_period}")
                        latest_period = None
                
                if isinstance(previous_period, str):
                    try:
                        previous_period = datetime.strptime(previous_period, "%Y-%m-%d %H:%M")
                    except ValueError:
                        logger.error(f"無法解析時間戳: {previous_period}")
                        previous_period = None
                
                # 如果兩個時間戳都成功轉換，計算時間差
                if latest_period and previous_period:
                    # 計算時間差（以秒為單位）
                    time_diff = (latest_period - previous_period).total_seconds()
                    
                    # 判斷是否為連續時間戳（假設分鐘數據應該間隔60秒）
                    # 允許有些許誤差（例如±5秒）
                    if 55 <= time_diff <= 65:
                        server_status = 1
                    
                    logger.debug(f"最新時間戳: {latest_period}, 前一時間戳: {previous_period}, 時間差: {time_diff}秒, 狀態: {server_status}")
            
            # 格式化最新記錄
            result = results[0]
            data_dict = {}
            
            for column in result.__table__.columns:
                column_name = column.name
                value = getattr(result, column_name)
                
                # 處理特殊類型
                if hasattr(value, 'isoformat'):  # datetime 類型
                    data_dict[column_name] = value.isoformat()
                elif value is not None and hasattr(value, 'real'):  # Decimal 類型
                    data_dict[column_name] = float(value)
                else:
                    data_dict[column_name] = value
            
            # 添加服務器狀態欄位
            data_dict['server_status'] = server_status
                
            return data_dict
            
        except Exception as e:
            logger.error(f"查詢風機最新數據失敗: {str(e)}", exc_info=True)
            raise

    @staticmethod
    def get_wind_statistic_data(device_id, period_type, query_date=None, statistic_type=False):
        """
        獲取風力發電統計數據
        :param device_id: 設備ID
        :param period_type: 時間週期類型(min/hour/day/mon)
        :param query_date: 查詢日期，格式為 YYYY-MM-DD，默認為 None (當前時間)
        :param statistic_type: 是否使用統計模式，默認為 False
        :return: 格式化後的數據列表
        """
        try:
            config = VIEW_MAPPING.get(period_type)
            if not config:
                raise ValueError(f"不支持的週期類型: {period_type}")

            model = config['model']
            time_column = config['time_column']
            
            # 設置查詢時間
            current_time = datetime.now() if query_date is None else (
                datetime.strptime(query_date, '%Y-%m-%d') if isinstance(query_date, str) else query_date
            )

            if statistic_type:
                # 統計模式的查詢邏輯
                if period_type == 'min':
                    # 查詢當前小時的所有分鐘
                    start_time = current_time.replace(minute=0, second=0, microsecond=0)
                    end_time = start_time + timedelta(hours=1)
                    max_records = 60
                    current_minute = current_time.minute if query_date is None else 59
                    
                elif period_type == 'hour':
                    # 查詢當天的所有小時
                    start_time = current_time.replace(hour=0, minute=0, second=0, microsecond=0)
                    end_time = start_time + timedelta(days=1)
                    max_records = 24
                    current_hour = current_time.hour if query_date is None else 23
                    
                elif period_type == 'day':
                    # 查詢當月的所有天數
                    start_time = current_time.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                    end_time = (start_time + timedelta(days=32)).replace(day=1)
                    max_records = (end_time - start_time).days
                    current_day = current_time.day if query_date is None else max_records
                    
                else:  # mon
                    # 查詢當年的所有月份
                    start_time = current_time.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
                    end_time = start_time.replace(year=start_time.year + 1)
                    max_records = 12
                    current_month = current_time.month if query_date is None else 12

                # 構建查詢
                query = db.session.query(
                    getattr(model, 'period').label('period'),
                    model.avg_wind_speed,
                    model.min_wind_speed,
                    model.max_wind_speed,
                    model.wind_power,
                    model.grid_power
                ).filter(
                    model.device_id == device_id,
                    and_(
                        getattr(model, time_column) >= start_time,
                        getattr(model, time_column) < end_time
                    )
                ).order_by(getattr(model, time_column))

                results = query.all()
                
                # 填充結果列表
                formatted_data = []
                existing_periods = {r.period: r for r in results}
                
                # 根據不同的週期類型生成完整週期列表
                if period_type == 'min':
                    for i in range(max_records):
                        period = (start_time + timedelta(minutes=i)).strftime('%Y-%m-%d %H:%M')
                        if i <= current_minute:
                            result = existing_periods.get(period)
                            if result:
                                formatted_data.append({
                                    'period': period,
                                    'wind_power': float(result.wind_power) if result.wind_power is not None else 0.0,
                                    'grid_power': float(result.grid_power) if result.grid_power is not None else 0.0,
                                    'avg_wind_speed': float(result.avg_wind_speed) if result.avg_wind_speed is not None else 0.0,
                                    'min_wind_speed': float(result.min_wind_speed) if result.min_wind_speed is not None else 0.0,
                                    'max_wind_speed': float(result.max_wind_speed) if result.max_wind_speed is not None else 0.0
                                })
                            else:
                                formatted_data.append({
                                    'period': period,
                                    'wind_power': 0.0,
                                    'grid_power': 0.0,
                                    'avg_wind_speed': 0.0,
                                    'min_wind_speed': 0.0,
                                    'max_wind_speed': 0.0
                                })
                        else:
                            formatted_data.append({
                                'period': period,
                                'wind_power': 0.0,
                                'grid_power': 0.0,
                                'avg_wind_speed': 0.0,
                                'min_wind_speed': 0.0,
                                'max_wind_speed': 0.0
                            })
                            
                elif period_type == 'hour':
                    for i in range(max_records):
                        period = (start_time + timedelta(hours=i)).strftime('%Y-%m-%d %H:00')
                        if i <= current_hour:
                            result = existing_periods.get(period)
                            if result:
                                formatted_data.append({
                                    'period': period,
                                    'wind_power': float(result.wind_power) if result.wind_power is not None else 0.0,
                                    'grid_power': float(result.grid_power) if result.grid_power is not None else 0.0,
                                    'avg_wind_speed': float(result.avg_wind_speed) if result.avg_wind_speed is not None else 0.0,
                                    'min_wind_speed': float(result.min_wind_speed) if result.min_wind_speed is not None else 0.0,
                                    'max_wind_speed': float(result.max_wind_speed) if result.max_wind_speed is not None else 0.0
                                })
                            else:
                                formatted_data.append({
                                    'period': period,
                                    'wind_power': 0.0,
                                    'grid_power': 0.0,
                                    'avg_wind_speed': 0.0,
                                    'min_wind_speed': 0.0,
                                    'max_wind_speed': 0.0
                                })
                        else:
                            formatted_data.append({
                                'period': period,
                                'wind_power': 0.0,
                                'grid_power': 0.0,
                                'avg_wind_speed': 0.0,
                                'min_wind_speed': 0.0,
                                'max_wind_speed': 0.0
                            })
                            
                elif period_type == 'day':
                    for i in range(max_records):
                        period = (start_time + timedelta(days=i)).strftime('%Y-%m-%d')
                        if i < current_day:
                            result = existing_periods.get(period)
                            if result:
                                formatted_data.append({
                                    'period': period,
                                    'wind_power': float(result.wind_power) if result.wind_power is not None else 0.0,
                                    'grid_power': float(result.grid_power) if result.grid_power is not None else 0.0,
                                    'avg_wind_speed': float(result.avg_wind_speed) if result.avg_wind_speed is not None else 0.0,
                                    'min_wind_speed': float(result.min_wind_speed) if result.min_wind_speed is not None else 0.0,
                                    'max_wind_speed': float(result.max_wind_speed) if result.max_wind_speed is not None else 0.0
                                })
                            else:
                                formatted_data.append({
                                    'period': period,
                                    'wind_power': 0.0,
                                    'grid_power': 0.0,
                                    'avg_wind_speed': 0.0,
                                    'min_wind_speed': 0.0,
                                    'max_wind_speed': 0.0
                                })
                        else:
                            formatted_data.append({
                                'period': period,
                                'wind_power': 0.0,
                                'grid_power': 0.0,
                                'avg_wind_speed': 0.0,
                                'min_wind_speed': 0.0,
                                'max_wind_speed': 0.0
                            })
                            
                else:  # mon
                    for i in range(max_records):
                        period = (start_time + relativedelta(months=i)).strftime('%Y-%m')
                        if i < current_month:
                            result = existing_periods.get(period)
                            if result:
                                formatted_data.append({
                                    'period': period,
                                    'wind_power': float(result.wind_power) if result.wind_power is not None else 0.0,
                                    'grid_power': float(result.grid_power) if result.grid_power is not None else 0.0,
                                    'avg_wind_speed': float(result.avg_wind_speed) if result.avg_wind_speed is not None else 0.0,
                                    'min_wind_speed': float(result.min_wind_speed) if result.min_wind_speed is not None else 0.0,
                                    'max_wind_speed': float(result.max_wind_speed) if result.max_wind_speed is not None else 0.0
                                })
                            else:
                                formatted_data.append({
                                    'period': period,
                                    'wind_power': 0.0,
                                    'grid_power': 0.0,
                                    'avg_wind_speed': 0.0,
                                    'min_wind_speed': 0.0,
                                    'max_wind_speed': 0.0
                                })
                        else:
                            formatted_data.append({
                                'period': period,
                                'wind_power': 0.0,
                                'grid_power': 0.0,
                                'avg_wind_speed': 0.0,
                                'min_wind_speed': 0.0,
                                'max_wind_speed': 0.0
                            })

                return formatted_data
                
            else:
                # 使用原有的查詢邏輯
                return WindService.get_wind_data(device_id, period_type, query_date)
            
        except Exception as e:
            logger.error(f"查詢風力統計數據失敗: {str(e)}", exc_info=True)
            raise