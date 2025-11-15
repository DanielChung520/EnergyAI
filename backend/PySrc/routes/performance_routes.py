from flask import Blueprint, request, jsonify
from services.performance_service import PerformanceService
from extensions import db
from models.performance import EquipmentLog
from datetime import datetime, timedelta
from sqlalchemy.sql import func
from dateutil.relativedelta import relativedelta

performance_bp = Blueprint('performance', __name__)

@performance_bp.route('/equipment-logs', methods=['POST'])
def create_equipment_log():
    try:
        log_data = request.get_json()
        result = PerformanceService.create_equipment_log(log_data)
        return jsonify({'data': result, 'message': 'Log created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@performance_bp.route('/site-power/<site_id>', methods=['GET'])
def get_site_power(site_id):
    try:
        # 從查詢參數獲取週期類型和時間範圍
        period_type = request.args.get('period', 'day')  # 預設為日
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        # 驗證週期類型
        if period_type not in ['year', 'month', 'day']:
            return jsonify({'error': 'Invalid period type. Must be year, month, or day'}), 400

        # 如果提供了日期，轉換為正確的格式
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d')
            except ValueError:
                return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400

        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d')
            except ValueError:
                return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400

        # 調用服務方法獲取數據
        results = PerformanceService.get_site_power_data(
            site_id=site_id,
            period_type=period_type,
            start_date=start_date,
            end_date=end_date
        )

        return jsonify({
            'success': True,
            'data': results
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@performance_bp.route('/archive-power/<site_id>', methods=['GET'])
def get_archive_power(site_id):
    try:
        # 从查询参数获取周期类型和查询日期
        period_type = request.args.get('period', 'day')  # 默认为日
        query_day = request.args.get('query_day')

        # 验证周期类型
        if period_type not in ['year', 'month', 'day']:
            return jsonify({'error': 'Invalid period type. Must be year, month, or day'}), 400

        # 如果提供了日期，转换为正确的格式
        if query_day:
            try:
                query_day = datetime.strptime(query_day, '%Y-%m-%d')
            except ValueError:
                return jsonify({'error': 'Invalid query_day format. Use YYYY-MM-DD HH:mm'}), 400

        # 调用服务方法获取数据
        results = PerformanceService.get_archive_power_data(
            site_id=site_id,
            period_type=period_type,
            query_day=query_day
        )

        return jsonify({
            'success': True,
            'data': results
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@performance_bp.route('/device-archive-power/<device_id>', methods=['GET'])
def get_device_archive_power(device_id):
    try:
        # 从查询参数获取周期类型
        period_type = request.args.get('period', 'min')  # 默认为分钟

        # 验证周期类型
        if period_type not in ['min', 'hr', 'day', 'mon']:
            return jsonify({'error': 'Invalid period type. Must be min, hr, day, or mon'}), 400

        # 调用服务方法获取数据
        results = PerformanceService.get_device_archive_power_data(
            device_id=device_id,
            period_type=period_type
        )

        return jsonify({
            'success': True,
            'data': results
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500



