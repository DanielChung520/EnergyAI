from dataclasses import dataclass
from datetime import datetime
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey
from extensions import db

@dataclass
class EquipmentLog:
    siteid: str
    equip_id: str
    equip_type: str
    powder_gen: float
    voltage: float
    current: float
    wind_speed: float
    run_speed: float
    temperature: float
    humidity: float
    emissions: float
    log_time: datetime

class EquipmentLog(db.Model):
    __tablename__ = 'equipment_logs'

    id = Column(db.Integer, primary_key=True, autoincrement=True)
    siteid = Column(db.String(50), nullable=False)
    equip_id = Column(db.String(50), nullable=False)
    equip_type = Column(db.String(50), nullable=False)
    powder_gen = Column(db.Numeric(10, 2))
    voltage = Column(db.Numeric(10, 2))
    current = Column(db.Numeric(10, 2))
    wind_speed = Column(db.Numeric(10, 2))
    run_speed = Column(db.Numeric(10, 2))
    temperature = Column(db.Numeric(10, 2))
    humidity = Column(db.Numeric(10, 2))
    emissions = Column(db.Numeric(10, 2))
    log_time = Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'siteid': self.siteid,
            'equip_id': self.equip_id,
            'equip_type': self.equip_type,
            'powder_gen': float(self.powder_gen) if self.powder_gen else None,
            'voltage': float(self.voltage) if self.voltage else None,
            'current': float(self.current) if self.current else None,
            'wind_speed': float(self.wind_speed) if self.wind_speed else None,
            'run_speed': float(self.run_speed) if self.run_speed else None,
            'temperature': float(self.temperature) if self.temperature else None,
            'humidity': float(self.humidity) if self.humidity else None,
            'emissions': float(self.emissions) if self.emissions else None,
            'log_time': self.log_time.strftime('%Y-%m-%d %H:%M:%S') if self.log_time else None
        }
