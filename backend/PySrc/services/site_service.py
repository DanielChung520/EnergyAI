from extensions import db
from models.site import Site, SolarSite, WindSite, SiteEquipment, SitePerformance, SiteEquipListView
import uuid
from datetime import datetime

class SiteService:
    def __init__(self):
        pass  # 移除 CSV 相關的初始化代碼
    
    def get_all_sites(self):
        """獲取所有站點"""
        try:
            sites = Site.query.all()
            print("Database query result:", sites)  # 添加調試信息
            site_list = [site.to_dict() for site in sites]
            print("Converted site list:", site_list)  # 添加調試信息
            return site_list
        except Exception as e:
            print(f"Error getting all sites: {e}")
            db.session.rollback()  # 添加回滾
            return []

    def get_site_by_id(self, site_id):
        """根據 ID 獲取站點"""
        try:
            site = Site.query.get(site_id)
            if site is None:
                return None
            return site  # 返回模型實例
        except Exception as e:
            print(f"Error getting site by id: {e}")
            return None

    def create_site(self, site_data):
        """創建新站點"""
        try:
            # 在後台生成 UUID 作為 siteId
            site_data['id'] = str(uuid.uuid4())  # 自動生成 UUID
            new_site = Site(
                id=site_data['id'],
                name=site_data['name'],
                company=site_data['company'],
                country=site_data['country'],
                province=site_data['province'],
                address=site_data['address'],
                latitude=site_data['latitude'],
                longitude=site_data['longitude'],
                site_type=site_data['site_type'],
                capacity=site_data['capacity'],
                capacity_params=site_data['capacity_params'],
                approval_number=site_data['approval_number'],
                approval_date=site_data['approval_date'],
                area=site_data['area'],
                construction_date=site_data['construction_date'],
                operation_date=site_data['operation_date']
            )

            # 寫入數據庫
            db.session.add(new_site)
            db.session.commit()

            return {'success': True, 'id': site_data['id']}  # 返回生成的 ID
        except Exception as e:
            db.session.rollback()  # 回滾事務
            print(f"Error creating site: {e}")
            return {'success': False, 'error': str(e)}

    def update_site(self, site_id, site_data):
        """更新站點信息"""
        try:
            site = self.get_site_by_id(site_id)  # 獲取模型實例
            if site:
                # 明確列出需要更新的字段
                site.company = site_data.get('company', site.company)
                site.country = site_data.get('country', site.country)
                site.province = site_data.get('province', site.province)
                site.address = site_data.get('address', site.address)
                site.latitude = site_data.get('latitude', site.latitude)
                site.longitude = site_data.get('longitude', site.longitude)
                site.site_type = site_data.get('siteType', site.site_type)
                site.capacity = site_data.get('capacity', site.capacity)
                site.capacity_params = site_data.get('capacityParams', site.capacity_params)
                site.approval_number = site_data.get('approvalNumber', site.approval_number)
                
                # 處理日期字段
                if 'approval_date' in site_data:
                    site.approval_date = datetime.strptime(site_data['approval_date'], '%Y-%m-%d').date()
                if 'construction_date' in site_data:
                    site.construction_date = datetime.strptime(site_data['construction_date'], '%Y-%m-%d').date()
                if 'operation_date' in site_data:
                    site.operation_date = datetime.strptime(site_data['operation_date'], '%Y-%m-%d').date()
                
                site.area = site_data.get('area', site.area)
                
                db.session.commit()
                return {"success": True, "message": "Site updated successfully"}
            else:
                return {"success": False, "error": "Site not found"}
        except Exception as e:
            db.session.rollback()
            print(f"Error updating site: {e}")
            return {"success": False, "error": str(e)}

    def delete_site(self, site_id):
        """刪除案場"""
        try:
            site = self.get_site_by_id(site_id)
            if site:
                db.session.delete(site)
                db.session.commit()
                return {"success": True, "message": "Site deleted successfully"}
            else:
                return {"success": False, "error": "Site not found"}
        except Exception as e:
            db.session.rollback()  # 回滾事務
            return {"success": False, "error": str(e)}

    def get_wind_site_details(self, site_id):
        """獲取風電案場詳細信息"""
        return db.session.query(WindSite).filter(WindSite.site_id == site_id).first()

    def create_wind_site_details(self, site_id, details_data):
        """創建風電站詳細信息"""
        try:
            new_wind_site = WindSite(
                site_id=site_id,
                turbine_model=details_data['turbine_model'],
                height=details_data['height'],
                air_density=details_data['air_density'],
                avg_wind_speed=details_data['avg_wind_speed'],
                spring_avg_wind_speed=details_data['spring_avg_wind_speed'],
                spring_wind_direction=details_data['spring_wind_direction'],
                summer_avg_wind_speed=details_data['summer_avg_wind_speed'],
                summer_wind_direction=details_data['summer_wind_direction'],
                autumn_avg_wind_speed=details_data['autumn_avg_wind_speed'],
                autumn_wind_direction=details_data['autumn_wind_direction'],
                winter_avg_wind_speed=details_data['winter_avg_wind_speed'],
                winter_wind_direction=details_data['winter_wind_direction'],
                remark=details_data.get('remark', ''),
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            db.session.add(new_wind_site)
            db.session.commit()
            return {'success': True}
        except Exception as e:
            db.session.rollback()
            print(f"Error creating wind site details: {e}")
            return {'success': False, 'error': str(e)}

    def get_solar_site_details(self, site_id):
        """獲取太陽能案場詳細信息"""
        return db.session.query(SolarSite).filter(SolarSite.site_id == site_id).first()

    def create_solar_site_details(self, site_id, details_data):
        """創建太陽能站詳細信息"""
        try:
            new_solar_site = SolarSite(
                site_id=site_id,
                module_type=details_data['module_type'],
                bracket_height=details_data['bracket_height'],
                annual_sunlight=details_data['annual_sunlight'],
                output_voltage=details_data['output_voltage'],
                inverter_output=details_data['inverter_output'],
                ground_direction=details_data['ground_direction'],
                sunlight_direction=details_data['sunlight_direction'],
                avg_temperature=details_data['avg_temperature'],
                avg_rainfall=details_data['avg_rainfall'],
                avg_wind_speed=details_data['avg_wind_speed'],
                remark=details_data.get('remark', ''),
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            db.session.add(new_solar_site)
            db.session.commit()
            return {'success': True}
        except Exception as e:
            db.session.rollback()
            print(f"Error creating solar site details: {e}")
            return {'success': False, 'error': str(e)}

    def get_site_equipments(self, site_id):
        """獲取指定站點的所有設備"""
        return db.session.query(SiteEquipment).filter(SiteEquipment.site_id == site_id).all()

    def create_site_equipment(self, equipment_data):
        """創建新的設備"""
        try:
            new_equipment = SiteEquipment(
                id=str(uuid.uuid4()),
                site_id=equipment_data['site_id'],
                equip_id=equipment_data['equip_id'],
                name=equipment_data['name'],
                model_no=equipment_data['model_no'],
                asset_no=equipment_data['asset_no'],
                purchase_date=equipment_data['purchase_date'],
                operat_date=equipment_data['operat_date'],
                location=equipment_data['location'],
                backup=equipment_data['backup'],
                status=equipment_data['status'],
                remark=equipment_data.get('remark', ''),
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            db.session.add(new_equipment)
            db.session.commit()
            return {'success': True}
        except Exception as e:
            db.session.rollback()
            print(f"Error creating site equipment: {e}")
            return {'success': False, 'error': str(e)}

    def delete_site_equipment(self, equipment_id):
        """刪除指定的設備"""
        try:
            equipment = db.session.query(SiteEquipment).filter(SiteEquipment.id == equipment_id).first()
            if equipment:
                db.session.delete(equipment)
                db.session.commit()
                return {'success': True, 'message': 'Equipment deleted successfully'}
            else:
                return {'success': False, 'error': 'Equipment not found'}
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting site equipment: {e}")
            return {'success': False, 'error': str(e)}

    def update_site_equipment(self, equipment_id, equipment_data):
        """更新設備信息"""
        try:
            equipment = db.session.query(SiteEquipment).filter(SiteEquipment.id == equipment_id).first()
            if equipment:
                equipment.equip_id = equipment_data.get('equip_id', equipment.equip_id)
                equipment.name = equipment_data.get('name', equipment.name)
                equipment.model_no = equipment_data.get('model_no', equipment.model_no)
                equipment.asset_no = equipment_data.get('asset_no', equipment.asset_no)
                equipment.purchase_date = equipment_data.get('purchase_date', equipment.purchase_date)
                equipment.operat_date = equipment_data.get('operat_date', equipment.operat_date)
                equipment.location = equipment_data.get('location', equipment.location)
                equipment.backup = equipment_data.get('backup', equipment.backup)
                equipment.status = equipment_data.get('status', equipment.status)
                equipment.remark = equipment_data.get('remark', equipment.remark)
                equipment.updated_at = datetime.now()
                db.session.commit()
                return {'success': True, 'message': 'Equipment updated successfully'}
            else:
                return {'success': False, 'error': 'Equipment not found'}
        except Exception as e:
            db.session.rollback()
            print(f"Error updating site equipment: {e}")
            return {'success': False, 'error': str(e)}

    def update_wind_site_details(self, site_id, details_data):
        """更新風電站詳細信息"""
        try:
            wind_site = db.session.query(WindSite).filter(WindSite.site_id == site_id).first()
            if wind_site:
                wind_site.turbine_model = details_data.get('turbine_model', wind_site.turbine_model)
                wind_site.height = details_data.get('height', wind_site.height)
                wind_site.air_density = details_data.get('air_density', wind_site.air_density)
                wind_site.avg_wind_speed = details_data.get('avg_wind_speed', wind_site.avg_wind_speed)
                wind_site.spring_avg_wind_speed = details_data.get('spring_avg_wind_speed', wind_site.spring_avg_wind_speed)
                wind_site.spring_wind_direction = details_data.get('spring_wind_direction', wind_site.spring_wind_direction)
                wind_site.summer_avg_wind_speed = details_data.get('summer_avg_wind_speed', wind_site.summer_avg_wind_speed)
                wind_site.summer_wind_direction = details_data.get('summer_wind_direction', wind_site.summer_wind_direction)
                wind_site.autumn_avg_wind_speed = details_data.get('autumn_avg_wind_speed', wind_site.autumn_avg_wind_speed)
                wind_site.autumn_wind_direction = details_data.get('autumn_wind_direction', wind_site.autumn_wind_direction)
                wind_site.winter_avg_wind_speed = details_data.get('winter_avg_wind_speed', wind_site.winter_avg_wind_speed)
                wind_site.winter_wind_direction = details_data.get('winter_wind_direction', wind_site.winter_wind_direction)
                wind_site.remark = details_data.get('remark', wind_site.remark)
                wind_site.updated_at = datetime.now()
                db.session.commit()
                return {'success': True, 'message': 'Wind site details updated successfully'}
            else:
                return {'success': False, 'error': 'Wind site not found'}
        except Exception as e:
            db.session.rollback()
            print(f"Error updating wind site details: {e}")
            return {'success': False, 'error': str(e)}

    def update_solar_site_details(self, site_id, details_data):
        """更新太陽能站點詳細信息"""
        try:
            solar_site = db.session.query(SolarSite).filter(SolarSite.site_id == site_id).first()
            if solar_site:
                solar_site.module_type = details_data.get('module_type', solar_site.module_type)
                solar_site.bracket_height = details_data.get('bracket_height', solar_site.bracket_height)
                solar_site.annual_sunlight = details_data.get('annual_sunlight', solar_site.annual_sunlight)
                solar_site.output_voltage = details_data.get('output_voltage', solar_site.output_voltage)
                solar_site.inverter_output = details_data.get('inverter_output', solar_site.inverter_output)
                solar_site.ground_direction = details_data.get('ground_direction', solar_site.ground_direction)
                solar_site.sunlight_direction = details_data.get('sunlight_direction', solar_site.sunlight_direction)
                solar_site.avg_temperature = details_data.get('avg_temperature', solar_site.avg_temperature)
                solar_site.avg_rainfall = details_data.get('avg_rainfall', solar_site.avg_rainfall)
                solar_site.avg_wind_speed = details_data.get('avg_wind_speed', solar_site.avg_wind_speed)
                solar_site.remark = details_data.get('remark', solar_site.remark)
                solar_site.updated_at = datetime.now()
                db.session.commit()
                return {'success': True, 'message': 'Solar site details updated successfully'}
            else:
                return {'success': False, 'error': 'Solar site not found'}
        except Exception as e:
            db.session.rollback()
            print(f"Error updating solar site details: {e}")
            return {'success': False, 'error': str(e)}

    def delete_wind_site_details(self, site_id):
        """刪除風電站詳細信息"""
        try:
            wind_site = db.session.query(WindSite).filter(WindSite.site_id == site_id).first()
            if wind_site:
                db.session.delete(wind_site)
                db.session.commit()
                return {'success': True, 'message': 'Wind site deleted successfully'}
            else:
                return {'success': False, 'error': 'Wind site not found'}
        except Exception as e:
            db.session.rollback()  # 回滾事務
            print(f"Error deleting wind site details: {e}")
            return {'success': False, 'error': str(e)}

    def delete_solar_site_details(self, site_id):
        """刪除太陽能站詳細信息"""
        try:
            solar_site = db.session.query(SolarSite).filter(SolarSite.site_id == site_id).first()
            if solar_site:
                db.session.delete(solar_site)
                db.session.commit()
                return {'success': True, 'message': 'Solar site deleted successfully'}
            else:
                return {'success': False, 'error': 'Solar site not found'}
        except Exception as e:
            db.session.rollback()  # 回滾事務
            print(f"Error deleting solar site details: {e}")
            return {'success': False, 'error': str(e)}

    def get_site_equipment_by_id(self, equipment_id):
        """根據設備 ID 獲取設備信息"""
        return db.session.query(SiteEquipment).filter(SiteEquipment.id == equipment_id).first()

    def create_site_performance(self, performance_data):
        """創建新的站點性能記錄"""
        try:
            new_performance = SitePerformance(
                site_id=performance_data['site_id'],
                year_mon=performance_data['year_mon'],
                output_ttl=performance_data['output_ttl'],
                output_avg=performance_data['output_avg']
            )
            db.session.add(new_performance)
            db.session.commit()
            return {'success': True}
        except Exception as e:
            db.session.rollback()
            print(f"Error creating site performance: {e}")
            return {'success': False, 'error': str(e)}

    def get_site_performance_by_id(self, site_id):
        """根據站點 ID 獲取性能記錄"""
        return db.session.query(SitePerformance).filter(SitePerformance.site_id == site_id).all()

    def get_site_performance_by_year(self, site_id, year_mon_start, year_mon_end):
        """根據站點 ID 和年份獲取性能記錄"""
        return db.session.query(SitePerformance).filter(
            SitePerformance.site_id == site_id,
            SitePerformance.year_mon >= year_mon_start,
            SitePerformance.year_mon <= year_mon_end
        ).all()

    def get_equip_list_bySiteId(self, site_id):
        """根據 site_id 查詢設備列表"""
        try:
            query = db.session.query(SiteEquipListView)
            query = query.filter(SiteEquipListView.site_id == site_id)
            
            # 打印原始 SQL
            print(f"Generated SQL: {query.statement.compile(compile_kwargs={'literal_binds': True})}")
            
            # 執行查詢
            results = query.all()
            print(f"Total records: {len(results)}")
            
            # 轉換為字典列表
            equipment_list = [item.to_dict() for item in results]
            
            # 打印前幾筆記錄
            for i, item in enumerate(equipment_list[:5]):
                print(f"Record {i + 1}: {item}")
            
            return equipment_list
        except Exception as e:
            print(f"Error getting equip list: {e}")
            print(f"Error type: {type(e)}")
            print(f"Error details: {str(e)}")
            db.session.rollback()
            return []

    def get_equip_list_byEquipId(self, equip_id):
        """根據 equip_id 查詢設備列表"""
        try:
            query = db.session.query(SiteEquipListView)

            query = query.filter(SiteEquipListView.equip_id == equip_id)
            
            # 獲取結果並轉換為字典列表
            results = query.all()
            equipment_list = [item.to_dict() for item in results]
            
            # 添加調試日誌
            print(f"SQL Query for equipment {equip_id}: {query}")
            print(f"Results count: {len(equipment_list)}")
            
            return equipment_list
        except Exception as e:
            print(f"Error getting equip list by equipment: {e}")
            db.session.rollback()
            return []

    def get_all_equip_list(self):
        """獲取所有設備列表"""
        try:
            return db.session.query(SiteEquipListView).all()
        except Exception as e:
            print(f"Error getting all equip list: {e}")
            return [] 