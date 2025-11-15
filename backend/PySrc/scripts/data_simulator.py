from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
import os
from dotenv import load_dotenv
import random
from datetime import datetime, timedelta
import time
import logging

# 配置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 加載環境變量
load_dotenv()

class DataSimulator:
    def __init__(self):
        """初始化 InfluxDB 客戶端連接"""
        self.url = "http://localhost:8086"
        self.token = os.getenv('INFLUXDB_ADMIN_TOKEN')
        self.org = os.getenv('INFLUXDB_ORG')
        self.bucket = os.getenv('INFLUXDB_BUCKET')

        self.client = InfluxDBClient(
            url=self.url,
            token=self.token,
            org=self.org
        )
        self.write_api = self.client.write_api(write_options=SYNCHRONOUS)

    def generate_power_data(self, site_id, equipment_id):
        """生成發電數據"""
        current_time = datetime.utcnow()
        
        # 生成功率數據 (15-25 kW)
        power = Point("power_generation") \
            .tag("site_id", site_id) \
            .tag("equipment_id", equipment_id) \
            .field("power", random.uniform(15, 25)) \
            .time(current_time)

        # 生成電壓數據 (210-230 V)
        voltage = Point("power_generation") \
            .tag("site_id", site_id) \
            .tag("equipment_id", equipment_id) \
            .field("voltage", random.uniform(210, 230)) \
            .time(current_time)

        # 生成轉速數據 (50-70 rpm)
        rpm = Point("power_generation") \
            .tag("site_id", site_id) \
            .tag("equipment_id", equipment_id) \
            .field("rpm", random.uniform(50, 70)) \
            .time(current_time)

        # 生成風速數據 (5-15 m/s)
        wind_speed = Point("power_generation") \
            .tag("site_id", site_id) \
            .tag("equipment_id", equipment_id) \
            .field("wind_speed", random.uniform(5, 15)) \
            .time(current_time)

        return [power, voltage, rpm, wind_speed]

    def simulate_data(self, site_id, equipment_id, duration_minutes=60, interval_seconds=5):
        """持續模擬數據"""
        try:
            logger.info(f"Starting data simulation for equipment {equipment_id}")
            end_time = datetime.now() + timedelta(minutes=duration_minutes)
            
            while datetime.now() < end_time:
                points = self.generate_power_data(site_id, equipment_id)
                self.write_api.write(bucket=self.bucket, record=points)
                logger.info(f"Generated data points at {datetime.now()}")
                time.sleep(interval_seconds)

        except Exception as e:
            logger.error(f"Error simulating data: {str(e)}")
        finally:
            self.client.close()
            logger.info("Data simulation completed")

if __name__ == "__main__":
    # 使用示例
    simulator = DataSimulator()
    site_id = "02bbb00f-7f46-45b0-8c23-82b05e37225c"  # 您的場站ID
    equipment_id = "Lont-101-001"  # 您的設備ID
    
    # 模擬1小時的數據，每5秒生成一次
    simulator.simulate_data(site_id, equipment_id, duration_minutes=60, interval_seconds=5) 