from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
import os
from dotenv import load_dotenv
from datetime import datetime

# 加載環境變量
load_dotenv()

class EquipmentDataCollector:
    def __init__(self):
        """初始化 InfluxDB 客戶端連接"""
        self.client = InfluxDBClient(
            url="http://localhost:8086",
            token=os.getenv('INFLUXDB_ADMIN_TOKEN'),
            org=os.getenv('INFLUXDB_ORG')
        )
        self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
        self.bucket = os.getenv('INFLUXDB_BUCKET')

    def write_power_generation_data(self, site_id, equipment_type, equipment_subtype, 
                                  equipment_id, manufacturer, data, timestamp=None):
        """
        寫入發電數據
        
        Args:
            site_id (str): 場站ID
            equipment_type (str): 設備類型 (wind/solar/biomass/storage)
            equipment_subtype (str): 設備子類型
            equipment_id (str): 設備ID
            manufacturer (str): 製造商
            data (dict): 包含發電相關數據的字典
            timestamp (datetime, optional): 時間戳
        """
        try:
            point = Point("power_generation")\
                .tag("site_id", site_id)\
                .tag("equipment_type", equipment_type)\
                .tag("equipment_subtype", equipment_subtype)\
                .tag("equipment_id", equipment_id)\
                .tag("manufacturer", manufacturer)

            if timestamp:
                point = point.time(timestamp)

            for field_name, value in data.items():
                point.field(field_name, value)

            self.write_api.write(bucket=self.bucket, record=point)
            return True, None
        except Exception as e:
            return False, str(e)

    def write_equipment_status(self, site_id, equipment_type, equipment_subtype, 
                             equipment_id, manufacturer, data, timestamp=None):
        """
        寫入設備狀態數據
        
        Args:
            site_id (str): 場站ID
            equipment_type (str): 設備類型
            equipment_subtype (str): 設備子類型
            equipment_id (str): 設備ID
            manufacturer (str): 製造商
            data (dict): 包含設備狀態相關數據的字典
            timestamp (datetime, optional): 時間戳
        """
        try:
            point = Point("equipment_status")\
                .tag("site_id", site_id)\
                .tag("equipment_type", equipment_type)\
                .tag("equipment_subtype", equipment_subtype)\
                .tag("equipment_id", equipment_id)\
                .tag("manufacturer", manufacturer)

            if timestamp:
                point = point.time(timestamp)

            for field_name, value in data.items():
                point.field(field_name, value)

            self.write_api.write(bucket=self.bucket, record=point)
            return True, None
        except Exception as e:
            return False, str(e)

    def write_environmental_data(self, site_id, equipment_id, data, timestamp=None):
        """
        寫入環境數據
        
        Args:
            site_id (str): 場站ID
            equipment_id (str): 設備ID（氣象站ID）
            data (dict): 包含環境相關數據的字典
            timestamp (datetime, optional): 時間戳
        """
        try:
            point = Point("environmental_data")\
                .tag("site_id", site_id)\
                .tag("equipment_id", equipment_id)\
                .tag("equipment_type", "weather_station")

            if timestamp:
                point = point.time(timestamp)

            for field_name, value in data.items():
                point.field(field_name, value)

            self.write_api.write(bucket=self.bucket, record=point)
            return True, None
        except Exception as e:
            return False, str(e)

    def close(self):
        """關閉 InfluxDB 客戶端連接"""
        self.client.close()

# 使用示例
if __name__ == "__main__":
    # 創建採集器實例
    collector = EquipmentDataCollector()
    
    # 寫入風機發電數據示例
    success, error = collector.write_power_generation_data(
        site_id="site_001",
        equipment_type="wind",
        equipment_subtype="turbine",
        equipment_id="WT001",
        manufacturer="Vestas",
        data={
            "active_power": 1500.0,
            "reactive_power": 100.0,
            "voltage": 690.0,
            "current": 1000.0,
            "frequency": 50.0,
            "power_factor": 0.95
        }
    )
    
    if success:
        print("發電數據寫入成功")
    else:
        print(f"發電數據寫入失敗: {error}")
    
    # 寫入設備狀態示例
    success, error = collector.write_equipment_status(
        site_id="site_001",
        equipment_type="wind",
        equipment_subtype="turbine",
        equipment_id="WT001",
        manufacturer="Vestas",
        data={
            "operating_state": "running",
            "fault_code": "0",
            "efficiency": 96.5,
            "temperature": 45.2,
            "running_hours": 5000
        }
    )
    
    if success:
        print("設備狀態寫入成功")
    else:
        print(f"設備狀態寫入失敗: {error}")
    
    # 寫入環境數據示例
    success, error = collector.write_environmental_data(
        site_id="site_001",
        equipment_id="WS001",
        data={
            "wind_speed": 12.5,
            "wind_direction": 180.0,
            "temperature": 25.0,
            "humidity": 65.0
        }
    )
    
    if success:
        print("環境數據寫入成功")
    else:
        print(f"環境數據寫入失敗: {error}")
    
    # 關閉連接
    collector.close() 