import uuid
from extensions import db
import bcrypt
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class SystemSetting(db.Model):
    __tablename__ = 'system_settings'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category = db.Column(db.String(50), nullable=False)
    setting_key = db.Column(db.String(50), nullable=False)
    setting_value = db.Column(db.Text)
    updated_at = db.Column(db.TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.String(50))

    __table_args__ = (
        db.UniqueConstraint('category', 'setting_key', name='unique_setting'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'setting_key': self.setting_key,
            'setting_value': self.setting_value,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'updated_by': self.updated_by
        }

class SystemSettingHistory(db.Model):
    __tablename__ = 'system_settings_history'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category = db.Column(db.String(50), nullable=False)
    setting_key = db.Column(db.String(50), nullable=False)
    old_value = db.Column(db.Text)
    new_value = db.Column(db.Text)
    updated_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    updated_by = db.Column(db.String(50))

    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'setting_key': self.setting_key,
            'old_value': self.old_value,
            'new_value': self.new_value,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'updated_by': self.updated_by
        }

    @classmethod
    def log_change(cls, category, key, old_value, new_value, user=None):
        """
        記錄設置變更
        """
        history = cls(
            category=category,
            setting_key=key,
            old_value=old_value,
            new_value=new_value,
            updated_by=user
        )
        db.session.add(history)
        return history
