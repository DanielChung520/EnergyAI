import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.equipment_data_collector import EquipmentDataCollector
import random
import time
from datetime import datetime
import csv

class WindFarmSimulator:
    def __init__(self):
        self.collector = EquipmentDataCollector()
        self.wind_turbines = self.load_wind_turbines()
        
    def load_wind_turbines(self):
        """從 site_equipments.csv 加載風機配置"""
        turbines = []
        csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                               'data', 'site_equipments.csv')
        
        with open(csv_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['asset_no'].startswith('Lont-101'):  # 風機資產編號前綴
                    # 解析位置信息
                    location = row['location'].replace('維度：', '').replace('經度：', '').split('|')
                    latitude = float(location[0].strip())
                    longitude = float(location[1].strip())
                    
                    turbines.append({
                        'id': row['id'],
                        'asset_no': row['asset_no'],
                        'site_id': row['site_id'],
                        'model_no': row['model_no'],
                        'status': row['status'],
                        'location': {
                            'latitude': latitude,
                            'longitude': longitude
                        }
                    })
        return turbines

    def generate_wind_turbine_data(self, status):
        """根據風機狀態生成發電數據"""
        if status == 'maintenance':
            return {
                "active_power": 0.0,
                "reactive_power": 0.0,
                "voltage": random.uniform(680, 700),
                "current": 0.0,
                "frequency": 50.0,
                "power_factor": 0.0
            }
        elif status == 'installing':
            return {
                "active_power": 0.0,
                "reactive_power": 0.0,
                "voltage": 0.0,
                "current": 0.0,
                "frequency": 0.0,
                "power_factor": 0.0
            }
        else:  # running
            return {
                "active_power": random.uniform(1000, 2000),
                "reactive_power": random.uniform(-500, 500),
                "voltage": random.uniform(680, 700),
                "current": random.uniform(800, 1500),
                "frequency": random.uniform(49.8, 50.2),
                "power_factor": random.uniform(0.9, 1.0)
            }

    def generate_wind_turbine_status(self, status):
        """根據風機狀態生成狀態數據"""
        if status == 'maintenance':
            return {
                "operating_state": "maintenance",
                "rotor_speed": 0.0,
                "pitch_angle": 90.0,
                "nacelle_temperature": random.uniform(20, 30),
                "gearbox_temperature": random.uniform(20, 30),
                "fault_code": str(random.randint(1, 100))
            }
        elif status == 'installing':
            return {
                "operating_state": "installing",
                "rotor_speed": 0.0,
                "pitch_angle": 90.0,
                "nacelle_temperature": 20.0,
                "gearbox_temperature": 20.0,
                "fault_code": "0"
            }
        else:  # running
            return {
                "operating_state": "running",
                "rotor_speed": random.uniform(10, 15),
                "pitch_angle": random.uniform(-5, 5),
                "nacelle_temperature": random.uniform(40, 60),
                "gearbox_temperature": random.uniform(50, 70),
                "fault_code": "0" if random.random() > 0.1 else str(random.randint(1, 100))
            }

    def simulate_wind_farm(self):
        """模擬風場所有風機的數據"""
        try:
            for turbine in self.wind_turbines:
                # 發電數據
                success, error = self.collector.write_power_generation_data(
                    site_id=turbine['site_id'],
                    equipment_type="wind",
                    equipment_subtype="turbine",
                    equipment_id=turbine['asset_no'],  # 使用資產編號作為設備ID
                    manufacturer="Vestas",  # 從 equipments.csv 中獲取
                    data=self.generate_wind_turbine_data(turbine['status'])
                )
                if not success:
                    print(f"風機 {turbine['asset_no']} 發電數據寫入失敗: {error}")
                
                # 狀態數據
                success, error = self.collector.write_equipment_status(
                    site_id=turbine['site_id'],
                    equipment_type="wind",
                    equipment_subtype="turbine",
                    equipment_id=turbine['asset_no'],
                    manufacturer="Vestas",
                    data=self.generate_wind_turbine_status(turbine['status'])
                )
                if not success:
                    print(f"風機 {turbine['asset_no']} 狀態數據寫入失敗: {error}")
            
            print(f"風場數據模擬完成，共 {len(self.wind_turbines)} 台風機")
            
        except Exception as e:
            print(f"風場數據模擬出錯: {str(e)}")

    def run(self, interval=5):
        """
        運行模擬器
        
        Args:
            interval (int): 數據生成間隔（秒）
        """
        print(f"開始模擬風場數據生成，間隔 {interval} 秒")
        print(f"已加載 {len(self.wind_turbines)} 台風機配置")
        try:
            while True:
                self.simulate_wind_farm()
                time.sleep(interval)
        except KeyboardInterrupt:
            print("\n停止模擬")
        finally:
            self.collector.close()

if __name__ == "__main__":
    simulator = WindFarmSimulator()
    simulator.run() 