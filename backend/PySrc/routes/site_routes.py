from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from datetime import datetime
from services.site_service import SiteService
# from utils.csv_handler import CSVHandler
from models.site import Site, SolarSite, WindSite, SiteEquipment, SitePerformance  # 確保導入 SitePerformance
import requests

site_bp = Blueprint('site', __name__)
site_service = SiteService()

@site_bp.route('', methods=['GET', 'POST', 'OPTIONS'])  # 主路由不使用斜線
@cross_origin(supports_credentials=True)
def handle_sites():
    if request.method == 'GET':
        try:
            sites = site_service.get_all_sites()
            print("Retrieved sites:", sites)
            if not sites:
                print("No sites found in database")
            return jsonify(sites)
        except Exception as e:
            print(f"Error in handle_sites GET: {e}")
            return jsonify({'error': str(e)}), 500
    elif request.method == 'POST':
        try:
            site_data = request.json
            print("Received site data:", site_data)
            
            if not site_data:
                return jsonify({
                    'success': False,
                    'error': 'No data received'
                }), 400

            result = site_service.create_site(site_data)
            print("Create site result:", result)
            
            if not result.get('success'):
                return jsonify(result), 400

            return jsonify({
                'success': True,
                'id': result['id'],
                'message': '案場創建成功'
            })
                
        except Exception as e:
            print(f"Error creating site: {e}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    elif request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5500')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

@site_bp.route('/<site_id>', methods=['GET', 'PUT', 'DELETE', 'OPTIONS'])
@cross_origin(supports_credentials=True)
def handle_site(site_id):
    if request.method == 'GET':
        try:
            site = site_service.get_site_by_id(site_id)
            if site:
                # 確保返回字典格式
                return jsonify(site.to_dict() if hasattr(site, 'to_dict') else site)
            return jsonify({'error': 'Site not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500
            
    elif request.method == 'PUT':
        try:
            site_data = request.json
            result = site_service.update_site(site_id, site_data)
            return jsonify(result)
        except Exception as e:
            print(f"Error updating site: {e}")
            return jsonify({'error': str(e)}), 500

    elif request.method == 'DELETE':
        try:
            result = site_service.delete_site(site_id)
            return jsonify(result)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    elif request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:8082')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS')
        return response

@site_bp.route('/<site_id>/wind-details', methods=['GET', 'POST', 'PUT'])
@cross_origin(supports_credentials=True)
def handle_wind_details(site_id):
    """處理風電站詳細信息的獲取、創建和更新"""
    try:
        if request.method == 'GET':
            print(f"Fetching wind details for site ID: {site_id}")
            details = site_service.get_wind_site_details(site_id)
            if details:
                print(f"Found wind details: {details}")
                return jsonify({
                    'site_id': details.site_id,
                    'turbine_model': details.turbine_model,
                    'height': details.height,
                    'air_density': details.air_density,
                    'avg_wind_speed': details.avg_wind_speed,
                    'spring_avg_wind_speed': details.spring_avg_wind_speed,
                    'spring_wind_direction': details.spring_wind_direction,
                    'summer_avg_wind_speed': details.summer_avg_wind_speed,
                    'summer_wind_direction': details.summer_wind_direction,
                    'autumn_avg_wind_speed': details.autumn_avg_wind_speed,
                    'autumn_wind_direction': details.autumn_wind_direction,
                    'winter_avg_wind_speed': details.winter_avg_wind_speed,
                    'winter_wind_direction': details.winter_wind_direction,
                    'remark': details.remark,
                    'created_at': details.created_at,
                    'updated_at': details.updated_at
                })
            else:
                print(f"No wind details found for site ID: {site_id}")
                return jsonify({'error': 'Wind site not found'}), 404

        elif request.method in ['POST', 'PUT']:
            print(f"{request.method} wind details for site ID: {site_id}")
            data = request.json
            print(f"Received data: {data}")
            
            # 验证必要字段
            required_fields = ['turbine_model', 'height', 'air_density', 'avg_wind_speed']
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                error_msg = f"Missing required fields: {', '.join(missing_fields)}"
                print(error_msg)
                return jsonify({'error': error_msg}), 400

            try:
                # 确保数值字段为数值类型
                numeric_fields = ['height', 'air_density', 'avg_wind_speed', 
                                'spring_avg_wind_speed', 'summer_avg_wind_speed', 
                                'autumn_avg_wind_speed', 'winter_avg_wind_speed']
                for field in numeric_fields:
                    if field in data and data[field]:
                        data[field] = float(data[field])
            except ValueError as ve:
                error_msg = f"Invalid numeric value: {str(ve)}"
                print(error_msg)
                return jsonify({'error': error_msg}), 400

            data['site_id'] = site_id
            
            try:
                if request.method == 'POST':
                    print("Creating new wind details")
                    result = site_service.create_wind_site_details(site_id, data)
                else:  # PUT
                    print("Updating existing wind details")
                    result = site_service.update_wind_site_details(site_id, data)
                
                print(f"Operation result: {result}")
                
                if result.get('success'):
                    return jsonify(result.get('data')), 200
                else:
                    error_msg = result.get('error', 'Unknown error occurred')
                    print(f"Operation failed: {error_msg}")
                    return jsonify({'error': error_msg}), 400
            except Exception as e:
                print(f"Database operation failed: {str(e)}")
                return jsonify({'error': f"Database operation failed: {str(e)}"}), 500

    except Exception as e:
        import traceback
        print(f"Error in handle_wind_details: {e}")
        print("Traceback:")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@site_bp.route('/<site_id>/solar-details', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def handle_solar_site_details(site_id):
    if request.method == 'GET':
        try:
            details = site_service.get_solar_site_details(site_id)
            if details:
                return jsonify({
                    'site_id': details.site_id,
                    'module_type': details.module_type,
                    'bracket_height': details.bracket_height,
                    'annual_sunlight': details.annual_sunlight,
                    'output_voltage': details.output_voltage,
                    'inverter_output': details.inverter_output,
                    'ground_direction': details.ground_direction,
                    'sunlight_direction': details.sunlight_direction,
                    'avg_temperature': details.avg_temperature,
                    'avg_rainfall': details.avg_rainfall,
                    'avg_wind_speed': details.avg_wind_speed,
                    'remark': details.remark,
                    'created_at': details.created_at,
                    'updated_at': details.updated_at
                })
            else:
                return jsonify({'error': 'Solar site not found'}), 404
        except Exception as e:
            print(f"Error in get_solar_site_details: {e}")
            return jsonify({'error': str(e)}), 500
    elif request.method == 'POST':
        try:
            details_data = request.json
            result = site_service.create_solar_site_details(site_id, details_data)
            return jsonify(result)
        except Exception as e:
            print(f"Error in create_solar_site_details: {e}")
            return jsonify({'error': str(e)}), 500
    elif request.method == 'PUT':
        try:
            details_data = request.json
            result = site_service.update_solar_site_details(site_id, details_data)
            return jsonify(result)
        except Exception as e:
            print(f"Error updating solar site details: {e}")
            return jsonify({'error': str(e)}), 500
    elif request.method == 'DELETE':
        try:
            result = site_service.delete_solar_site_details(site_id)
            return jsonify(result)
        except Exception as e:
            print(f"Error deleting solar site details: {e}")
            return jsonify({'error': str(e)}), 500

@site_bp.route('/<site_id>/performance', methods=['GET'])
def handle_get_site_performance(site_id):
    """獲取特定站點的性能記錄"""
    try:
        performances = site_service.get_site_performance_by_id(site_id)
        return jsonify([{
            'site_id': performance.site_id,
            'year_mon': performance.year_mon,
            'output_ttl': performance.output_ttl,
            'output_avg': performance.output_avg
        } for performance in performances])
    except Exception as e:
        print(f"Error getting site performance: {e}")
        return jsonify({'error': str(e)}), 500

@site_bp.route('/<site_id>/performance', methods=['POST'])
def handle_create_site_performance(site_id):
    """創建新的站點性能記錄"""
    try:
        performance_data = request.json
        performance_data['id'] = site_id  # 確保使用正確的 site_id
        result = site_service.create_site_performance(performance_data)
        return jsonify(result)
    except Exception as e:
        print(f"Error creating site performance: {e}")
        return jsonify({'error': str(e)}), 500

@site_bp.route('/performance/<performance_id>', methods=['DELETE'])
def handle_delete_site_performance(performance_id):
    """刪除特定站點的性能記錄"""
    try:
        result = site_service.delete_site_performance(performance_id)
        return jsonify(result)
    except Exception as e:
        print(f"Error deleting site performance: {e}")
        return jsonify({'error': str(e)}), 500

# OPTIONS 請求處理
@site_bp.route('/', methods=['OPTIONS'])
def handle_sites_options():
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

@site_bp.route('/<site_id>/solar-details', methods=['OPTIONS'])
def handle_solar_details_options(site_id):
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

@site_bp.route('/<site_id>/equipments', methods=['GET', 'POST'])
def handle_site_equipments(site_id):
    if request.method == 'GET':
        try:
            equipments = site_service.get_site_equipments(site_id)
            return jsonify([{
                'id': equip.id,
                'equip_id': equip.equip_id,
                'name': equip.name,
                'model_no': equip.model_no,
                'asset_no': equip.asset_no,
                'purchase_date': equip.purchase_date,
                'operat_date': equip.operat_date,
                'location': equip.location,
                'backup': equip.backup,
                'status': equip.status,
                'remark': equip.remark,
                'created_at': equip.created_at,
                'updated_at': equip.updated_at
            } for equip in equipments])
        except Exception as e:
            print(f"Error getting site equipments: {e}")
            return jsonify({'error': str(e)}), 500

    elif request.method == 'POST':
        try:
            equipment_data = request.json
            equipment_data['site_id'] = site_id
            
            # 验证必要字段
            required_fields = ['equip_id', 'name', 'model_no', 'asset_no', 'purchase_date', 'operat_date', 'location', 'backup', 'status']
            missing_fields = [field for field in required_fields if field not in equipment_data]
            if missing_fields:
                return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
                
            result = site_service.create_site_equipment(equipment_data)
            return jsonify(result)
        except Exception as e:
            print(f"Error creating site equipment: {e}")
            return jsonify({'error': str(e)}), 500

@site_bp.route('/equipments/<equipment_id>', methods=['DELETE'])
def handle_delete_site_equipment(equipment_id):
    try:
        result = site_service.delete_site_equipment(equipment_id)
        return jsonify(result)
    except Exception as e:
        print(f"Error deleting site equipment: {e}")
        return jsonify({'error': str(e)}), 500

@site_bp.route('/equipments/<equipment_id>', methods=['GET'])
def handle_get_site_equipment(equipment_id):
    """查詢設備信息"""
    try:
        equipment = site_service.get_site_equipment_by_id(equipment_id)
        if equipment:
            return jsonify({
                'id': equipment.id,
                'site_id': equipment.site_id,
                'equip_id': equipment.equip_id,
                'model_no': equipment.model_no,
                'asset_no': equipment.asset_no,
                'purchase_date': equipment.purchase_date,
                'operat_date': equipment.operat_date,
                'location': equipment.location,
                'backup': equipment.backup,
                'status': equipment.status,
                'remark': equipment.remark,
                'created_at': equipment.created_at,
                'updated_at': equipment.updated_at
            })
        else:
            return jsonify({'error': 'Equipment not found'}), 404
    except Exception as e:
        print(f"Error getting site equipment: {e}")
        return jsonify({'error': str(e)}), 500

@site_bp.route('/equipments/<equipment_id>', methods=['PUT'])
def handle_update_site_equipment(equipment_id):
    """更新設備信息"""
    try:
        equipment_data = request.json
        
        # 验证必要字段
        required_fields = ['equip_id', 'model_no', 'asset_no', 'purchase_date', 'operat_date', 'location', 'backup', 'status']
        missing_fields = [field for field in required_fields if field not in equipment_data]
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
            
        result = site_service.update_site_equipment(equipment_id, equipment_data)
        return jsonify(result)
    except Exception as e:
        print(f"Error updating site equipment: {e}")
        return jsonify({'error': str(e)}), 500

@site_bp.route('/<site_id>/performance', methods=['OPTIONS'])
def handle_performance_options(site_id):
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
    return response

@site_bp.route('/<site_id>/performance/<int:year>', methods=['GET'])
def handle_get_site_performance_by_year(site_id, year):
    """根據站點 ID 和年份獲取性能記錄"""
    try:
        # 構建年份和月份的格式
        year_mon_start = f"{year}-01"
        year_mon_end = f"{year}-12"
        
        # 查詢性能記錄
        performances = site_service.get_site_performance_by_year(site_id, year_mon_start, year_mon_end)
        return jsonify([{
            'site_id': performance.site_id,
            'year_mon': performance.year_mon,
            'output_ttl': performance.output_ttl,
            'output_avg': performance.output_avg
        } for performance in performances])
    except Exception as e:
        print(f"Error getting site performance by year: {e}")
        return jsonify({'error': str(e)}), 500

@site_bp.route('/geocode', methods=['GET'])
@cross_origin()
def geocode():
    address = request.args.get('address')
    if not address:
        return jsonify({'error': 'Address is required'}), 400

    try:
        print(f"Geocoding address: {address}")
        
        # 嘗試多種地址格式
        addresses_to_try = [
            address,
            address.replace(' ', ''),  # 移除所有空格
            f"{address}, Taiwan"  # 添加國家名稱
        ]
        
        for addr in addresses_to_try:
            response = requests.get(
                'https://nominatim.openstreetmap.org/search',
                params={
                    'format': 'json',
                    'q': addr,
                    'accept-language': 'zh-TW',
                    'countrycodes': 'tw'  # 限制在台灣範圍內搜索
                },
                headers={
                    'Accept-Language': 'zh-TW',
                    'User-Agent': 'YourApp/1.0'
                }
            )
            response.raise_for_status()
            result = response.json()
            print(f"Nominatim response for {addr}: {result}")
            
            if result:
                return jsonify(result)
        
        # 如果所有嘗試都失敗，返回空數組
        return jsonify([]), 200
            
    except requests.RequestException as e:
        print(f"Geocoding error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@site_bp.route('/equipments/list', methods=['GET'])
def handle_get_equip_list():
    """查詢設備列表"""
    try:
        asset_no = request.args.get('asset_no')
        site_id = request.args.get('site_id')
        
        # 獲取設備列表（已經是字典列表）
        equip_list = site_service.get_equip_list_by_asset_or_site(asset_no, site_id)
        
        # 直接返回結果，因為 service 層已經轉換為字典
        return jsonify(equip_list)
    except Exception as e:
        print(f"Error getting equip list: {e}")
        return jsonify({'error': str(e)}), 500

@site_bp.route('/equipments/list/all', methods=['GET'])
def handle_get_all_equip_list():
    """獲取所有設備列表"""
    try:
        equip_list = site_service.get_all_equip_list()
        return jsonify([equip.to_dict() for equip in equip_list])
    except Exception as e:
        print(f"Error getting all equip list: {e}")
        return jsonify({'error': str(e)}), 500

@site_bp.route('/equipments/list_bySiteId', methods=['GET'])
def handle_get_equip_list_bySiteId():
    """根據站點 ID 查詢設備列表"""
    try:
        site_id = request.args.get('site_id')
        if not site_id:
            return jsonify({'error': 'site_id is required'}), 400
            
        # 添加調試日誌
        print(f"Route received site_id: {site_id}")
        
        # 獲取設備列表
        equip_list = site_service.get_equip_list_bySiteId(site_id)
        
        # 添加調試日誌
        print(f"Route returning results count: {len(equip_list)}")
        
        return jsonify(equip_list)
    except Exception as e:
        print(f"Error getting equip list by site: {e}")
        return jsonify({'error': str(e)}), 500

@site_bp.route('/equipments/list_byEquipId', methods=['GET'])
def handle_get_equip_list_byEquipId():
    """根據設備 ID 查詢設備列表"""
    try:
        equip_id = request.args.get('equip_id')
        if not equip_id:
            return jsonify({'error': 'equip_id is required'}), 400
            
        # 添加調試日誌
        print(f"Route received equip_id: {equip_id}")
        
        # 獲取設備列表
        equip_list = site_service.get_equip_list_byEquipId(equip_id)
        
        # 添加調試日誌
        print(f"Route returning results count: {len(equip_list)}")
        
        return jsonify(equip_list)
    except Exception as e:
        print(f"Error getting equip list by equipment: {e}")
        return jsonify({'error': str(e)}), 500