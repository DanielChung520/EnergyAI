from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from services.equipment_service import EquipmentService


equipment_bp = Blueprint('equipment', __name__)
equipment_service = EquipmentService()
# solar_equipment_service = SolarEquipmentService()

@equipment_bp.route('/', methods=['GET'])
@cross_origin()
def get_equipments():
    """獲取所有設備列表"""
    try:
        equipments = equipment_service.get_all_equipments()
        return jsonify([{
            'id': equip.id,
            'model_no': equip.model_no,
            'desc_cn': equip.desc_cn,
            'desc_en': equip.desc_en,
            'equ_type': equip.equ_type,
            'power': equip.power,
            'voltage': equip.voltage,
            'useful_life': equip.useful_life,
            'iso14064': equip.iso14064,
            'iso14001': equip.iso14001,
            'remark': equip.remark
        } for equip in equipments])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@equipment_bp.route('/<equipment_id>', methods=['GET'])
@cross_origin()
def get_equipment(equipment_id):
    """獲取特定設備"""
    try:
        equipment = equipment_service.get_equipment(equipment_id)
        if equipment:
            return jsonify({
                'id': equipment.id,
                'model_no': equipment.model_no,
                'desc_cn': equipment.desc_cn,
                'desc_en': equipment.desc_en,
                'equ_type': equipment.equ_type,
                'power': equipment.power,
                'voltage': equipment.voltage,
                'useful_life': equipment.useful_life,
                'iso14064': equipment.iso14064,
                'iso14001': equipment.iso14001,
                'remark': equipment.remark
            })
        return jsonify({'error': 'Equipment not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@equipment_bp.route('/', methods=['POST'])
@cross_origin()
def create_equipment():
    """創建新設備"""
    try:
        equipment_data = request.json
        print("Received equipment data:", equipment_data)  # 添加請求數據日誌
        
        result = equipment_service.create_equipment(equipment_data)
        print("Create equipment result:", result)  # 添加結果日誌
        
        if result.get('success'):
            return jsonify(result)
        else:
            return jsonify({'error': result.get('error', 'Unknown error')}), 500
    except Exception as e:
        print(f"Error in create_equipment route: {str(e)}")  # 添加錯誤日誌
        return jsonify({'error': str(e)}), 500

@equipment_bp.route('/<equipment_id>', methods=['PUT'])
@cross_origin()
def update_equipment(equipment_id):
    """更新設備"""
    try:
        equipment_data = request.json
        result = equipment_service.update_equipment(equipment_id, equipment_data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@equipment_bp.route('/<equipment_id>', methods=['DELETE'])
@cross_origin(supports_credentials=True)
def delete_equipment(equipment_id):
    """刪除設備"""
    try:
        print(f"正在删除设备 ID: {equipment_id}")
        result = equipment_service.delete_equipment(equipment_id)
        print(f"删除设备结果: {result}")
        if result.get('success'):
            return jsonify(result), 200
        return jsonify(result), 400
    except Exception as e:
        print(f"删除设备时发生错误: {str(e)}")
        return jsonify({'error': str(e), 'success': False}), 500

@equipment_bp.route('/<equipment_id>/wind-details', methods=['GET', 'POST', 'PUT', 'DELETE'])
@cross_origin()
def handle_wind_equipment_details(equipment_id):
    """處理風機設備詳細資料的所有操作"""
    try:
        if request.method == 'GET':
            detail = equipment_service.get_wind_equipment_detail(equipment_id)
            if detail:
                return jsonify({
                    'equipment_id': detail.equipment_id,
                    'model_no': detail.model_no,
                    'efficiency': detail.efficiency,
                    'wind_speed_range_from': detail.wind_speed_range_from,
                    'wind_speed_range_to': detail.wind_speed_range_to,
                    'rpm_range_from': detail.rpm_range_from,
                    'rpm_range_to': detail.rpm_range_to,
                    'pole_height': detail.pole_height,
                    'base_height': detail.base_height,
                    'blade_diameter': detail.blade_diameter,
                    'type': detail.type,
                    'location_type': detail.location_type,
                    'durability_range_from': detail.durability_range_from,
                    'durability_range_to': detail.durability_range_to,
                    'created_at': detail.created_at,
                    'updated_at': detail.updated_at
                })
            return jsonify({'error': 'Wind equipment detail not found'}), 404

        elif request.method == 'POST':
            detail_data = request.json
            detail_data['equipment_id'] = equipment_id  # 添加 equipment_id 到 detail_data
            result = equipment_service.create_wind_equipment_detail(detail_data)
            return jsonify(result)

        elif request.method == 'PUT':
            detail_data = request.json
            result = equipment_service.update_wind_equipment_detail(equipment_id, detail_data)
            return jsonify(result)

        elif request.method == 'DELETE':
            result = equipment_service.delete_wind_equipment_detail(equipment_id)
            return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@equipment_bp.route('/', methods=['OPTIONS'])
@cross_origin()
def handle_equipment_options():
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
    return response

@equipment_bp.route('/<equipment_id>/solar-details', methods=['GET', 'POST', 'PUT', 'DELETE'])
@cross_origin()
def handle_solar_equipment_details(equipment_id):
    """處理太陽能設備詳細資料的所有操作"""
    try:
        if request.method == 'GET':
            details = equipment_service.get_solar_equipment_detail(equipment_id)
            if details:
                return jsonify({
                    'equipment_id': details.equipment_id,
                    'model_no': details.model_no,
                    'efficiency': details.efficiency,
                    'dimensions': details.dimensions,
                    'type': details.type,
                    'durability_range_from': details.durability_range_from,
                    'durability_range_to': details.durability_range_to
                })
            return jsonify({'error': 'Solar equipment details not found'}), 404
        elif request.method == 'POST':
            detail_data = request.json
            detail_data['equipment_id'] = equipment_id  # 添加 equipment_id
            result = equipment_service.create_solar_equipment_detail(detail_data)
            return jsonify(result)
        elif request.method == 'PUT':
            detail_data = request.json
            result = equipment_service.update_solar_equipment_detail(equipment_id, detail_data)
            return jsonify(result)
        elif request.method == 'DELETE':
            result = equipment_service.delete_solar_equipment_detail(equipment_id)
            return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@equipment_bp.route('/<equipment_id>/solar-details', methods=['OPTIONS'])
@cross_origin()
def handle_solar_equipment_options(equipment_id):
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    return response

@equipment_bp.route('/solar-details', methods=['GET'])
@cross_origin()
def get_all_solar_equipment_details():
    """獲取所有太陽能設備詳細資料"""
    try:
        details = equipment_service.get_all_solar_equipment_details()  # 確保這裡調用正確的服務
        return jsonify([{
            'equipment_id': detail.equipment_id,
            'model_no': detail.model_no,
            'efficiency': detail.efficiency,
            'dimensions': detail.dimensions,
            'type': detail.type,
            'durability_range_from': detail.durability_range_from,
            'durability_range_to': detail.durability_range_to
        } for detail in details])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@equipment_bp.route('/wind-details', methods=['GET'])
@cross_origin()
def get_all_wind_equipment_details():
    """獲取所有風機設備詳細資料"""
    try:
        details = equipment_service.get_all_wind_equipment_details()
        return jsonify([{
            'equipment_id': detail.equipment_id,
            'model_no': detail.model_no,
            'efficiency': detail.efficiency,
            'wind_speed_range_from': detail.wind_speed_range_from,
            'wind_speed_range_to': detail.wind_speed_range_to,
            'rpm_range_from': detail.rpm_range_from,
            'rpm_range_to': detail.rpm_range_to,
            'pole_height': detail.pole_height,
            'base_height': detail.base_height,
            'blade_diameter': detail.blade_diameter,
            'type': detail.type,
            'location_type': detail.location_type,
            'durability_range_from': detail.durability_range_from,
            'durability_range_to': detail.durability_range_to,
            'created_at': detail.created_at,
            'updated_at': detail.updated_at
        } for detail in details])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@equipment_bp.route('/<equipment_id>/wind-details', methods=['DELETE'])
@cross_origin(supports_credentials=True)
def delete_wind_equipment_detail(equipment_id):
    """刪除風機設備詳細資料"""
    try:
        print(f"正在删除风机设备明细，ID: {equipment_id}")
        result = equipment_service.delete_wind_equipment_detail(equipment_id)
        print(f"删除风机设备明细结果: {result}")
        if result.get('success'):
            return jsonify(result), 200
        return jsonify(result), 400
    except Exception as e:
        print(f"删除风机设备明细时发生错误: {str(e)}")
        return jsonify({'error': str(e), 'success': False}), 500

@equipment_bp.route('/<equipment_id>/solar-details', methods=['DELETE'])
@cross_origin(supports_credentials=True)
def delete_solar_equipment_detail(equipment_id):
    """刪除太陽能設備詳細資料"""
    try:
        print(f"正在删除太阳能设备明细，ID: {equipment_id}")
        result = equipment_service.delete_solar_equipment_detail(equipment_id)
        print(f"删除太阳能设备明细结果: {result}")
        if result.get('success'):
            return jsonify(result), 200
        return jsonify(result), 400
    except Exception as e:
        print(f"删除太阳能设备明细时发生错误: {str(e)}")
        return jsonify({'error': str(e), 'success': False}), 500 