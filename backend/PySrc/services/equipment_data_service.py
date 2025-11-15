from influxdb_client import InfluxDBClient
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import logging
from extensions import db
from models.equipment import SolarEquipmentDetail
import uuid

# 配置日誌
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# 加載環境變量
load_dotenv()

class EquipmentDataService:
    def __init__(self):
        """初始化 InfluxDB 客戶端連接"""
        try:
            self.url = "http://localhost:8086"
            self.token = os.getenv('INFLUXDB_ADMIN_TOKEN')
            self.org = os.getenv('INFLUXDB_ORG')
            self.bucket = os.getenv('INFLUXDB_BUCKET')

            if not all([self.token, self.org, self.bucket]):
                raise ValueError("Missing required InfluxDB configuration")

            logger.info(f"Connecting to InfluxDB at {self.url}")
            logger.debug(f"Organization: {self.org}, Bucket: {self.bucket}")

            self.client = InfluxDBClient(
                url=self.url,
                token=self.token,
                org=self.org
            )
            
            # 測試連接
            health = self.client.health()
            if health.status == "pass":
                logger.info("Successfully connected to InfluxDB")
            else:
                logger.error(f"InfluxDB health check failed: {health.message}")

            self.query_api = self.client.query_api()

        except Exception as e:
            logger.error(f"Failed to initialize InfluxDB client: {str(e)}")
            raise

    def query_power_generation(self, site_id=None, equipment_type=None, 
                             equipment_id=None, start_time="-1h", fields=None):
        """
        查詢發電數據
        
        Args:
            site_id (str, optional): 場站ID
            equipment_type (str, optional): 設備類型
            equipment_id (str, optional): 設備ID
            start_time (str, optional): 開始時間
            fields (list, optional): 要查詢的字段列表
        """
        try:
            logger.info(f"Querying power generation data for equipment: {equipment_id}")
            logger.debug(f"Parameters: site_id={site_id}, start_time={start_time}, fields={fields}")

            query = f'from(bucket: "{self.bucket}")'
            
            if isinstance(start_time, str):
                query += f'\n  |> range(start: {start_time})'
            else:
                query += f'\n  |> range(start: {start_time.isoformat()}Z)'
            
            query += '\n  |> filter(fn: (r) => r["_measurement"] == "power_generation")'
            
            if site_id:
                query += f'\n  |> filter(fn: (r) => r["site_id"] == "{site_id}")'
            if equipment_type:
                query += f'\n  |> filter(fn: (r) => r["equipment_type"] == "{equipment_type}")'
            if equipment_id:
                query += f'\n  |> filter(fn: (r) => r["equipment_id"] == "{equipment_id}")'
            
            if fields:
                field_list = '", "'.join(fields)
                query += f'\n  |> filter(fn: (r) => contains(value: r["_field"], set: ["{field_list}"]))'
            
            logger.debug(f"Generated query: {query}")

            result = self.query_api.query(query)
            
            # 記錄查詢結果
            record_count = sum(1 for table in result for _ in table.records)
            logger.info(f"Query returned {record_count} records")

            return True, result

        except Exception as e:
            logger.error(f"Error querying power generation data: {str(e)}")
            return False, str(e)

    def query_equipment_status(self, site_id=None, equipment_type=None, 
                             equipment_id=None, start_time="-1h"):
        """
        查詢設備狀態數據
        
        Args:
            site_id (str, optional): 場站ID
            equipment_type (str, optional): 設備類型
            equipment_id (str, optional): 設備ID
            start_time (str, optional): 開始時間
        """
        query = f'''
        from(bucket: "{self.bucket}")
          |> range(start: {start_time})
          |> filter(fn: (r) => r["_measurement"] == "equipment_status")
        '''
        
        if site_id:
            query += f'\n  |> filter(fn: (r) => r["site_id"] == "{site_id}")'
        if equipment_type:
            query += f'\n  |> filter(fn: (r) => r["equipment_type"] == "{equipment_type}")'
        if equipment_id:
            query += f'\n  |> filter(fn: (r) => r["equipment_id"] == "{equipment_id}")'
        
        try:
            result = self.query_api.query(query)
            return True, result
        except Exception as e:
            return False, str(e)

    def query_environmental_data(self, site_id=None, start_time="-1h"):
        """
        查詢環境數據
        
        Args:
            site_id (str, optional): 場站ID
            start_time (str, optional): 開始時間
        """
        query = f'''
        from(bucket: "{self.bucket}")
          |> range(start: {start_time})
          |> filter(fn: (r) => r["_measurement"] == "environmental_data")
        '''
        
        if site_id:
            query += f'\n  |> filter(fn: (r) => r["site_id"] == "{site_id}")'
        
        try:
            result = self.query_api.query(query)
            return True, result
        except Exception as e:
            return False, str(e)

    def get_site_equipment_list(self, site_id):
        """
        獲取場站內的設備列表
        
        Args:
            site_id (str): 場站ID
        """
        query = f'''
        from(bucket: "{self.bucket}")
          |> range(start: -30d)
          |> filter(fn: (r) => r["site_id"] == "{site_id}")
          |> group(columns: ["equipment_type", "equipment_subtype", "equipment_id", "manufacturer"])
          |> distinct(column: "equipment_id")
        '''
        
        try:
            result = self.query_api.query(query)
            equipment_list = []
            for table in result:
                for record in table.records:
                    equipment_list.append({
                        'equipment_type': record.values.get('equipment_type'),
                        'equipment_subtype': record.values.get('equipment_subtype'),
                        'equipment_id': record.values.get('equipment_id'),
                        'manufacturer': record.values.get('manufacturer')
                    })
            return True, equipment_list
        except Exception as e:
            return False, str(e)

    def get_equipment_latest_data(self, site_id, equipment_id):
        """
        獲取設備的最新數據（包括發電數據和狀態數據）
        
        Args:
            site_id (str): 場站ID
            equipment_id (str): 設備ID
        """
        # 查詢發電數據
        power_query = f'''
        from(bucket: "{self.bucket}")
          |> range(start: -5m)
          |> filter(fn: (r) => r["_measurement"] == "power_generation")
          |> filter(fn: (r) => r["site_id"] == "{site_id}")
          |> filter(fn: (r) => r["equipment_id"] == "{equipment_id}")
          |> last()
        '''
        
        # 查詢狀態數據
        status_query = f'''
        from(bucket: "{self.bucket}")
          |> range(start: -5m)
          |> filter(fn: (r) => r["_measurement"] == "equipment_status")
          |> filter(fn: (r) => r["site_id"] == "{site_id}")
          |> filter(fn: (r) => r["equipment_id"] == "{equipment_id}")
          |> last()
        '''
        
        try:
            power_result = self.query_api.query(power_query)
            status_result = self.query_api.query(status_query)
            
            latest_data = {
                'power_generation': {},
                'status': {}
            }
            
            for table in power_result:
                for record in table.records:
                    latest_data['power_generation'][record.get_field()] = record.get_value()
            
            for table in status_result:
                for record in table.records:
                    latest_data['status'][record.get_field()] = record.get_value()
            
            return True, latest_data
        except Exception as e:
            return False, str(e)

    def close(self):
        """關閉 InfluxDB 客戶端連接"""
        try:
            self.client.close()
            logger.info("InfluxDB connection closed")
        except Exception as e:
            logger.error(f"Error closing InfluxDB connection: {str(e)}")

