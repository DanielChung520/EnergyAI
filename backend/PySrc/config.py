import os

class Config:
    # 基礎路徑配置
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(BASE_DIR, 'data')
    
    # 數據庫配置
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:daniel01@localhost/bioengy'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True  # 顯示 SQL 查詢
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_recycle': 3600,
        'pool_pre_ping': True,
        'echo': True,
        'echo_pool': True
    }

    # CSV 文件路徑
    SITES_CSV = os.path.join(DATA_DIR, 'sites.csv')
    WIND_SITES_CSV = os.path.join(DATA_DIR, 'wind_sites.csv')
    SOLAR_SITES_CSV = os.path.join(DATA_DIR, 'solar_sites.csv')
    
    # CSV 文件欄位定義
    SITE_COLUMNS = [
        'id', 'name', 'company', 'country', 'province', 'address',
        'latitude', 'longitude', 'site_type', 'capacity',
        'capacity_params', 'approval_number', 'approval_date',
        'area', 'construction_date', 'operation_date'
    ]
    
    WIND_SITE_COLUMNS = [
        'site_id', 'turbine_model', 'height', 'air_density',
        'avg_wind_speed', 
        'spring_avg_wind_speed', 'spring_wind_direction',
        'summer_avg_wind_speed', 'summer_wind_direction',
        'autumn_avg_wind_speed', 'autumn_wind_direction',
        'winter_avg_wind_speed', 'winter_wind_direction',
        'remark', 'created_at', 'updated_at'
    ]
    
    SOLAR_SITE_COLUMNS = [
        'site_id',
        'module_type',
        'bracket_height',
        'annual_sunlight',
        'output_voltage',
        'inverter_output',
        'ground_direction',
        'sunlight_direction',
        'avg_temperature',
        'avg_rainfall',
        'avg_wind_speed',
        'remark',
        'created_at',
        'updated_at'
    ]

    # 逆變器輸出形式選項
    INVERTER_OUTPUT_TYPES = [
        {'value': 'AC', 'label': '交流'},
        {'value': 'DC', 'label': '直流'}
    ]

    # 16方位選項（與風向相同）
    DIRECTIONS = [
        {'value': 'N', 'label': '北'},
        {'value': 'NNE', 'label': '北北東'},
        {'value': 'NE', 'label': '東北'},
        {'value': 'ENE', 'label': '東北東'},
        {'value': 'E', 'label': '東'},
        {'value': 'ESE', 'label': '東南東'},
        {'value': 'SE', 'label': '東南'},
        {'value': 'SSE', 'label': '南南東'},
        {'value': 'S', 'label': '南'},
        {'value': 'SSW', 'label': '南南西'},
        {'value': 'SW', 'label': '西南'},
        {'value': 'WSW', 'label': '西南西'},
        {'value': 'W', 'label': '西'},
        {'value': 'WNW', 'label': '西北西'},
        {'value': 'NW', 'label': '西北'},
        {'value': 'NNW', 'label': '北北西'}
    ]

    # 設備 CSV 文件路徑
    EQUIPMENTS_CSV = os.path.join(DATA_DIR, 'equipments.csv')
    
    # 設備 CSV 文件欄位定義
    EQUIPMENT_COLUMNS = [
        'id', 'model_no', 'desc_cn', 'desc_en', 'equ_type',
        'power', 'voltage', 'useful_life', 'iso14064', 'iso14001', 'remark',
        'created_at', 'updated_at'
    ]

    # 風力設備詳細資料 CSV 文件路徑
    WIND_EQUIPMENT_DETAILS_CSV = os.path.join(DATA_DIR, 'wind_equipment_details.csv')
    
    # 風力設備詳細資料欄位定義
    WIND_EQUIPMENT_DETAIL_COLUMNS = [
        'equipment_id', 'model_no', 'efficiency', 
        'wind_speed_range_from', 'wind_speed_range_to',
        'rpm_range_from', 'rpm_range_to',
        'pole_height', 'base_height', 'blade_diameter',
        'type', 'location_type',
        'durability_range_from', 'durability_range_to',
        'created_at', 'updated_at'
    ]

    # 太陽能設備詳細資料 CSV 文件路徑
    SOLAR_EQUIPMENT_DETAILS_CSV = os.path.join(DATA_DIR, 'solar_equipment_details.csv')
    
    # 太陽能設備詳細資料欄位定義
    SOLAR_EQUIPMENT_DETAIL_COLUMNS = [
        'equipment_id', 'model_no', 'efficiency', 
        'dimensions', 'type',
        'durability_range_from', 'durability_range_to'
    ]

    # 案場設備 CSV 文件路徑
    SITE_EQUIPMENTS_CSV = os.path.join(DATA_DIR, 'site_equipments.csv')
    
    # 案場設備 CSV 文件欄位定義
    SITE_EQUIPMENT_COLUMNS = [
        'id',
        'site_id',
        'model_no',
        'asset_no',
        'purchase_date',
        'operat_date',
        'location',
        'backup',
        'status',
        'remark',
        'created_at',
        'updated_at'
    ]

    # InfluxDB 配置
    INFLUXDB_URL = os.getenv("INFLUXDB_URL", "http://localhost:8086")
    INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN", "your-super-secret-token")
    INFLUXDB_ORG = os.getenv("INFLUXDB_ORG", "energy-ai")
    INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET", "power-plant-data")
    
    # AWS 配置
    AWS_ACCESS_KEY = "your-access-key"
    AWS_SECRET_KEY = "your-secret-key"
    AWS_BUCKET = "your-bucket"
    
    # 數據保留策略
    HOT_DATA_RETENTION = "30d"  # 熱數據保留 30 天
    WARM_DATA_RETENTION = "180d"  # 溫數據保留 180 天

    SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'fallback-key')  # 優先從環境變量讀取
    JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
    # 建議使用複雜密鑰，正式環境建議從環境變量讀取