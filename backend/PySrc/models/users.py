import uuid
from extensions import db
import bcrypt
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class User(db.Model):
    __tablename__ = 'users'

    uuid = db.Column(db.String(32), primary_key=True)
    userid = db.Column(db.String(20), unique=True, nullable=False)
    role = db.Column(db.String(45), default=None)
    password = db.Column(db.String(128), nullable=False)
    nickname = db.Column(db.String(255))
    org = db.Column(db.String(45))
    empno = db.Column(db.String(45))
    email = db.Column(db.String(255))
    phone = db.Column(db.String(20))
    remark = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.Index('idx_userid', 'userid'),
    )

    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)
        logger.debug(f"Creating User instance with data: {kwargs}")

    def __repr__(self):
        return f'<User {self.userid}>'

    def to_dict(self):
        return {
            'uuid': self.uuid,
            'userid': self.userid,
            'role': self.role,
            'nickname': self.nickname,
            'org': self.org,
            'empno': self.empno,
            'email': self.email,
            'phone': self.phone,
            'remark': self.remark,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    @staticmethod
    def generate_uuid():
        return uuid.uuid4().hex

    @staticmethod
    def hash_password(password):
        """
        對密碼進行加密
        """
        if isinstance(password, str):
            password = password.encode('utf-8')
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password, salt).decode('utf-8')

    def verify_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))