class SolarEquipmentService:
    def get_all_solar_equipment_details(self):
        """獲取所有太陽能設備詳細資料"""
        return SolarEquipmentDetail.query.all()

    def get_solar_equipment_detail(self, equipment_id):
        """獲取特定太陽能設備詳細資料"""
        return SolarEquipmentDetail.query.get(equipment_id)

    def create_solar_equipment_detail(self, detail_data):
        """創建新的太陽能設備詳細資料"""
        try:
            new_detail = SolarEquipmentDetail(
                equipment_id=detail_data['equipment_id'],
                model_no=detail_data.get('model_no', ''),
                efficiency=detail_data['efficiency'],
                dimensions=detail_data['dimensions'],
                type=detail_data['type'],
                durability_range_from=detail_data['durability_range_from'],
                durability_range_to=detail_data['durability_range_to']
            )
            db.session.add(new_detail)
            db.session.commit()
            return {'success': True, 'equipment_id': new_detail.equipment_id}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def update_solar_equipment_detail(self, equipment_id, detail_data):
        """更新太陽能設備詳細資料"""
        try:
            detail = SolarEquipmentDetail.query.get(equipment_id)
            if detail:
                for key, value in detail_data.items():
                    setattr(detail, key, value)
                db.session.commit()
                return {'success': True}
            else:
                return {'success': False, 'error': 'Detail not found'}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def delete_solar_equipment_detail(self, equipment_id):
        """刪除太陽能設備詳細資料"""
        try:
            detail = SolarEquipmentDetail.query.get(equipment_id)
            if detail:
                db.session.delete(detail)
                db.session.commit()
                return {'success': True, 'message': 'Detail deleted successfully'}
            else:
                return {'success': False, 'error': 'Detail not found'}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

# 使用示例
if __name__ == "__main__":
    # 創建服務實例
    service = EquipmentDataService()
    
    # 查詢特定場站的風機發電數據
    success, result = service.query_power_generation(
        site_id="site_001",
        equipment_type="wind",
        start_time="-15m"
    )
    
    if success:
        print("=== 發電數據 ===")
        for table in result:
            for record in table.records:
                print(f"時間: {record.get_time()}")
                print(f"設備: {record.values.get('equipment_id')}")
                print(f"數值: {record.get_value()}")
                print(f"字段: {record.get_field()}")
                print("---")
    else:
        print(f"查詢失敗: {result}")
    
    # 查詢場站設備列表
    success, equipment_list = service.get_site_equipment_list("site_001")
    if success:
        print("\n=== 場站設備列表 ===")
        for equipment in equipment_list:
            print(equipment)
    
    # 關閉連接
    service.close() 