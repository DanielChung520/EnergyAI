from flask import Flask, jsonify, request, current_app
from flask_cors import CORS
from routes.site_routes import site_bp
from routes.equipment_routes import equipment_bp
from routes.timeseries_routes import ts_bp
from routes.function_routes import function_bp
from routes.users_routes import users_bp
from routes.role_routes import role_bp
from routes.performance_routes import performance_bp
from extensions import db, init_extensions
from config import Config
import logging
import sys
from flask_sqlalchemy import SQLAlchemy
from map.map_blueprint import map_bp
from routes.wind_routes import wind_bp
from routes.sys_routes import sys_bp

# 設置日誌級別和格式
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)

# 設置 SQLAlchemy 的日誌
logging.getLogger('sqlalchemy.engine').setLevel(logging.DEBUG)
logging.getLogger('sqlalchemy.pool').setLevel(logging.DEBUG)

logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)

    # 加載配置
    app.config.from_object(Config)

    # 更新 CORS 配置
    CORS(app, 
         resources={
             r"/*": {
                 "origins": ["https://eai.bioengy.com","http://localhost:8082"],
                 "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                 "allow_headers": ["Content-Type", "Authorization", "Accept", "Origin"],
                 "expose_headers": ["Content-Type", "Authorization"],
                 "supports_credentials": True,
                 "max_age": 3600
             }
         }
    )

    # 初始化擴展
    init_extensions(app)

    # 修改藍圖註冊，為所有藍圖添加 API 前綴
    logger.debug("Registering blueprints...")
    app.register_blueprint(site_bp, url_prefix='/api/sites')
    app.register_blueprint(performance_bp, url_prefix='/api/performance')
    app.register_blueprint(equipment_bp, url_prefix='/api/equipments')
    app.register_blueprint(ts_bp, url_prefix='/api')
    app.register_blueprint(function_bp, url_prefix='/api/system')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(map_bp, url_prefix='/api/map')
    app.register_blueprint(role_bp, url_prefix='/api/roles')
    app.register_blueprint(wind_bp, url_prefix='/api/wind')
    app.register_blueprint(sys_bp, url_prefix='/api/system')
    logger.debug("Users blueprint registered with prefix: /api")

    # 註冊藍圖後打印所有路由
    logger.debug("Registered routes:")
    for rule in app.url_map.iter_rules():
        logger.debug(f"Route: {rule.rule}, Methods: {rule.methods}")

    @app.before_request
    def log_request_info():
        # 只在应用启动后的第一个请求时打印路由信息
        if not hasattr(app, '_printed_routes'):
            print("Registered routes:")
            for rule in current_app.url_map.iter_rules():
                print(f"{rule.endpoint}: {rule.rule}")
            app._printed_routes = True  # 标记已打印路由

        logger.info(f"Received {request.method} request to {request.path}")
        logger.debug(f"Request headers: {dict(request.headers)}")
        logger.debug(f"Request data: {request.get_data()}")

    @app.before_request
    def before_request():
        try:
            db.session.query(db.text("1")).first()
            print("Database connection successful")
        except Exception as e:
            print(f"Database connection failed: {e}")

    # 錯誤處理
    @app.errorhandler(404)
    def not_found(error):
        logger.error(f"404 Error: {error}")
        path = request.path
        logger.debug(f"Request path that caused 404: {path}")
        logger.debug("Registered routes:")
        for rule in app.url_map.iter_rules():
            logger.debug(f"Route: {rule.rule}, Methods: {rule.methods}")
        return jsonify({'error': 'Not found', 'path': path}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        logger.error(f"405 Error: {error}")
        return jsonify({
            'error': 'Method not allowed',
            'allowed_methods': error.valid_methods
        }), 405

    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"500 Error: {error}")
        return jsonify({'error': 'Internal server error'}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5500, debug=True) 