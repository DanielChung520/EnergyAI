# API 路由文檔
app.py 裡定義的 API 路由藍圖，詳解如下：

    app.register_blueprint(site_bp, url_prefix='/api/sites')
    app.register_blueprint(equipment_bp, url_prefix='/api/equipments')
    app.register_blueprint(ts_bp, url_prefix='/api')
    app.register_blueprint(function_bp, url_prefix='/api/system')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(map_bp, url_prefix='/api/map')
    app.register_blueprint(role_bp, url_prefix='/api/roles')
    logger.debug("Users blueprint registered with prefix: /api")


## 站點相關 (Sites)

### 基本站點操作
- `GET /api/sites/` - 獲取所有站點
- `POST /api/sites/` - 創建新站點
- `GET /api/sites/<site_id>` - 獲取特定站點
- `PUT /api/sites/<site_id>` - 更新特定站點
- `DELETE /api/sites/<site_id>` - 刪除特定站點

### 風電站詳情
- `GET /api/sites/<site_id>/wind-details` - 獲取風電站詳情
- `POST /api/sites/<site_id>/wind-details` - 創建風電站詳情
- `PUT /api/sites/<site_id>/wind-details` - 更新風電站詳情
- `DELETE /api/sites/<site_id>/wind-details` - 刪除風電站詳情

### 太陽能站詳情
- `GET /api/sites/<site_id>/solar-details` - 獲取太陽能站詳情
- `POST /api/sites/<site_id>/solar-details` - 創建太陽能站詳情
- `PUT /api/sites/<site_id>/solar-details` - 更新太陽能站詳情
- `DELETE /api/sites/<site_id>/solar-details` - 刪除太陽能站詳情

### 站點性能
- `GET /api/sites/<site_id>/performance` - 獲取站點性能記錄
- `POST /api/sites/<site_id>/performance` - 創建站點性能記錄
- `DELETE /api/sites/performance/<performance_id>` - 刪除站點性能記錄

### 站點設備
- `GET /api/sites/<site_id>/equipments` - 獲取站點所有設備
- `POST /api/sites/<site_id>/equipments` - 為站點添加新設備
- `GET /api/sites/equipments/<equipment_id>` - 獲取特定設備信息
- `PUT /api/sites/equipments/<equipment_id>` - 更新設備信息
- `DELETE /api/sites/equipments/<equipment_id>` - 刪除設備

### 設備列表查詢
- `GET /api/sites/equipments/list` - 根據 asset_no 或 site_id 查詢設備列表
  - 查詢參數：
    - `asset_no`: 設備資產編號 (可選)
    - `site_id`: 站點 ID (可選)
  - 示例：
    - 查詢特定設備：`GET /api/sites/equipments/list?asset_no=12345`
    - 查詢站點所有設備：`GET /api/sites/equipments/list?site_id=abcde`

- `GET /api/sites/equipments/list/all` - 獲取所有設備列表
  - 返回所有設備的完整列表

## 設備相關 (Equipments)

### 基本設備操作
- `GET /api/equipments/` - 獲取所有設備
- `POST /api/equipments/` - 創建新設備
- `GET /api/equipments/<equipment_id>` - 獲取特定設備
- `PUT /api/equipments/<equipment_id>` - 更新特定設備
- `DELETE /api/equipments/<equipment_id>` - 刪除特定設備

### 設備性能
- `GET /api/equipments/<equipment_id>/performance` - 獲取設備性能記錄
- `POST /api/equipments/<equipment_id>/performance` - 創建設備性能記錄
- `DELETE /api/equipments/performance/<performance_id>` - 刪除設備性能記錄

## 設備性能監控 (Performance)

### 設備運行日誌
- `GET /api/performance/equipment-logs` - 查询设备日誌
  - 查询参数：
    - `time_range` (可選): 时间范围类型 (day/week/quarter/year)
    - `start` (可選): 自定义开始时间(ISO格式)
    - `end` (可選): 自定义结束时间(ISO格式)
    - `site_id` (可選): 过滤特定站点的日誌
    - `equip_id` (可選): 过滤特定设备的日誌
    - `equip_type` (可選): 过滤特定设备类型的日誌
    - `page` (默認1): 分頁頁碼
    - `per_page` (默認20): 每頁顯示數量
 
