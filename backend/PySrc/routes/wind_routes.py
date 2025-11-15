from flask import Blueprint, jsonify, request, current_app
import models.wind as wind
from services.users_service import UserService
import logging
from sqlalchemy import text
from extensions import db
import jwt as pyjwt
from datetime import datetime, timedelta
from functools import wraps
from services.wind_service import WindService

logger = logging.getLogger(__name__)

wind_bp = Blueprint('wind', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            # 使用固定测试token验证
            if token != 'wind_test_only_123':
                raise ValueError('Invalid token')
                
            # 跳过JWT解码，直接验证token值
            current_user = 'testuser'  # 设置固定测试用户
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@wind_bp.route('/<string:device_id>/<string:period_type>', methods=['GET'])
@token_required
def get_wind_data(current_user, device_id, period_type):
    """
    獲取風力發電數據
    ---
    tags:
      - 風力發電數據
    parameters:
      - name: device_id
        in: path
        type: string
        required: true
        description: 風機設備ID
      - name: period_type
        in: path
        type: string
        enum: ['min', 'hour', 'day', 'week', 'mon']
        required: true
        description: 時間週期類型
    responses:
      200:
        description: 風力發電數據
        schema:
          type: array
          items:
            type: object
            properties:
              period:
                type: string
              sum_output_power:
                type: number
              sum_power_pac:
                type: number
      400:
        description: 無效的請求參數
      500:
        description: 伺服器錯誤
    """
    try:
        logger.info(f"Request for device {device_id} with period {period_type}")
        
        # 參數驗證
        valid_periods = ['min', 'hour', 'day', 'mon']
        if period_type not in valid_periods:
            return jsonify({'error': f'Invalid period type. Valid values are {valid_periods}'}), 400

        # 獲取查詢日期參數
        query_date = request.args.get('date')
        
        data = WindService.get_wind_data(device_id, period_type, query_date)
        return jsonify(data)
    
    except ValueError as ve:
        logger.error(f"Validation error: {str(ve)}")
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@wind_bp.route('/batch', methods=['POST'])
@token_required
def get_batch_wind_data(current_user):
    """
    批量獲取多風機數據
    ---
    tags:
      - 風力發電數據
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            device_ids:
              type: array
              items:
                type: string
              example: ["device1", "device2"]
            period_type:
              type: string
              enum: ['min', 'hour', 'day', 'week', 'mon']
    responses:
      200:
        description: 多風機數據
        schema:
          type: object
          additionalProperties:
            type: array
            items:
              type: object
              properties:
                period:
                  type: string
                sum_output_power:
                  type: number
                sum_power_pac:
                  type: number
      400:
        description: 無效的請求參數
      500:
        description: 伺服器錯誤
    """
    try:
        data = request.get_json()
        device_ids = data.get('device_ids', [])
        period_type = data.get('period_type', 'hour')

        if not device_ids:
            return jsonify({'error': 'Device IDs are required'}), 400

        result = WindService.get_multi_wind_data(device_ids, period_type)
        return jsonify(result)
    
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        logger.error(f"Batch query error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@wind_bp.route('/min_data_full/<string:device_id>', methods=['GET'])
@token_required
def get_wind_min_data_full(current_user, device_id):
    """
    獲取風機分鐘數據的全部信息
    ---
    tags:
      - 風力發電數據
    parameters:
      - name: device_id
        in: path
        type: string
        required: true
        description: 風機設備ID
    responses:
      200:
        description: 風機分鐘數據完整信息
        schema:
          type: array
          items:
            type: object
      400:
        description: 無效的請求參數
      500:
        description: 伺服器錯誤
    """
    try:
        logger.info(f"Request for full min data of device {device_id}")
        
        # 驗證 device_id
        if not device_id:
            return jsonify({'error': 'Device ID is required'}), 400
            
        data = WindService.get_wind_min_data_full(device_id)
        return jsonify(data)
    
    except ValueError as ve:
        logger.error(f"Validation error: {str(ve)}")
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        logger.error(f"Server error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

@wind_bp.route('/latest/<string:device_id>', methods=['GET'])
@token_required
def get_latest_wind_data(current_user, device_id):
    """
    獲取風機分鐘數據的最新一筆記錄
    ---
    tags:
      - 風力發電數據
    parameters:
      - name: device_id
        in: path
        type: string
        required: true
        description: 風機設備ID
    responses:
      200:
        description: 風機最新分鐘數據
        schema:
          type: object
      400:
        description: 無效的請求參數
      500:
        description: 伺服器錯誤
    """
    try:
        logger.info(f"Request for latest min data of device {device_id}")
        
        # 驗證 device_id
        if not device_id:
            return jsonify({'error': 'Device ID is required'}), 400
            
        data = WindService.get_latest_wind_min_data(device_id)
        return jsonify(data)
    
    except ValueError as ve:
        logger.error(f"Validation error: {str(ve)}")
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        logger.error(f"Server error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

@wind_bp.route('/statistic/<string:device_id>/<string:period_type>', methods=['GET'])
@token_required
def get_wind_statistic_data(current_user, device_id, period_type):
    """
    獲取風力發電統計數據
    ---
    tags:
      - 風力發電數據
    parameters:
      - name: device_id
        in: path
        type: string
        required: true
        description: 風機設備ID
      - name: period_type
        in: path
        type: string
        enum: ['min', 'hour', 'day', 'mon']
        required: true
        description: 時間週期類型
      - name: date
        in: query
        type: string
        required: false
        description: 查詢日期 (YYYY-MM-DD)
      - name: statistic
        in: query
        type: boolean
        required: false
        description: 是否使用統計模式
    responses:
      200:
        description: 風力發電統計數據
      400:
        description: 無效的請求參數
      500:
        description: 伺服器錯誤
    """
    try:
        logger.info(f"Statistic request for device {device_id} with period {period_type}")
        
        # 參數驗證
        valid_periods = ['min', 'hour', 'day', 'mon']
        if period_type not in valid_periods:
            return jsonify({'error': f'Invalid period type. Valid values are {valid_periods}'}), 400

        # 獲取查詢參數
        query_date = request.args.get('date')
        statistic_type = request.args.get('statistic', 'false').lower() == 'true'
        
        data = WindService.get_wind_statistic_data(device_id, period_type, query_date, statistic_type)
        return jsonify(data)
    
    except ValueError as ve:
        logger.error(f"Validation error: {str(ve)}")
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500