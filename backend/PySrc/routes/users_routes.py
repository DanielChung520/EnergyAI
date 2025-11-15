from flask import Blueprint, jsonify, request, current_app
from models.users import User
from services.users_service import UserService
import logging
from sqlalchemy import text
from extensions import db
import jwt as pyjwt
from datetime import datetime, timedelta
from functools import wraps

logger = logging.getLogger(__name__)

users_bp = Blueprint('users', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
            
        try:
            data = pyjwt.decode(
                token, 
                current_app.config['SECRET_KEY'], 
                algorithms=["HS256"]
            )
            current_user = UserService.get_user(data['userid'])
            if not current_user:
                return jsonify({'error': 'Invalid token'}), 401
        except pyjwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except pyjwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

@users_bp.route('/', methods=['GET'])
def users_list():
    try:
        logger.info("Processing GET request for all users")
        users = UserService.get_all_users()
        return jsonify({
            'success': True,
            'data': [user.to_dict() for user in users]
        })
    except Exception as e:
        logger.error(f"Error in get_all_users: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@users_bp.route('/', methods=['POST'])
def create_user():
    try:
        user_data = request.json
        # 檢查必需的字段
        if not user_data.get('userid') or not user_data.get('password'):
            return jsonify({'error': 'userid and password are required'}), 400
        
        # 驗證角色值（如果提供）
        if 'role' in user_data and user_data['role'] not in ['1', '2', '3','4']:
            return jsonify({'error': 'Invalid role value'}), 400
        
        user = UserService.create_user(user_data)
        return jsonify({
            'uuid': user.uuid,
            'userid': user.userid,
            'role': user.role,
            'message': 'User created successfully'
        }), 201
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 400

@users_bp.route('/<string:user_id>', methods=['GET', 'PUT', 'DELETE'])
def user_operations(user_id):
    if request.method == 'GET':
        try:
            logger.info(f"Processing GET request for user_id: {user_id}")
            user = UserService.get_user(user_id)
            if user:
                return jsonify({'error': '用戶名已存在'}), 400  # 返回錯誤，表示用戶名已存在
            return jsonify({'success': True}), 200  # 用戶名不存在
        except Exception as e:
            logger.error(f"Error in get_user: {str(e)}", exc_info=True)
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'PUT':
        try:
            user_data = request.json
            
            # 驗證角色值（如果提供）
            if 'role' in user_data and user_data['role'] not in ['1', '2', '3','4']:
                return jsonify({'error': 'Invalid role value'}), 400
            
            user = UserService.update_user(user_id, user_data)
            if user:
                return jsonify({
                    'message': 'User updated successfully',
                    'user': user.to_dict()
                })
            return jsonify({'error': 'User not found'}), 404
        except Exception as e:
            logger.error(f"Error in update_user route: {str(e)}")
            return jsonify({'error': str(e)}), 400
            
    elif request.method == 'DELETE':
        try:
            user = UserService.delete_user(user_id)
            if user:
                return jsonify({'message': 'User deleted successfully'})
            return jsonify({'error': 'User not found'}), 404
        except Exception as e:
            logger.error(f"Error in delete_user: {str(e)}", exc_info=True)
            return jsonify({'error': str(e)}), 400

@users_bp.route('/auth/login', methods=['POST', 'OPTIONS'])
def login():
    try:
        auth = request.json
        logger.debug(f"Login attempt - Username: {auth.get('username')}")
        
        user = UserService.get_user(auth.get('username'))
        logger.debug(f"Found user: {user.to_dict() if user else None}")
        
        if not user:
            return jsonify({'error': '用戶不存在'}), 404
            
        is_valid = UserService.verify_password(user, auth.get('password'))
        logger.debug(f"Password verification result: {is_valid}")
        
        if is_valid:
            token = pyjwt.encode(
                {
                    'userid': user.userid,
                    'exp': datetime.utcnow() + timedelta(hours=24)
                },
                current_app.config['SECRET_KEY'],
                algorithm="HS256"
            )
            
            return jsonify({
                'success': True,
                'token': token,
                'user': user.to_dict()
            })
            
        return jsonify({'error': '密碼錯誤'}), 401
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@users_bp.route('/auth/validate', methods=['GET'])
@token_required
def validate_token(current_user):
    return jsonify({
        'valid': True,
        'user': current_user.to_dict()
    })

@users_bp.route('/auth/register', methods=['POST'])
def register():
    try:
        user_data = request.form.to_dict()
        avatar = request.files.get('avatar')
        
        if avatar:
            # 處理頭像上傳邏輯
            pass
            
        user = UserService.create_user(user_data)
        
        token = pyjwt.encode(
            {
                'userid': user.userid,
                'exp': datetime.utcnow() + timedelta(hours=24)
            },
            current_app.config['SECRET_KEY'],
            algorithm="HS256"
        )
        
        return jsonify({
            'success': True,
            'token': token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"Registration error: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 400

@users_bp.route('/auth/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    try:
        data = request.json
        current_password = data.get('currentPassword')
        new_password = data.get('newPassword')
        
        if not current_password or not new_password:
            return jsonify({'error': '缺少必要參數'}), 400
            
        if not UserService.verify_password(current_user, current_password):
            return jsonify({'error': '當前密碼錯誤'}), 401
            
        UserService.update_password(current_user, new_password)
        return jsonify({'message': '密碼修改成功'})
        
    except Exception as e:
        logger.error(f"Password change error: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 400

@users_bp.route('/reset-password/<string:user_id>', methods=['POST'])
def reset_password(user_id):
    try:
        data = request.json
        new_password = data.get('newPassword')
        user = UserService.get_user(user_id)
        if user:
            UserService.update_password(user, new_password)  # 更新用戶密碼
            return jsonify({'message': '密碼已成功重置'}), 200
        return jsonify({'error': '用戶未找到'}), 404
    except Exception as e:
        logger.error(f"Error resetting password: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 400
