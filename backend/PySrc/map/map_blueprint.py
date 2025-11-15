from flask import Blueprint, jsonify, request
from map.map_model import MapRegion, Region, Country
import json
import os
from datetime import datetime
import logging

# 設置日誌
logger = logging.getLogger(__name__)

# 創建藍圖
map_bp = Blueprint('map', __name__)

# 配置文件路徑
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MAP_REGION_FILE = os.path.join(CURRENT_DIR, 'map_region.json')
REGION_FILE = os.path.join(CURRENT_DIR, 'region.json')
COUNTRIES_FILE = os.path.join(CURRENT_DIR, '../data/countries.json')

def load_regions():
    """加載區域定義數據"""
    try:
        with open(REGION_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            regions = {}
            for r in data['regions']:
                region = Region(
                    id=r['id'],
                    name=r['name'],
                    name_en=r['name_en'],  # 更新為 name_en
                    division=r['division'],
                    bu=r['bu'],  # 新增 bu
                    sort_no=r['sort_no'],
                    continents=r['continents']  # 新增 continents
                )
                regions[r['id']] = region
            return regions
    except Exception as e:
        logger.error(f'加載區域定義失敗: {str(e)}')
        return {}

def load_map_regions():
    """加載地圖區域數據"""
    try:
        with open(MAP_REGION_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return {r['path_id']: MapRegion.from_dict(r) for r in data['regions']}
    except Exception as e:
        logger.error(f'加載地圖區域失敗: {str(e)}')
        return {}

def save_map_regions(regions):
    """保存地圖區域數據"""
    try:
        data = {'regions': [r.to_dict() for r in regions.values()]}
        with open(MAP_REGION_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        logger.error(f'保存地圖區域失敗: {str(e)}')
        return False

def save_regions(regions):
    """保存區域數據"""
    try:
        data = {'regions': [r.to_dict() for r in regions.values()]}
        with open(REGION_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        logger.error(f'保存區域數據失敗: {str(e)}')
        return False

@map_bp.route('/regions', methods=['GET'])
def get_regions():
    """獲取所有區域定義"""
    try:
        regions = load_regions()
        return jsonify({'regions': [r.to_dict() for r in regions.values()]})
    except Exception as e:
        logger.error(f'獲取區域定義失敗: {str(e)}')
        return jsonify({'error': str(e)}), 500

@map_bp.route('/map-regions', methods=['GET'])
def get_map_regions():
    """獲取所有地圖區域"""
    try:
        regions = load_regions()
        map_regions = load_map_regions()
        
        # 合併區域信息
        result = []
        for mr in map_regions.values():
            region_info = regions.get(mr.region_id)
            map_region_dict = mr.to_dict()
            if region_info:
                map_region_dict['region_name'] = region_info.name
                map_region_dict['division'] = region_info.division
                map_region_dict['bu'] = region_info.bu  # 新增 bu
                map_region_dict['continents'] = region_info.continents  # 新增 continents
            result.append(map_region_dict)
            
        return jsonify({'regions': result})
    except Exception as e:
        logger.error(f'獲取地圖區域失敗: {str(e)}')
        return jsonify({'error': str(e)}), 500

@map_bp.route('/map-regions/<path_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_map_region(path_id):
    """處理單個地圖區域的操作"""
    try:
        map_regions = load_map_regions()
        
        if request.method == 'GET':
            if path_id not in map_regions:
                return jsonify({'error': '區域不存在'}), 404
            return jsonify(map_regions[path_id].to_dict())
            
        elif request.method == 'PUT':
            if not request.is_json:
                return jsonify({'error': '請求必須是JSON格式'}), 400
                
            data = request.get_json()
            region = map_regions.get(path_id)
            
            # 如果區域不存在，創建新的區域
            if not region:
                region = MapRegion(
                    path_id=path_id,
                    region_id=data.get('region_id', ''),
                    country=data.get('country', ''),
                    responsable=data.get('responsable', ''),
                    contact=data.get('contact', ''),
                    coordinates=data.get('coordinates', []),
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                map_regions[path_id] = region
                print(f"創建新的區域: {region.to_dict()}")
            else:
                # 更新現有區域
                region.region_id = data.get('region_id', region.region_id)
                region.country = data.get('country', region.country)
                region.responsable = data.get('responsable', region.responsable)
                region.contact = data.get('contact', region.contact)
                region.coordinates = data.get('coordinates', region.coordinates)
                region.updated_at = datetime.now()
                print(f"更新現有區域: {region.to_dict()}")
            if save_map_regions(map_regions):
                return jsonify(region.to_dict())
            return jsonify({'error': '保存失敗'}), 500
            
        elif request.method == 'DELETE':
            if path_id not in map_regions:
                return jsonify({'error': '區域不存在'}), 404
                
            del map_regions[path_id]
            if save_map_regions(map_regions):
                return jsonify({'message': '刪除成功'})
            return jsonify({'error': '保存失敗'}), 500
            
    except Exception as e:
        logger.error(f'處理地圖區域失敗: {str(e)}')
        return jsonify({'error': str(e)}), 500

@map_bp.route('/map-regions', methods=['POST'])
def create_map_region():
    """創建新的地圖區域"""
    try:
        if not request.is_json:
            return jsonify({'error': '請求必須是JSON格式'}), 400
            
        data = request.get_json()
        map_regions = load_map_regions()
        
        # 創建新的地圖區域
        new_region = MapRegion(
            path_id=data['path_id'],
            region_id=data.get('region_id', ''),
            country=data.get('country', ''),
            responsable=data.get('responsable', ''),
            contact=data.get('contact', ''),
            coordinates=data.get('coordinates', [])
        )
        
        map_regions[new_region.path_id] = new_region
        if save_map_regions(map_regions):
            return jsonify(new_region.to_dict()), 201
        return jsonify({'error': '保存失敗'}), 500
        
    except Exception as e:
        logger.error(f'創建地圖區域失敗: {str(e)}')
        return jsonify({'error': str(e)}), 500

@map_bp.route('/map-regions/by-region/<region_id>', methods=['GET'])
def get_map_regions_by_region(region_id):
    """獲取特定區域的所有地圖區域"""
    try:
        map_regions = load_map_regions()
        filtered_regions = [
            r.to_dict() for r in map_regions.values()
            if r.region_id == region_id
        ]
        return jsonify({'regions': filtered_regions})
    except Exception as e:
        logger.error(f'獲取區域 {region_id} 的地圖區域失敗: {str(e)}')
        return jsonify({'error': str(e)}), 500

@map_bp.route('/map-regions/batch', methods=['PUT'])
def batch_update_map_regions():
    """批量更新地圖區域"""
    try:
        if not request.is_json:
            return jsonify({'error': '請求必須是JSON格式'}), 400
            
        data = request.get_json()
        if 'updates' not in data:
            return jsonify({'error': '缺少 updates 字段'}), 400
            
        map_regions = load_map_regions()
        updated_count = 0
        
        for update in data['updates']:
            path_id = update.get('path_id')
            if path_id in map_regions:
                region = map_regions[path_id]
                region.region_id = update.get('region_id', region.region_id)
                region.country = update.get('country', region.country)
                region.responsable = update.get('responsable', region.responsable)
                region.contact = update.get('contact', region.contact)
                region.updated_at = datetime.now()
                updated_count += 1
        
        if updated_count > 0 and save_map_regions(map_regions):
            return jsonify({
                'message': f'成功更新 {updated_count} 個地圖區域',
                'updated_count': updated_count
            })
        return jsonify({'error': '保存失敗'}), 500
        
    except Exception as e:
        logger.error(f'批量更新地圖區域失敗: {str(e)}')
        return jsonify({'error': str(e)}), 500

@map_bp.route('/map-regions/<path_id>/reset', methods=['PUT'])
def reset_map_region(path_id):
    """重置地圖區域的區域歸屬"""
    try:
        map_regions = load_map_regions()
        if path_id not in map_regions:
            return jsonify({'error': '區域不存在'}), 404
            
        region = map_regions[path_id]
        region.region_id = ''
        region.country = ''
        region.updated_at = datetime.now()
        
        if save_map_regions(map_regions):
            return jsonify(region.to_dict())
        return jsonify({'error': '保存失敗'}), 500
        
    except Exception as e:
        logger.error(f'重置地圖區域失敗: {str(e)}')
        return jsonify({'error': str(e)}), 500

@map_bp.route('/regions/<region_id>', methods=['GET'])
def get_region_by_id(region_id):
    """根據 ID 獲取特定區域的詳細信息"""
    try:
        regions = load_regions()
        region = regions.get(region_id)
        if region:
            return jsonify(region.to_dict())
        else:
            return jsonify({'error': '區域不存在'}), 404
    except Exception as e:
        logger.error(f'獲取區域 {region_id} 失敗: {str(e)}')
        return jsonify({'error': str(e)}), 500

@map_bp.route('/regions', methods=['POST'])
def create_region():
    """創建新的區域"""
    try:
        if not request.is_json:
            return jsonify({'error': '請求必須是JSON格式'}), 400
            
        data = request.get_json()
        regions = load_regions()
        
        # 創建新的區域
        new_region = Region(
            id=data['id'],
            name=data['name'],
            name_en=data['name_en'],  # 更新為 name_en
            division=data['division'],
            bu=data['bu'],  # 新增 bu
            sort_no=data['sort_no'],
            continents=data['continents']  # 新增 continents
        )
        
        regions[new_region.id] = new_region
        if save_regions(regions):
            return jsonify(new_region.to_dict()), 201
        return jsonify({'error': '保存失敗'}), 500
        
    except Exception as e:
        logger.error(f'創建區域失敗: {str(e)}')
        return jsonify({'error': str(e)}), 500

@map_bp.route('/regions/<region_id>', methods=['PUT'])
def update_region(region_id):
    """更新區域"""
    try:
        if not request.is_json:
            return jsonify({'error': '請求必須是JSON格式'}), 400
            
        data = request.get_json()
        regions = load_regions()
        
        region = regions.get(region_id)
        if not region:
            return jsonify({'error': '區域不存在'}), 404
            
        # 更新數據
        region.name = data.get('name', region.name)
        region.name_en = data.get('name_en', region.name_en)  # 更新為 name_en
        region.division = data.get('division', region.division)
        region.sort_no = data.get('sort_no', region.sort_no)
        region.bu = data.get('bu', region.bu)  # 更新 bu
        region.continents = data.get('continents', region.continents)  # 更新 continents
        
        if save_regions(regions):
            return jsonify(region.to_dict())
        return jsonify({'error': '保存失敗'}), 500
        
    except Exception as e:
        logger.error(f'更新區域 {region_id} 失敗: {str(e)}')
        return jsonify({'error': str(e)}), 500

@map_bp.route('/regions/<region_id>', methods=['DELETE'])
def delete_region(region_id):
    """刪除區域"""
    try:
        regions = load_regions()
        if region_id not in regions:
            return jsonify({'error': '區域不存在'}), 404
            
        del regions[region_id]
        if save_regions(regions):
            return jsonify({'message': '刪除成功'})
        return jsonify({'error': '保存失敗'}), 500
        
    except Exception as e:
        logger.error(f'刪除區域 {region_id} 失敗: {str(e)}')
        return jsonify({'error': str(e)}), 500

# 加載國家數據
def load_countries():
    """加載國家數據"""
    try:
        with open(COUNTRIES_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            countries = {}
            for c in data['countries']:
                country = Country.from_dict(c)
                countries[c['id']] = country
            return countries
    except Exception as e:
        logger.error(f'加載國家數據失敗: {str(e)}')
        return {}

# 獲取所有國家
@map_bp.route('/countries', methods=['GET'])
def get_countries():
    """獲取所有國家"""
    try:
        countries = load_countries()
        return jsonify({'countries': [c.to_dict() for c in countries.values()]})
    except Exception as e:
        logger.error(f'獲取國家失敗: {str(e)}')
        return jsonify({'error': str(e)}), 500

# 獲取特定國家
@map_bp.route('/countries/<country_id>', methods=['GET'])
def get_country_by_id(country_id):
    """根據 ID 獲取特定國家"""
    try:
        countries = load_countries()
        country = countries.get(country_id)
        if country:
            return jsonify(country.to_dict())
        else:
            return jsonify({'error': '國家不存在'}), 404
    except Exception as e:
        logger.error(f'獲取國家 {country_id} 失敗: {str(e)}')
        return jsonify({'error': str(e)}), 500

# 創建新的國家
@map_bp.route('/countries', methods=['POST'])
def create_country():
    """創建新的國家"""
    try:
        if not request.is_json:
            return jsonify({'error': '請求必須是JSON格式'}), 400
            
        data = request.get_json()
        countries = load_countries()
        
        new_country = Country(
            id=data['id'],
            abbrev=data['abbrev'],
            name=data['name'],
            name_cn=data['name_cn'],
            region=data['region'],
            continents=data['continents'],
            bu=data['bu'],
            division=data['division'],
            flag=data['flag'],
            flag_url=data['flag_url'],
            bg_color=data['bg_color']
        )
        
        countries[new_country.id] = new_country
        if save_countries(countries):
            return jsonify(new_country.to_dict()), 201
        return jsonify({'error': '保存失敗'}), 500
        
    except Exception as e:
        logger.error(f'創建國家失敗: {str(e)}')
        return jsonify({'error': str(e)}), 500

# 更新特定國家
@map_bp.route('/countries/<country_id>', methods=['PUT'])
def update_country(country_id):
    """更新國家"""
    try:
        if not request.is_json:
            return jsonify({'error': '請求必須是JSON格式'}), 400
            
        data = request.get_json()
        countries = load_countries()
        
        country = countries.get(country_id)
        if not country:
            return jsonify({'error': '國家不存在'}), 404
            
        # 更新數據
        country.abbrev = data.get('abbrev', country.abbrev)
        country.name = data.get('name', country.name)
        country.name_cn = data.get('name_cn', country.name_cn)
        country.region = data.get('region', country.region)
        country.continents = data.get('continents', country.continents)
        country.bu = data.get('bu', country.bu)
        country.division = data.get('division', country.division)
        country.flag = data.get('flag', country.flag)
        country.flag_url = data.get('flag_url', country.flag_url)
        country.bg_color = data.get('bg_color', country.bg_color)
        
        if save_countries(countries):
            return jsonify(country.to_dict())
        return jsonify({'error': '保存失敗'}), 500
        
    except Exception as e:
        logger.error(f'更新國家 {country_id} 失敗: {str(e)}')
        return jsonify({'error': str(e)}), 500

# 刪除特定國家
@map_bp.route('/countries/<country_id>', methods=['DELETE'])
def delete_country(country_id):
    """刪除國家"""
    try:
        countries = load_countries()
        if country_id not in countries:
            return jsonify({'error': '國家不存在'}), 404
            
        del countries[country_id]
        if save_countries(countries):
            return jsonify({'message': '刪除成功'})
        return jsonify({'error': '保存失敗'}), 500
        
    except Exception as e:
        logger.error(f'刪除國家 {country_id} 失敗: {str(e)}')
        return jsonify({'error': str(e)}), 500

# 保存國家數據
def save_countries(countries):
    """保存國家數據"""
    try:
        data = {'countries': [c.to_dict() for c in countries.values()]}
        with open(COUNTRIES_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        logger.error(f'保存國家數據失敗: {str(e)}')
        return False 