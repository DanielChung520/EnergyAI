from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_extensions(app):
    db.init_app(app)
    # 在這裡可以初始化其他擴展 