### 批量操作
- `POST /api/performance/equipment-logs/batch` - 批量創建日誌
  - 請求體需為日誌數組
  - 示例請求：
    ```json
    [
        {
            "siteid": "site_001",
            "equip_id": "equip_123",
            "equip_type": "wind_turbine",
            "wind_speed": 12.5
        },
        {
            "siteid": "site_002",
            "equip_id": "equip_456",
            "equip_type": "solar_panel",
            "voltage": 220.0
        }
    ]
    ```

## 用戶相關 (Users)

### 用戶認證
- `POST /api/users/auth/login` - 用戶登錄
- `POST /api/users/auth/logout` - 用戶登出
- `POST /api/users/auth/register` - 用戶註冊

### 用戶管理
- `GET /api/users/` - 獲取所有用戶
- `GET /api/users/<user_id>` - 獲取特定用戶信息
- `PUT /api/users/<user_id>` - 更新用戶信息
- `DELETE /api/users/<user_id>` - 刪除用戶

## 系統功能 (Functions)

### 系統操作
- `GET /api/system/functions` - 獲取所有系統功能
- `POST /api/system/functions` - 創建新系統功能
- `GET /api/system/functions/<function_id>` - 獲取特定功能
- `PUT /api/system/functions/<function_id>` - 更新功能
- `DELETE /api/system/functions/<function_id>` - 刪除功能

## 地圖相關 (Map)

### 區域管理 (Regions)
- `GET /api/map/regions` - 獲取所有區域
- `POST /api/map/regions` - 創建新區域
- `GET /api/map/regions/<region_id>` - 獲取特定區域
- `PUT /api/map/regions/<region_id>` - 更新特定區域
- `DELETE /api/map/regions/<region_id>` - 刪除特定區域

### 地圖區域管理 (Map Regions)
- `GET /api/map/map-regions` - 獲取所有地圖區域
- `POST /api/map/map-regions` - 創建新的地圖區域
- `GET /api/map/map-regions/<path_id>` - 獲取特定地圖區域
- `PUT /api/map/map-regions/<path_id>` - 更新特定地圖區域
- `DELETE /api/map/map-regions/<path_id>` - 刪除特定地圖區域

#### 地圖區域詳情
- `GET /api/map/map-regions/<path_id>/details` - 獲取地圖區域詳細信息
- `POST /api/map/map-regions/<path_id>/coordinates` - 更新地圖區域坐標
- `GET /api/map/map-regions/by-region/<region_id>` - 獲取指定區域的所有地圖區域


#### 國家管理
- `GET /api/map/countries` - 獲取所有國家
- `POST /api/map/countries` - 創建新國家
- `GET /api/map/countries/<country_id>` - 獲取特定國家
- `PUT /api/map/countries/<country_id>` - 更新特定國家
- `DELETE /api/map/countries/<country_id>` - 刪除特定國家

## 角色管理 (Roles)

### 基本角色操作
- `POST /api/roles/` - 創建新角色
- `GET /api/roles/` - 獲取所有角色
- `GET /api/roles/<role_id>` - 獲取特定角色
- `PUT /api/roles/<role_id>` - 更新特定角色
- `DELETE /api/roles/<role_id>` - 刪除特定角色

### 角色功能管理
- `POST /api/roles/function` - 創建或更新角色的功能權限
- `GET /api/roles/function` - 獲取所有角色功能
- `GET /api/roles/function/<role_id>` - 獲取特定角色的功能權限
- `PUT /api/roles/function/<role_function_id>` - 更新角色功能
- `DELETE /api/roles/function/<role_function_id>` - 刪除角色功能

## 注意事項

1. 所有 API 端點都以 `/api` 為前綴
2. 所有請求都需要適當的認證和授權
3. 請求和響應的數據格式均為 JSON
4. 所有 ID 參數都使用 UUID 格式