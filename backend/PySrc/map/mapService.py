# 獲取所有地圖區域數據
@app.route('/api/map-regions', methods=['GET'])
def get_map_regions():
    try:
        if not os.path.exists(MAP_REGION_FILE):
            # 如果文件不存在，創建一個空的數據結構
            data = {'regions': []}
            with open(MAP_REGION_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            return jsonify(data)
            
        with open(MAP_REGION_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            logger.info('成功讀取地圖區域數據')
            return jsonify(data)
    except Exception as e:
        logger.error(f'讀取地圖區域數據失敗: {str(e)}')
        return jsonify({'error': str(e)}), 500

# 獲取單個地圖區域數據
@app.route('/api/map-regions/<path_id>', methods=['GET'])
def get_map_region(path_id):
    try:
        if not os.path.exists(MAP_REGION_FILE):
            return jsonify({'error': '地圖區域數據文件不存在'}), 404
            
        with open(MAP_REGION_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        region = next((r for r in data['regions'] if r['path_id'] == path_id), None)
        if region is None:
            return jsonify({'error': '指定的區域不存在'}), 404
            
        return jsonify(region)
    except Exception as e:
        logger.error(f'獲取區域 {path_id} 數據失敗: {str(e)}')
        return jsonify({'error': str(e)}), 500

# 更新地圖區域數據
@app.route('/api/map-regions/<path_id>', methods=['PUT'])
def update_map_region(path_id):
    try:
        if not request.is_json:
            return jsonify({'error': '請求必須是JSON格式'}), 400
            
        update_data = request.get_json()
        
        if not os.path.exists(MAP_REGION_FILE):
            data = {'regions': []}
        else:
            with open(MAP_REGION_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
        # 查找區域數據
        region_index = next((i for i, r in enumerate(data['regions']) if r['path_id'] == path_id), None)
        
        # 標準化更新數據格式
        standardized_data = {
            'path_id': path_id,
            'region': update_data.get('region', ''),
            'country': update_data.get('country', ''),
            'division': update_data.get('division', ''),
            'responsable': update_data.get('responsable', ''),
            'contact': update_data.get('contact', ''),
            'coordinates': update_data.get('coordinates', [])
        }
        
        if region_index is None:
            # 如果區域不存在，創建新記錄
            data['regions'].append(standardized_data)
            region_index = len(data['regions']) - 1
        else:
            # 更新現有記錄，保留原有的 coordinates
            original_coordinates = data['regions'][region_index]['coordinates']
            data['regions'][region_index] = {
                **standardized_data,
                'coordinates': original_coordinates
            }
        
        # 寫入更新後的數據
        with open(MAP_REGION_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            logger.info(f'區域 {path_id} 數據已更新')
            
        return jsonify({
            'message': f'區域 {path_id} 數據已成功更新',
            'data': data['regions'][region_index]
        })
    except Exception as e:
        logger.error(f'更新區域 {path_id} 數據失敗: {str(e)}')
        return jsonify({'error': str(e)}), 500

# 批量更新地圖區域數據
@app.route('/api/map-regions/batch', methods=['PUT'])
def batch_update_map_regions():
    try:
        if not request.is_json:
            return jsonify({'error': '請求必須是JSON格式'}), 400
            
        updates = request.get_json()
        
        if not isinstance(updates, list):
            return jsonify({'error': '請求數據必須是數組格式'}), 400
            
        if not os.path.exists(MAP_REGION_FILE):
            return jsonify({'error': '地圖區域數據文件不存在'}), 404
            
        with open(MAP_REGION_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # 記錄更新結果
        results = {
            'success': [],
            'failed': []
        }
        
        # 處理每個更新請求
        for update in updates:
            path_id = update.get('path_id')
            if not path_id:
                results['failed'].append({'error': '缺少 path_id', 'data': update})
                continue
                
            region_index = next((i for i, r in enumerate(data['regions']) if r['path_id'] == path_id), None)
            if region_index is None:
                results['failed'].append({'error': '區域不存在', 'path_id': path_id})
                continue
                
            try:
                # 保留原有的 path_id 和 coordinates
                original_path_id = data['regions'][region_index]['path_id']
                original_coordinates = data['regions'][region_index]['coordinates']
                
                # 更新其他字段
                data['regions'][region_index].update(update)
                
                # 確保 path_id 和 coordinates 不被修改
                data['regions'][region_index]['path_id'] = original_path_id
                data['regions'][region_index]['coordinates'] = original_coordinates
                
                results['success'].append(path_id)
            except Exception as e:
                results['failed'].append({'error': str(e), 'path_id': path_id})
        
        # 寫入更新後的數據
        with open(MAP_REGION_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            logger.info('批量更新地圖區域數據完成')
            
        return jsonify({
            'message': '批量更新完成',
            'results': results
        })
    except Exception as e:
        logger.error(f'批量更新地圖區域數據失敗: {str(e)}')
        return jsonify({'error': str(e)}), 500

# 創建新的地圖區域
@app.route('/api/map-regions', methods=['POST'])
def create_map_region():
    try:
        if not request.is_json:
            return jsonify({'error': '請求必須是JSON格式'}), 400
            
        region_data = request.get_json()
        
        if not os.path.exists(MAP_REGION_FILE):
            data = {'regions': []}
        else:
            with open(MAP_REGION_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
        
        # 確保必要字段存在
        new_region = {
            'path_id': region_data.get('path_id', ''),
            'region': region_data.get('region', ''),
            'division': region_data.get('division', ''),
            'responsable': region_data.get('responsable', ''),
            'contact': region_data.get('contact', ''),
            'coordinates': region_data.get('coordinates', [])
        }
        
        # 添加新區域
        data['regions'].append(new_region)
        
        # 寫入更新後的數據
        with open(MAP_REGION_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            logger.info('新區域已創建')
            
        return jsonify({
            'message': '新區域創建成功',
            'data': new_region
        }), 201
    except Exception as e:
        logger.error(f'創建新區域失敗: {str(e)}')
        return jsonify({'error': str(e)}), 500

# 讀取 region.json 文件
def load_regions():
    try:
        with open('data/region.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"regions": []}

# 保存 region.json 文件
def save_regions(data):
    with open('data/region.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# 獲取所有區域
@app.route('/api/regions', methods=['GET'])
def get_regions():
    data = load_regions()
    return jsonify(data)

# 創建新區域
@app.route('/api/regions', methods=['POST'])
def create_region():
    data = load_regions()
    new_region = request.json
    
    # 生成新的 ID
    max_id = max([r['id'] for r in data['regions']], default=0)
    new_region['id'] = max_id + 1
    
    data['regions'].append(new_region)
    save_regions(data)
    return jsonify(new_region)

# 更新區域
@app.route('/api/regions/<int:id>', methods=['PUT'])
def update_region(id):
    data = load_regions()
    region_data = request.json
    
    for region in data['regions']:
        if region['id'] == id:
            region.update(region_data)
            save_regions(data)
            return jsonify(region)
    
    return jsonify({"error": "Region not found"}), 404

# 刪除區域
@app.route('/api/regions/<int:id>', methods=['DELETE'])
def delete_region(id):
    data = load_regions()
    data['regions'] = [r for r in data['regions'] if r['id'] != id]
    save_regions(data)
    return jsonify({"message": "Region deleted successfully"})
