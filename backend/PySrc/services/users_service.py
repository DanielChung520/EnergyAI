from models.users import User
from extensions import db
import logging
from sqlalchemy.sql import text
import bcrypt

logger = logging.getLogger(__name__)

class UserService:
    @staticmethod
    def create_user(user_data):
        # 處理密碼加密
        if 'password' in user_data:
            user_data['password'] = User.hash_password(user_data['password'])
        
        # 生成 UUID
        user_data['uuid'] = User.generate_uuid()
        
        # 如果沒有指定角色，設置默認角色
        if 'role' not in user_data:
            user_data['role'] = 'user'  # 設置默認角色
        
        user = User(**user_data)
        db.session.add(user)
        try:
            db.session.commit()
            return user
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating user: {str(e)}")
            raise e

    @staticmethod
    def get_user(user_id):
        try:
            logger.info(f"UserService.get_user called with user_id: {user_id}")
            
            # 使用原生 SQL 查詢進行調試
            result = db.session.execute(
                text("SELECT * FROM users WHERE userid = :userid"),
                {'userid': user_id}
            ).fetchone()
            logger.debug(f"Raw SQL query result: {result}")
            
            # 使用 SQLAlchemy ORM 查詢
            query = User.query.filter_by(userid=user_id)
            logger.debug(f"SQLAlchemy query: {query}")
            
            user = query.first()
            
            if not user:
                logger.warning(f"No user found with userid: {user_id}")
                # 調試：打印所有可用的用戶
                all_users = User.query.all()
                logger.debug(f"Total users in database: {len(all_users)}")
                for u in all_users:
                    logger.debug(f"Available user: {u.userid}")
            
            return user
        except Exception as e:
            logger.error(f"Error in get_user: {str(e)}", exc_info=True)
            raise

    @staticmethod
    def update_user(user_id, user_data):
        try:
            logger.debug(f"Attempting to update user with userid: {user_id}")
            logger.debug(f"Update data: {user_data}")
            
            user = User.query.filter_by(userid=user_id).first()
            
            if user:
                # 如果更新包含密碼，需要加密
                if 'password' in user_data:
                    user_data['password'] = User.hash_password(user_data['password'])
                
                # 防止更新 uuid
                user_data.pop('uuid', None)
                
                # 更新數據，包括 role
                for key, value in user_data.items():
                    if hasattr(user, key):  # 確保屬性存在
                        setattr(user, key, value)
                
                try:
                    db.session.commit()
                    return user
                except Exception as e:
                    db.session.rollback()
                    logger.error(f"Error during update commit: {str(e)}")
                    raise e
            return None
            
        except Exception as e:
            logger.error(f"Error in update_user: {str(e)}")
            raise e

    @staticmethod
    def delete_user(user_id):
        user = User.query.filter_by(userid=user_id).first()
        if user:
            try:
                db.session.delete(user)
                db.session.commit()
                return user
            except Exception as e:
                db.session.rollback()
                raise e
        return None

    @staticmethod
    def get_all_users():
        try:
            logger.info("Fetching all users")
            users = User.query.all()
            logger.debug(f"Found {len(users)} users")
            return users
        except Exception as e:
            logger.error(f"Error in get_all_users: {str(e)}", exc_info=True)
            raise

    @staticmethod
    def verify_password(user, password):
        """
        驗證用戶密碼
        """
        try:
            if not user or not password:
                logger.warning("Missing user or password")
                return False

            logger.debug(f"Verifying password for user: {user.userid}")
            logger.debug(f"Input password: {password}")
            logger.debug(f"Stored password hash: {user.password}")

            # 驗證密碼
            result = bcrypt.checkpw(
                password.encode('utf-8'),
                user.password.encode('utf-8')
            )
            
            logger.debug(f"Password verification result: {result}")
            return result

        except Exception as e:
            logger.error(f"Password verification error: {str(e)}", exc_info=True)
            return False

    @staticmethod
    def hash_password(password):
        """
        對密碼進行加密
        :param password: 原始密碼
        :return: 加密後的密碼
        """
        try:
            if isinstance(password, str):
                password = password.encode('utf-8')
            salt = bcrypt.gensalt()
            return bcrypt.hashpw(password, salt).decode('utf-8')
        except Exception as e:
            logger.error(f"Password hashing error: {str(e)}", exc_info=True)
            raise

    @staticmethod
    def update_password(user, new_password):
        try:
            # 對新密碼進行加密
            user.password = UserService.hash_password(new_password)
            db.session.commit()  # 提交更改
            return user
        except Exception as e:
            db.session.rollback()  # 如果出現錯誤，回滾更改
            logger.error(f"Error updating password for user {user.userid}: {str(e)}", exc_info=True)
            raise
