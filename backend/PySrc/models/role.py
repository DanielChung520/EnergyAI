from datetime import datetime
from extensions import db
import uuid

class Role(db.Model):
    __tablename__ = 'roles'

    id = db.Column(db.String(50), primary_key=True)
    role = db.Column(db.String(45))
    desc = db.Column(db.String(45))
    desc_en = db.Column(db.String(45))
    security_level = db.Column(db.String(45))
    remark = db.Column(db.String(255))
    flag = db.Column(db.Integer)
    create_at = db.Column(db.DateTime, default=datetime.utcnow)
    update_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Role {self.role}>'

class RoleFunction(db.Model):
    __tablename__ = 'role_function'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    role = db.Column(db.String(36), db.ForeignKey('roles.id'), nullable=False)
    function = db.Column(db.String(36), nullable=False)
    permission = db.Column(db.String(1), nullable=False, default='r')
    create_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    update_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<RoleFunction {self.role} - {self.function}>'
