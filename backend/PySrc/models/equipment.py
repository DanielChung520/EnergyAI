from extensions import db

class Equipment(db.Model):
    __tablename__ = 'equipments'

    id = db.Column(db.String(36), primary_key=True)
    model_no = db.Column(db.String(50), nullable=False)
    desc_cn = db.Column(db.Text)
    desc_en = db.Column(db.Text)
    equ_type = db.Column(db.String(20), nullable=False)
    power = db.Column(db.Float, nullable=False)
    voltage = db.Column(db.Float, nullable=False)
    useful_life = db.Column(db.Integer)
    iso14064 = db.Column(db.Enum('y', 'n'))
    iso14001 = db.Column(db.Enum('y', 'n'))
    remark = db.Column(db.Text)

    def __repr__(self):
        return f'<Equipment {self.model_no}>'

class SolarEquipmentDetail(db.Model):
    __tablename__ = 'solar_equipment_details'

    equipment_id = db.Column(db.String(36), db.ForeignKey('equipments.id'), primary_key=True)
    model_no = db.Column(db.String(50))
    efficiency = db.Column(db.Float)
    dimensions = db.Column(db.String(50))
    type = db.Column(db.String(20))
    durability_range_from = db.Column(db.Float)
    durability_range_to = db.Column(db.Float)

    def __repr__(self):
        return f'<SolarEquipmentDetail {self.model_no}>'

class WindEquipmentDetail(db.Model):
    __tablename__ = 'wind_equipment_details'

    equipment_id = db.Column(db.String(36), primary_key=True)
    model_no = db.Column(db.String(50))
    efficiency = db.Column(db.Float)
    wind_speed_range_from = db.Column(db.Float)
    wind_speed_range_to = db.Column(db.Float)
    rpm_range_from = db.Column(db.Float)
    rpm_range_to = db.Column(db.Float)
    pole_height = db.Column(db.Float)
    base_height = db.Column(db.Float)
    blade_diameter = db.Column(db.Float)
    type = db.Column(db.String(20))
    location_type = db.Column(db.String(20))
    durability_range_from = db.Column(db.Float)
    durability_range_to = db.Column(db.Float)
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

    def __repr__(self):
        return f'<WindEquipmentDetail {self.model_no}>' 