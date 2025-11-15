from flask import Blueprint, jsonify, request, current_app
from models.sys import SystemSetting, SystemSettingHistory
from services.sys_service import SysService
import logging
from sqlalchemy import text
from extensions import db
import jwt as pyjwt
from datetime import datetime, timedelta
from functools import wraps

logger = logging.getLogger(__name__)

sys_bp = Blueprint('sys', __name__)

@sys_bp.route('/settings', methods=['GET'])
def get_settings():
    """獲取所有系統設置"""
    try:
        settings = SysService.get_all_settings()
        return jsonify(settings)
    except Exception as e:
        logger.error(f"獲取設置失敗: {str(e)}")
        return jsonify({'error': str(e)}), 500

@sys_bp.route('/settings/<category>', methods=['POST'])
def update_settings(category):
    """更新指定類別的設置"""
    try:
        data = request.get_json()
        settings = data.get('settings', {})
        user = request.headers.get('X-User-Name', 'system')  # 從請求頭獲取用戶信息

        SysService.update_settings(category, settings, user)
        return jsonify({'message': '設置更新成功'})
    except Exception as e:
        logger.error(f"更新設置失敗: {str(e)}")
        return jsonify({'error': str(e)}), 500

@sys_bp.route('/settings/history', methods=['GET'])
def get_settings_history():
    """獲取設置修改歷史"""
    try:
        category = request.args.get('category')
        limit = int(request.args.get('limit', 100))
        history = SysService.get_settings_history(category, limit)
        return jsonify([h.to_dict() for h in history])
    except Exception as e:
        logger.error(f"獲取設置歷史失敗: {str(e)}")
        return jsonify({'error': str(e)}), 500

