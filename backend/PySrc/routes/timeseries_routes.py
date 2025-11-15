from flask import Blueprint, jsonify, request
from services.timeseries_service import TimeseriesService
from flask_cors import cross_origin
from services.equipment_data_service import EquipmentDataService
from datetime import datetime, timedelta
import logging

# 配置日誌
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

ts_bp = Blueprint('timeseries', __name__, url_prefix='/timeseries')
ts_service = TimeseriesService()

# 電廠生產數據相關路由
@ts_bp.route('/api/power-data', methods=['POST'])
@cross_origin()
def write_power_data():
    """接收電廠生產數據"""
    try:
        data = request.json
        result = ts_service.write_power_data(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ts_bp.route('/api/power-data/<site_id>', methods=['GET'])
@cross_origin()
def get_power_data(site_id):
    """獲取電廠生產數據"""
    try:
        start = request.args.get('start')
        end = request.args.get('end')
        data = ts_service.get_power_data(site_id, start, end)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 設備監控數據相關路由
@ts_bp.route('/api/equipment-data', methods=['POST'])
@cross_origin()
def write_equipment_data():
    """接收設備監控數據"""
    try:
        data = request.json
        result = ts_service.write_equipment_data(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ts_bp.route('/api/equipment-data/<equipment_id>', methods=['GET'])
@cross_origin()
def get_equipment_data(equipment_id):
    """獲取設備監控數據"""
    try:
        start = request.args.get('start')
        end = request.args.get('end')
        data = ts_service.get_equipment_data(equipment_id, start, end)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 環境數據相關路由
@ts_bp.route('/api/environment-data', methods=['POST'])
@cross_origin()
def write_environment_data():
    """接收環境數據"""
    try:
        data = request.json
        result = ts_service.write_environment_data(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ts_bp.route('/api/environment-data/<site_id>', methods=['GET'])
@cross_origin()
def get_environment_data(site_id):
    """獲取環境數據"""
    try:
        start = request.args.get('start')
        end = request.args.get('end')
        data = ts_service.get_environment_data(site_id, start, end)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 風力發電設備數據路由
@ts_bp.route('/api/wind-turbine-data', methods=['POST'])
@cross_origin()
def write_wind_turbine_data():
    """接收風力發電設備數據"""
    try:
        data = request.json
        result = ts_service.write_wind_turbine_data(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 變流器數據路由
@ts_bp.route('/api/inverter-data', methods=['POST'])
@cross_origin()
def write_inverter_data():
    """接收變流器數據"""
    try:
        data = request.json
        result = ts_service.write_inverter_data(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 氣象數據路由
@ts_bp.route('/api/weather-data', methods=['POST'])
@cross_origin()
def write_weather_data():
    """接收氣象數據"""
    try:
        data = request.json
        result = ts_service.write_weather_data(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 太陽能發電數據路由
@ts_bp.route('/api/solar-data', methods=['POST'])
@cross_origin()
def write_solar_data():
    """接收太陽能發電數據"""
    try:
        data = request.json
        result = ts_service.write_solar_data(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 儲能櫃數據路由
@ts_bp.route('/api/battery-data', methods=['POST'])
@cross_origin()
def write_battery_data():
    """接收儲能櫃數據"""
    try:
        data = request.json
        result = ts_service.write_battery_data(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ts_bp.route('/equipment/<equipment_id>/timeseries', methods=['GET'])
@cross_origin()
def get_equipment_timeseries(equipment_id):
    """獲取設備的時序數據"""
    try:
        logger.info(f"Received request for equipment timeseries: {equipment_id}")
        
        # 獲取查詢參數
        site_id = request.args.get('site_id')
        start_time = request.args.get('start_time', '-1h')
        fields = request.args.get('fields', '').split(',') if request.args.get('fields') else None

        logger.debug(f"Query parameters: site_id={site_id}, start_time={start_time}, fields={fields}")

        # 創建服務實例
        service = EquipmentDataService()
        
        try:
            # 查詢發電數據
            success, result = service.query_power_generation(
                site_id=site_id,
                equipment_id=equipment_id,
                start_time=start_time,
                fields=fields
            )

            if not success:
                logger.error(f"Query failed: {result}")
                return jsonify({'error': str(result)}), 500

            # 處理數據
            data = []
            for table in result:
                for record in table.records:
                    data.append({
                        'time': record.get_time().isoformat(),
                        'field': record.get_field(),
                        'value': record.get_value(),
                        'equipment_id': record.values.get('equipment_id'),
                        'site_id': record.values.get('site_id')
                    })

            logger.info(f"Successfully retrieved {len(data)} data points")
            logger.debug(f"First data point: {data[0] if data else None}")

            return jsonify({
                'success': True,
                'data': data
            })

        finally:
            service.close()

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500 