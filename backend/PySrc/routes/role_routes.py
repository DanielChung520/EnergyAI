from flask import Blueprint, request, jsonify
from services.role_service import RoleService, RoleFunctionService
from models.role import Role, RoleFunction
from utils.response import success_response, error_response

role_bp = Blueprint('role', __name__)
role_service = RoleService()

@role_bp.route('/', methods=['POST'])
def create_role():
    data = request.get_json()
    role, error = RoleService.create_role(data)
    if error:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ROLE_CREATE_FAILED',
                'message': error
            }
        }), 400
    return jsonify({
        'success': True,
        'data': {
            'id': role.id,
            'role': role.role
        },
        'message': 'Role created successfully'
    }), 201

@role_bp.route('/', methods=['GET'])
def get_all_roles():
    roles, error = RoleService.get_all_roles()
    if error:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ROLE_FETCH_FAILED',
                'message': error
            }
        }), 500
    return jsonify({
        'success': True,
        'data': [{
            'id': role.id,
            'role': role.role,
            'desc': role.desc,
            'desc_en': role.desc_en,
            'security_level': role.security_level,
            'remark': role.remark,
            'flag': role.flag,
            'create_at': role.create_at.isoformat() if role.create_at else None,
            'update_at': role.update_at.isoformat() if role.update_at else None
        } for role in roles]
    })

@role_bp.route('/<role_id>', methods=['GET'])
def get_role(role_id):
    role, error = RoleService.get_role(role_id)
    if error:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ROLE_NOT_FOUND' if "不存在" in error else 'ROLE_FETCH_FAILED',
                'message': error
            }
        }), 404 if "不存在" in error else 500
    return jsonify({
        'success': True,
        'data': {
            'id': role.id,
            'role': role.role,
            'desc': role.desc,
            'desc_en': role.desc_en,
            'security_level': role.security_level,
            'remark': role.remark,
            'flag': role.flag,
            'create_at': role.create_at.isoformat() if role.create_at else None,
            'update_at': role.update_at.isoformat() if role.update_at else None
        }
    })

@role_bp.route('/<role_id>', methods=['PUT'])
def update_role(role_id):
    data = request.get_json()
    role, error = RoleService.update_role(role_id, data)
    if error:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ROLE_UPDATE_FAILED',
                'message': error
            }
        }), 400
    return jsonify({
        'success': True,
        'data': {
            'id': role.id
        },
        'message': 'Role updated successfully'
    })

@role_bp.route('/<role_id>', methods=['DELETE'])
def delete_role(role_id):
    success, error = RoleService.delete_role(role_id)
    if error:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ROLE_DELETE_FAILED',
                'message': error
            }
        }), 400
    return jsonify({
        'success': True,
        'message': 'Role deleted successfully'
    })

# 角色功能的 CRUD 操作

@role_bp.route('/function', methods=['POST'])
def create_role_function():
    """創建或更新角色的功能權限"""
    try:
        data = request.get_json()
        if not data:
            return error_response('請求數據不能為空')

        role = data.get('role')
        functions = data.get('functions', [])

        if not role:
            return error_response('角色ID不能為空')

        if not isinstance(functions, list):
            return error_response('functions 必須是列表')

        # 調用服務層處理邏輯
        result, error = RoleFunctionService.update_role_functions(role, functions)
        
        if result:
            return success_response(message='角色功能權限更新成功')
        return error_response(error or '角色功能權限更新失敗')
        
    except Exception as e:
        return error_response(str(e))

@role_bp.route('/function', methods=['GET'])
def get_all_role_functions():
    role_functions, error = RoleFunctionService.get_all_role_functions()
    if error:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ROLE_FUNCTION_FETCH_FAILED',
                'message': error
            }
        }), 500
    return jsonify({
        'success': True,
        'data': [{
            'id': role_function.id,
            'role': role_function.role,
            'function': role_function.function,
            'permission': role_function.permission,
            'create_at': role_function.create_at.isoformat() if role_function.create_at else None,
            'update_at': role_function.update_at.isoformat() if role_function.update_at else None
        } for role_function in role_functions]
    })

@role_bp.route('/function/<role_id>', methods=['GET'])
def get_role_functions(role_id):
    """獲取角色的功能權限"""
    try:
        functions, error = RoleFunctionService.get_role_functions(role_id)
        if error:
            return error_response(error)
        return success_response(functions)
    except Exception as e:
        return error_response(str(e))

@role_bp.route('/function/<role_function_id>', methods=['PUT'])
def update_role_function(role_function_id):
    data = request.get_json()
    role_function, error = RoleFunctionService.update_role_function(role_function_id, data)
    if error:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ROLE_FUNCTION_UPDATE_FAILED',
                'message': error
            }
        }), 400
    return jsonify({
        'success': True,
        'data': {
            'id': role_function.id
        },
        'message': 'Role function updated successfully'
    })

@role_bp.route('/function/<role_function_id>', methods=['DELETE'])
def delete_role_function(role_function_id):
    success, error = RoleFunctionService.delete_role_function(role_function_id)
    if error:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ROLE_FUNCTION_DELETE_FAILED',
                'message': error
            }
        }), 400
    return jsonify({
        'success': True,
        'message': 'Role function deleted successfully'
    })
