from extensions import db
from models.equipment import Equipment, SolarEquipmentDetail, WindEquipmentDetail
import uuid
from datetime import datetime

class EquipmentService:
    def get_all_equipments(self):
        """獲取所有設備"""
        return Equipment.query.all()

    def get_equipment(self, equipment_id):
        """獲取特定設備"""
        return Equipment.query.get(equipment_id)

    def create_equipment(self, equipment_data):
        """創建新設備"""
        try:
            # 處理 useful_life 欄位，設置預設值為 5
            useful_life = equipment_data.get('useful_life')
            if not useful_life or useful_life == '':
                useful_life = 5  # 預設使用年限為 5 年

            new_equipment = Equipment(
                id=str(uuid.uuid4()),
                model_no=equipment_data['model_no'],
                desc_cn=equipment_data.get('desc_cn', ''),
                desc_en=equipment_data.get('desc_en', ''),
                equ_type=equipment_data['equ_type'],
                power=equipment_data['power'],
                voltage=equipment_data['voltage'],
                useful_life=useful_life,  # 使用處理後的值
                iso14064=equipment_data.get('iso14064', 'n'),
                iso14001=equipment_data.get('iso14001', 'n'),
                remark=equipment_data.get('remark', '')
            )
            db.session.add(new_equipment)
            db.session.commit()
            return {'success': True, 'id': new_equipment.id}
        except Exception as e:
            db.session.rollback()
            print(f"Error in create_equipment: {str(e)}")
            return {'success': False, 'error': str(e)}

    def update_equipment(self, equipment_id, equipment_data):
        """更新設備"""
        try:
            equipment = Equipment.query.get(equipment_id)
            if equipment:
                for key, value in equipment_data.items():
                    setattr(equipment, key, value)
                db.session.commit()
                return {'success': True}
            else:
                return {'success': False, 'error': 'Equipment not found'}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def delete_equipment(self, equipment_id):
        """刪除設備"""
        try:
            equipment = Equipment.query.get(equipment_id)
            if equipment:
                db.session.delete(equipment)
                db.session.commit()
                return {'success': True, 'message': 'Equipment deleted successfully'}
            else:
                return {'success': False, 'error': 'Equipment not found'}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def get_wind_details(self, equipment_id):
        """獲取風機詳細資料"""
        # 此方法可以根據需要進行修改或刪除
        pass

    def save_wind_details(self, equipment_id, wind_data):
        """保存風機詳細資料"""
        # 此方法可以根據需要進行修改或刪除
        pass

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
            print(f"Error in create_solar_equipment_detail: {str(e)}")
            return {'success': False, 'error': str(e)}

    def get_solar_equipment_detail(self, equipment_id):
        """獲取特定太陽能設備詳細資料"""
        return SolarEquipmentDetail.query.get(equipment_id)

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

    def get_all_solar_equipment_details(self):
        """獲取所有太陽能設備詳細資料"""
        return SolarEquipmentDetail.query.all()

    def create_wind_equipment_detail(self, detail_data):
        """創建新的風機設備詳細資料"""
        try:
            # 檢查傳入的數據
            print("Received data for wind details:", detail_data)
            
            new_detail = WindEquipmentDetail(
                equipment_id=detail_data['equipment_id'],
                model_no=detail_data.get('model_no', ''),
                efficiency=detail_data['efficiency'],
                wind_speed_range_from=detail_data['wind_speed_range_from'],
                wind_speed_range_to=detail_data['wind_speed_range_to'],
                rpm_range_from=detail_data['rpm_range_from'],
                rpm_range_to=detail_data['rpm_range_to'],
                pole_height=detail_data['pole_height'],
                base_height=detail_data['base_height'],
                blade_diameter=detail_data['blade_diameter'],
                type=detail_data['type'],
                location_type=detail_data['location_type'],
                durability_range_from=detail_data['durability_range_from'],
                durability_range_to=detail_data['durability_range_to'],
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            db.session.add(new_detail)
            db.session.commit()
            return {'success': True, 'equipment_id': new_detail.equipment_id}
        except Exception as e:
            db.session.rollback()
            print(f"Error in create_wind_equipment_detail: {str(e)}")
            return {'success': False, 'error': str(e)}

    def get_wind_equipment_detail(self, equipment_id):
        """獲取特定風機設備詳細資料"""
        return WindEquipmentDetail.query.get(equipment_id)

    def update_wind_equipment_detail(self, equipment_id, detail_data):
        """更新風機設備詳細資料"""
        try:
            detail = WindEquipmentDetail.query.get(equipment_id)
            if detail:
                for key, value in detail_data.items():
                    setattr(detail, key, value)
                detail.updated_at = datetime.now()
                db.session.commit()
                return {'success': True}
            else:
                return {'success': False, 'error': 'Detail not found'}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def delete_wind_equipment_detail(self, equipment_id):
        """刪除風機設備詳細資料"""
        try:
            detail = WindEquipmentDetail.query.get(equipment_id)
            if detail:
                db.session.delete(detail)
                db.session.commit()
                return {'success': True, 'message': 'Detail deleted successfully'}
            else:
                return {'success': False, 'error': 'Detail not found'}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    def get_all_wind_equipment_details(self):
        """獲取所有風機設備詳細資料"""
        return WindEquipmentDetail.query.all() 