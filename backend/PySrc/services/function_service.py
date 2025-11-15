from flask import Blueprint, request, jsonify
from models.function import Function
from extensions import db
import uuid
import logging

function_service_bp = Blueprint('function_service', __name__)
logger = logging.getLogger(__name__)

def get_function_by_id(uid):
    try:
        return Function.query.filter_by(uid=uid).first()
    except Exception as e:
        logger.error(f"Error getting function: {str(e)}")
        return None

def get_all_functions():
    try:
        return Function.query.all()
    except Exception as e:
        logger.error(f"Error getting all functions: {str(e)}")
        return []

@function_service_bp.route('/api/system/function_service', methods=['GET'])
def get_function_services():
    services = get_all_functions()
    return jsonify([func.to_dict() for func in services])

@function_service_bp.route('/api/system/function_service', methods=['POST'])
def create_function_service():
    try:
        data = request.get_json()
        data['uid'] = str(uuid.uuid4())  # 生成新的 UUID
        new_service = Function.from_dict(data)
        
        db.session.add(new_service)
        db.session.commit()
        
        return jsonify({
            'uid': new_service.uid,
            'message': 'Function service created successfully'
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating function service: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@function_service_bp.route('/api/system/function_service/<uid>', methods=['PUT'])
def update_function_service(uid):
    try:
        service = get_function_by_id(uid)
        if not service:
            return jsonify({'error': 'Function service not found'}), 404

        data = request.get_json()
        data['uid'] = uid
        updated_service = Function.from_dict(data)

        # 更新指定函數
        service.no = updated_service.no
        service.module = updated_service.module
        service.item_cn = updated_service.item_cn
        service.item_en = updated_service.item_en
        service.type = updated_service.type
        service.level = updated_service.level
        service.icon = updated_service.icon
        service.route = updated_service.route

        db.session.commit()
        
        return jsonify({
            'uid': updated_service.uid,
            'message': 'Function service updated successfully'
        })
        
    except Exception as e:
        logger.error(f"Error updating function service: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@function_service_bp.route('/api/system/function_service/<uid>', methods=['DELETE'])
def delete_function_service(uid):
    try:
        service = get_function_by_id(uid)
        if not service:
            return jsonify({'error': 'Function service not found'}), 404

        db.session.delete(service)
        db.session.commit()
        
        return jsonify({'message': 'Function service deleted successfully'})
        
    except Exception as e:
        logger.error(f"Error deleting function service: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 400 