from extensions import db
import uuid
from typing import Optional

class Function(db.Model):  # 繼承自 db.Model
    __tablename__ = 'function_list'  # 確保表名正確

    uid = db.Column(db.String(50), primary_key=True)  # 唯一識別碼
    no = db.Column(db.String(45))                     # 功能编号
    module = db.Column(db.String(255))                 # 所属模块
    item_cn = db.Column(db.String(255))                # 中文描述
    item_en = db.Column(db.String(255), nullable=True) # 英文描述
    type = db.Column(db.String(45))                    # 类型
    level = db.Column(db.Integer)                       # 层级
    icon = db.Column(db.String(100), nullable=True)    # 图标
    route = db.Column(db.String(128), nullable=True)   # 路由

    def __init__(self, uid, no, module, item_cn, item_en, type, level, icon="", route=""):
        self.uid = uid
        self.no = no
        self.module = module
        self.item_cn = item_cn
        self.item_en = item_en
        self.type = type
        self.level = level
        self.icon = icon
        self.route = route

    @classmethod
    def from_dict(cls, data):
        return cls(
            uid=data.get('uid', ''),
            no=data.get('no', ''),
            module=data.get('module', ''),
            item_cn=data.get('item_cn', ''),
            item_en=data.get('item_en', ''),
            type=data.get('type', ''),
            level=data.get('level', 0),
            icon=data.get('icon', ''),
            route=data.get('route', '')
        )

    def to_dict(self):
        return {
            'uid': self.uid,
            'no': self.no,
            'module': self.module,
            'item_cn': self.item_cn,
            'item_en': self.item_en,
            'type': self.type,
            'level': self.level,
            'icon': self.icon,
            'route': self.route
        }
