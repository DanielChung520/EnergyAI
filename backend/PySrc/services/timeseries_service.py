from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from datetime import datetime, timedelta
import boto3
import json
import gzip
from config import Config

class TimeseriesService:
    def __init__(self):
        # InfluxDB 連接
        self.client = InfluxDBClient(
            url=Config.INFLUXDB_URL,
            token=Config.INFLUXDB_TOKEN,
            org=Config.INFLUXDB_ORG
        )
        self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
        self.query_api = self.client.query_api()
        
        # 只在需要時初始化 S3 客戶端
        # self.s3_client = None

    def write_power_data(self, data):
        """寫入電廠生產數據"""
        try:
            point = Point("power_generation")\
                .tag("site_id", data['site_id'])\
                .field("power", data['power'])\
                .field("voltage", data['voltage'])\
                .field("current", data['current'])\
                .time(datetime.utcnow())
            
            self.write_api.write(
                bucket=Config.INFLUXDB_BUCKET,
                record=point
            )
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def get_power_data(self, site_id, start=None, end=None):
        """獲取電廠生產數據"""
        query = f'''
        from(bucket: "{Config.INFLUXDB_BUCKET}")
            |> range(start: {start or "-1h"}, stop: {end or "now()"})
            |> filter(fn: (r) => r["_measurement"] == "power_generation")
            |> filter(fn: (r) => r["site_id"] == "{site_id}")
        '''
        result = self.query_api.query(query)
        return self._process_query_result(result)

    def write_equipment_data(self, data):
        """寫入設備監控數據"""
        try:
            point = Point("equipment_monitoring")\
                .tag("equipment_id", data['equipment_id'])\
                .tag("site_id", data['site_id'])\
                .field("status", data['status'])\
                .field("temperature", data['temperature'])\
                .field("rpm", data.get('rpm'))\
                .time(datetime.utcnow())
            
            self.write_api.write(
                bucket=Config.INFLUXDB_BUCKET,
                record=point
            )
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def write_environment_data(self, data):
        """寫入環境數據"""
        try:
            point = Point("environment")\
                .tag("site_id", data['site_id'])\
                .field("wind_speed", data.get('wind_speed'))\
                .field("wind_direction", data.get('wind_direction'))\
                .field("temperature", data.get('temperature'))\
                .field("humidity", data.get('humidity'))\
                .field("rainfall", data.get('rainfall'))\
                .field("solar_radiation", data.get('solar_radiation'))\
                .time(datetime.utcnow())
            
            self.write_api.write(
                bucket=Config.INFLUXDB_BUCKET,
                record=point
            )
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def write_wind_turbine_data(self, data):
        """寫入風力發電設備數據"""
        try:
            point = Point("wind_turbine_data")\
                .tag("equipment_id", data['equipment_id'])\
                .tag("site_id", data['site_id'])\
                .field("current", data['current'])\
                .field("voltage", data['voltage'])\
                .field("rpm", data['rpm'])\
                .field("gen_temp_a", data['gen_temp_a'])\
                .field("gen_temp_b", data['gen_temp_b'])\
                .field("gen_temp_load", data['gen_temp_load'])\
                .field("run_status", data['run_status'])\
                .field("wind_direction", data['wind_direction'])\
                .field("yaw_aim", data['yaw_aim'])\
                .field("yaw_pass", data['yaw_pass'])\
                .field("nace_temp", data['nace_temp'])\
                .field("yaw", data['yaw'])\
                .field("pitch", data['pitch'])\
                .field("wind_dir_10m", data['wind_dir_10m'])\
                .field("twist_angle", data['twist_angle'])\
                .field("power_pitch", data['power_pitch'])\
                .field("power_yaw", data['power_yaw'])\
                .field("n_heater", data['n_heater'])\
                .field("dumpload", data['dumpload'])\
                .field("load_voltage", data['load_voltage'])\
                .field("pitch_angle", data['pitch_angle'])\
                .time(datetime.utcnow())
            
            self.write_api.write(bucket=Config.INFLUXDB_BUCKET, record=point)
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def write_inverter_data(self, data):
        """寫入變流器數據"""
        try:
            point = Point("inverter_data")\
                .tag("equipment_id", data['equipment_id'])\
                .tag("site_id", data['site_id'])\
                .field("run_status", data['run_status'])\
                .field("phase_voltage_a", data['phase_voltage_a'])\
                .field("phase_voltage_b", data['phase_voltage_b'])\
                .field("phase_voltage_c", data['phase_voltage_c'])\
                .field("grid_frequency", data['grid_frequency'])\
                .field("turbine_frequency", data['turbine_frequency'])\
                .field("board_temp", data['board_temp'])\
                .field("pro_state", data['pro_state'])\
                .field("phase_current_a", data['phase_current_a'])\
                .field("phase_current_b", data['phase_current_b'])\
                .field("phase_current_c", data['phase_current_c'])\
                .field("power_factor", data['power_factor'])\
                .field("panel_temp", data['panel_temp'])\
                .field("igbt_temp", data['igbt_temp'])\
                .field("grid_state", data['grid_state'])\
                .field("output_power", data['output_power'])\
                .field("fan_current", data['fan_current'])\
                .field("torque", data['torque'])\
                .field("transformer_temp", data['transformer_temp'])\
                .field("ctrl_mode", data['ctrl_mode'])\
                .field("zero_sequence_voltage", data['zero_sequence_voltage'])\
                .field("zero_sequence_current", data['zero_sequence_current'])\
                .field("negative_sequence_voltage", data['negative_sequence_voltage'])\
                .field("negative_sequence_current", data['negative_sequence_current'])\
                .time(datetime.utcnow())
            
            self.write_api.write(bucket=Config.INFLUXDB_BUCKET, record=point)
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def write_weather_data(self, data):
        """寫入氣象數據"""
        try:
            point = Point("weather_data")\
                .tag("site_id", data['site_id'])\
                .field("weather_status", data['weather_status'])\
                .field("temperature", data['temperature'])\
                .field("wind_direction", data['wind_direction'])\
                .field("air_density_50m", data['air_density_50m'])\
                .field("air_density_100m", data['air_density_100m'])\
                .field("air_density_150m", data['air_density_150m'])\
                .time(datetime.utcnow())
            
            self.write_api.write(bucket=Config.INFLUXDB_BUCKET, record=point)
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def write_solar_data(self, data):
        """寫入太陽能發電數據"""
        try:
            point = Point("solar_data")\
                .tag("equipment_id", data['equipment_id'])\
                .tag("site_id", data['site_id'])\
                .field("current", data['current'])\
                .field("voltage", data['voltage'])\
                .field("power", data['power'])\
                .field("panel_temp", data['panel_temp'])\
                .field("inverter_temp", data['inverter_temp'])\
                .field("efficiency", data['efficiency'])\
                .field("run_status", data['run_status'])\
                .time(datetime.utcnow())
            
            self.write_api.write(bucket=Config.INFLUXDB_BUCKET, record=point)
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def write_battery_data(self, data):
        """寫入儲能櫃數據"""
        try:
            point = Point("battery_data")\
                .tag("equipment_id", data['equipment_id'])\
                .tag("site_id", data['site_id'])\
                .field("voltage", data['voltage'])\
                .field("current", data['current'])\
                .field("power", data['power'])\
                .field("soc", data['soc'])\
                .field("temperature", data['temperature'])\
                .field("cycle_count", data['cycle_count'])\
                .field("health_status", data['health_status'])\
                .field("charging_status", data['charging_status'])\
                .time(datetime.utcnow())
            
            self.write_api.write(bucket=Config.INFLUXDB_BUCKET, record=point)
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def _process_query_result(self, result):
        """處理查詢結果"""
        data = []
        for table in result:
            for record in table.records:
                data.append({
                    'time': record.get_time().isoformat(),
                    'value': record.get_value(),
                    'field': record.get_field(),
                    **record.values
                })
        return data

    def archive_cold_data(self):
        """歸檔冷數據（每月執行一次）"""
        try:
            # 獲取上個月的數據
            last_month = datetime.now() - timedelta(days=30)
            query = f'''
            from(bucket: "{Config.INFLUXDB_BUCKET}")
                |> range(start: {last_month.isoformat()}, stop: now())
            '''
            result = self.query_api.query(query)
            
            # 壓縮數據
            data = self._process_query_result(result)
            compressed_data = gzip.compress(json.dumps(data).encode('utf-8'))
            
            # 上傳到 S3
            file_name = f"archive/{last_month.strftime('%Y-%m')}.gz"
            self.s3_client.put_object(
                Bucket=Config.AWS_BUCKET,
                Key=file_name,
                Body=compressed_data
            )
            
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)} 