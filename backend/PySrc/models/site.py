from dataclasses import dataclass
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime
from extensions import db

@dataclass
class Site:
    id: str
    name: str
    company: str
    country: str
    province: str
    address: str
    latitude: float
    longitude: float
    site_type: str
    capacity: float
    capacity_params: str
    approval_number: str
    approval_date: datetime
    area: float
    construction_date: datetime
    operation_date: datetime

class Site(db.Model):
    __tablename__ = 'sites'

    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(255))
    company = db.Column(db.String(255))
    country = db.Column(db.String(100))
    province = db.Column(db.String(100))
    address = db.Column(db.String(255))
    latitude = db.Column(db.Numeric(10, 8))
    longitude = db.Column(db.Numeric(11, 8))
    site_type = db.Column(db.String(50))
    capacity = db.Column(db.Integer)
    capacity_params = db.Column(db.String(50))
    approval_number = db.Column(db.String(50))
    approval_date = db.Column(db.Date)
    area = db.Column(db.Integer)
    construction_date = db.Column(db.Date)
    operation_date = db.Column(db.Date)
    siteType = db.Column(db.String(50))
    capacityParams = db.Column(db.String(50))
    approvalNumber = db.Column(db.String(50))
    approvalDate = db.Column(db.DateTime)
    constructionDate = db.Column(db.DateTime)
    operationDate = db.Column(db.DateTime)

    def to_dict(self):
       return {
           'id': self.id,
           'name': self.name,
           'company': self.company,
           'country': self.country,
           'province': self.province,
           'address': self.address,
           'latitude': float(self.latitude) if self.latitude else None,
           'longitude': float(self.longitude) if self.longitude else None,
           'site_type': self.site_type,
           'capacity': self.capacity,
           'capacity_params': self.capacity_params,
           'approval_number': self.approval_number,
           'approval_date': self.approval_date.strftime('%Y-%m-%d') if self.approval_date else None,
           'area': self.area,
           'construction_date': self.construction_date.strftime('%Y-%m-%d') if self.construction_date else None,
           'operation_date': self.operation_date.strftime('%Y-%m-%d') if self.operation_date else None,
           'siteType': self.siteType,
           'capacityParams': self.capacityParams,
           'approvalNumber': self.approvalNumber,
           'approvalDate': self.approvalDate.strftime('%Y-%m-%d %H:%M:%S') if self.approvalDate else None,
           'constructionDate': self.constructionDate.strftime('%Y-%m-%d %H:%M:%S') if self.constructionDate else None,
           'operationDate': self.operationDate.strftime('%Y-%m-%d %H:%M:%S') if self.operationDate else None
       }

@dataclass
class SolarSite:
    site_id: str
    module_type: str
    bracket_height: float
    annual_sunlight: float
    output_voltage: float
    inverter_output: float
    ground_direction: str
    sunlight_direction: str
    avg_temperature: float
    avg_rainfall: float
    avg_wind_speed: float
    remark: str
    created_at: datetime
    updated_at: datetime

class SolarSite(db.Model):
    __tablename__ = 'solar_sites'

    site_id = Column(String(36), primary_key=True)
    module_type = Column(String(50))
    bracket_height = Column(Float)
    annual_sunlight = Column(Float)
    output_voltage = Column(Float)
    inverter_output = Column(Float)
    ground_direction = Column(String(50))
    sunlight_direction = Column(String(50))
    avg_temperature = Column(Float)
    avg_rainfall = Column(Float)
    avg_wind_speed = Column(Float)
    remark = Column(String(255))
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

@dataclass
class WindSite:
    __tablename__ = 'wind_sites'
    site_id: str
    turbine_model: str
    height: float
    air_density: float
    avg_wind_speed: float
    spring_avg_wind_speed: float
    spring_wind_direction: str
    summer_avg_wind_speed: float
    summer_wind_direction: str
    autumn_avg_wind_speed: float
    autumn_wind_direction: str
    winter_avg_wind_speed: float
    winter_wind_direction: str
    remark: str
    created_at: datetime
    updated_at: datetime

class WindSite(db.Model):
    __tablename__ = 'wind_sites'

    site_id = Column(String(36), primary_key=True)
    turbine_model = Column(String(50))
    height = Column(Float)
    air_density = Column(Float)
    avg_wind_speed = Column(Float)
    spring_avg_wind_speed = Column(Float)
    spring_wind_direction = Column(String(50))
    summer_avg_wind_speed = Column(Float)
    summer_wind_direction = Column(String(50))
    autumn_avg_wind_speed = Column(Float)
    autumn_wind_direction = Column(String(50))
    winter_avg_wind_speed = Column(Float)
    winter_wind_direction = Column(String(50))
    remark = Column(String(255))
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

class SiteEquipment(db.Model):
    __tablename__ = 'site_equipments'

    id = db.Column(db.String(36), primary_key=True)
    site_id = db.Column(db.String(36), db.ForeignKey('sites.id'), nullable=False)
    equip_id = db.Column(db.String(45), nullable=True)
    name = db.Column(db.String(45), nullable=True)
    model_no = db.Column(db.String(50), nullable=False)
    asset_no = db.Column(db.String(50), nullable=False)
    purchase_date = db.Column(db.Date, nullable=False)
    operat_date = db.Column(db.Date, nullable=False)
    location = db.Column(db.String(255), nullable=False)
    backup = db.Column(db.Enum('y', 'n'), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    remark = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    def __repr__(self):
        return f'<SiteEquipment {self.model_no}>'

class SitePerformance(db.Model):
    __tablename__ = 'site_performance'

    site_id = db.Column(db.String(36), db.ForeignKey('sites.id'), primary_key=True)
    year_mon = db.Column(db.String(7), primary_key=True)
    output_ttl = db.Column(db.Numeric(12, 4), nullable=False)
    output_avg = db.Column(db.Numeric(12, 4), nullable=False)

    def __repr__(self):
        return f'<SitePerformance site_id={self.site_id}, year_mon={self.year_mon}>'

@dataclass
# class SiteEquipListView:
#     site_id: str
#     # equip_id: str
#     model_no: str
#     asset_no: str
#     equ_type: str
#     # status: str
    
class SiteEquipListView(db.Model):
    __tablename__ = 'site_equip_list_v'
    
    # 使用 equip_id 作為主鍵
    equip_id = db.Column(db.String(36), primary_key=True)
    site_id = db.Column(db.String(36))
    site_name = db.Column(db.String(50))
    model_no = db.Column(db.String(50))
    asset_no = db.Column(db.String(50))
    equ_type = db.Column(db.String(50))
    status = db.Column(db.String(50))

    def to_dict(self):
        return {
            'site_id': self.site_id,
            'site_name':self.site_name,
            'equip_id': self.equip_id,
            'model_no': self.model_no,
            'asset_no': self.asset_no,
            'equ_type': self.equ_type,
            'status': self.status
        }
