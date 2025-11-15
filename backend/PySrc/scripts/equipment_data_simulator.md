import time
import random
from datetime import datetime
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
import os
from dotenv import load_dotenv

# 加載環境變量
load_dotenv()

class EquipmentDataSimulator:
    def __init__(self):
        self.client = InfluxDBClient(
            url="http://localhost:8086",
            token=os.getenv('INFLUXDB_ADMIN_TOKEN'),
            org=os.getenv('INFLUXDB_ORG')
        )
        self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
        self.bucket = os.getenv('INFLUXDB_BUCKET')

    def generate_wind_turbine_data(self):
        return {
            "current": random.uniform(100, 200),
            "voltage": random.uniform(220, 240),
            "rpm": random.uniform(1000, 1500),
            "temperature": random.uniform(30, 50),
            "status": random.choice(["running", "idle", "maintenance"]),
            "wind_direction": random.uniform(0, 360),
            "yaw_angle": random.uniform(-45, 45),
            "pitch_angle": random.uniform(-10, 10)
        }

    def generate_wind_controller_data(self):
        return {
            "control_mode": random.choice(["auto", "manual"]),
            "target_rpm": random.uniform(1000, 1500),
            "brake_status": random.choice(["released", "engaged"]),
            "system_status": random.choice(["normal", "warning", "fault"])
        }

    def generate_solar_panel_data(self):
        return {
            "panel_temperature": random.uniform(40, 60),
            "solar_irradiance": random.uniform(200, 1000),
            "power_output": random.uniform(1000, 5000),
            "panel_efficiency": random.uniform(15, 20)
        }

    def generate_solar_inverter_data(self):
        return {
            "dc_voltage": random.uniform(400, 800),
            "ac_output": random.uniform(380, 400),
            "conversion_efficiency": random.uniform(95, 98),
            "temperature": random.uniform(30, 50),
            "status": random.choice(["normal", "warning", "fault"])
        }

    def generate_battery_data(self):
        return {
            "voltage": random.uniform(700, 800),
            "current": random.uniform(-100, 100),
            "soc": random.uniform(20, 90),
            "temperature": random.uniform(20, 40),
            "cycle_count": random.randint(100, 1000),
            "status": random.choice(["charging", "discharging", "idle"])
        }

    def generate_biomass_generator_data(self):
        return {
            "power_output": random.uniform(5000, 10000),
            "fuel_consumption": random.uniform(100, 200),
            "exhaust_temperature": random.uniform(200, 300),
            "oil_pressure": random.uniform(40, 60),
            "running_hours": random.randint(0, 24),
            "status": random.choice(["running", "idle", "maintenance"])
        }

    def write_equipment_data(self, equipment_type, equipment_subtype, equipment_id, location, manufacturer, data):
        point = Point("equipment_data")\
            .tag("equipment_type", equipment_type)\
            .tag("equipment_subtype", equipment_subtype)\
            .tag("equipment_id", equipment_id)\
            .tag("location", location)\
            .tag("manufacturer", manufacturer)

        for field_name, value in data.items():
            point.field(field_name, value)

        self.write_api.write(bucket=self.bucket, record=point)
        print(f"發送 {equipment_type}/{equipment_subtype} 數據: 成功")

    def run_simulation(self, interval=1):
        print(f"開始模擬數據發送，間隔 {interval} 秒")
        
        equipment_configs = [
            # 風能設備
            ("wind_power", "turbine", "WT001", "location_A", "Vestas"),
            ("wind_power", "controller", "WC001", "location_A", "Siemens"),
            # 光伏設備
            ("solar_power", "panel", "SP001", "location_B", "Longi"),
            ("solar_power", "inverter", "SI001", "location_B", "Huawei"),
            # 儲能設備
            ("energy_storage", "battery", "BS001", "location_C", "CATL"),
            # 生質能設備
            ("biomass_power", "generator", "BG001", "location_D", "Wartsila")
        ]

        while True:
            try:
                for eq_type, eq_subtype, eq_id, location, manufacturer in equipment_configs:
                    if eq_type == "wind_power":
                        if eq_subtype == "turbine":
                            data = self.generate_wind_turbine_data()
                        else:  # controller
                            data = self.generate_wind_controller_data()
                    elif eq_type == "solar_power":
                        if eq_subtype == "panel":
                            data = self.generate_solar_panel_data()
                        else:  # inverter
                            data = self.generate_solar_inverter_data()
                    elif eq_type == "energy_storage":
                        data = self.generate_battery_data()
                    else:  # biomass_power
                        data = self.generate_biomass_generator_data()
                    
                    self.write_equipment_data(eq_type, eq_subtype, eq_id, location, manufacturer, data)
                
                time.sleep(interval)
            except KeyboardInterrupt:
                print("\n停止數據模擬")
                break
            except Exception as e:
                print(f"錯誤: {str(e)}")
                time.sleep(5)

if __name__ == "__main__":
    simulator = EquipmentDataSimulator()
    simulator.run_simulation() 