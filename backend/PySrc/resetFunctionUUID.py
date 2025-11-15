from extensions import db
from models.function import Function
from app import create_app
import uuid
import logging

# 設置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def reset_function_uuids():
    app = create_app()
    with app.app_context():
        try:
            # 獲取所有 Function 記錄
            functions = Function.query.all()
            logger.info(f"Found {len(functions)} functions to update.")

            for function in functions:
                # 生成新的 UUID
                new_uuid = str(uuid.uuid4())
                logger.info(f"Updating function {function.uid} with new UUID: {new_uuid}")

                # 更新 UUID
                function.uid = new_uuid

            # 提交更改
            db.session.commit()
            logger.info("All function UUIDs have been updated successfully.")

        except Exception as e:
            logger.error(f"Error updating function UUIDs: {str(e)}")
            db.session.rollback()

if __name__ == "__main__":
    reset_function_uuids() 