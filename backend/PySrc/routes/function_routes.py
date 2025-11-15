from flask import Blueprint, request, jsonify
from models.function import Function
from extensions import db
import uuid
import logging

function_bp = Blueprint('function', __name__)
logger = logging.getLogger(__name__)

@function_bp.route('/function', methods=['GET'])
def get_functions():
    try:
        logger.info("Received GET request for functions")
        functions = Function.query.all()
        result = [func.to_dict() for func in functions]
        logger.info(f"Returning {len(result)} functions")
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error fetching functions: {str(e)}")
        return jsonify({'error': str(e)}), 500

@function_bp.route('/function', methods=['POST'])
def create_function():
    try:
        data = request.get_json()
        # 確保 data 不為 None
        if data is None:
            return jsonify({'error': 'Invalid JSON data'}), 400
        
        data['uid'] = str(uuid.uuid4())
        
        # 創建新的 Function 對象
        new_function = Function.from_dict(data)
        
        db.session.add(new_function)
        db.session.commit()
        
        return jsonify({
            'uid': new_function.uid,
            'message': 'Function created successfully'
        }), 201
    except Exception as e:
        logger.error(f"Error creating function: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@function_bp.route('/function/<uid>', methods=['GET'])
def get_function(uid):
    try:
        function = Function.query.filter_by(uid=uid).first()
        if not function:
            return jsonify({'error': 'Function not found'}), 404
        return jsonify(function.to_dict())
    except Exception as e:
        logger.error(f"Error fetching function: {str(e)}")
        return jsonify({'error': str(e)}), 500

@function_bp.route('/function/<uid>', methods=['PUT'])
def update_function(uid):
    try:
        function = Function.query.filter_by(uid=uid).first()
        if not function:
            return jsonify({'error': 'Function not found'}), 404

        update_data = request.get_json()
        for key, value in update_data.items():
            setattr(function, key, value)

        db.session.commit()
        
        return jsonify({'message': 'Function updated successfully'})
    except Exception as e:
        logger.error(f"Error updating function: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@function_bp.route('/function/<uid>', methods=['DELETE'])
def delete_function(uid):
    try:
        function = Function.query.filter_by(uid=uid).first()
        if not function:
            return jsonify({'error': 'Function not found'}), 404

        db.session.delete(function)
        db.session.commit()
        
        return jsonify({'message': 'Function deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting function: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 400 