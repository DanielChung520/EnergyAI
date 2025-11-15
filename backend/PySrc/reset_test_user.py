from extensions import db
from models.users import User
from app import create_app
import bcrypt

def reset_test_user():
    app = create_app()
    with app.app_context():
        try:
            # 清除現有用戶
            User.query.delete()
            db.session.commit()
            
            # 創建新用戶
            password = "1111"
            # 使用 bcrypt 加密密碼
            hashed_password = bcrypt.hashpw(
                password.encode('utf-8'), 
                bcrypt.gensalt()
            ).decode('utf-8')

            new_user = User(
                uuid=User.generate_uuid(),  # 生成字符串格式的 UUID
                userid='Daniel520',
                password=hashed_password,
                nickname='Daniel'
            )

            db.session.add(new_user)
            db.session.commit()

            # 驗證用戶創建
            created_user = User.query.filter_by(userid='Daniel520').first()
            print("\nUser created successfully:")
            print(f"UUID: {created_user.uuid}")
            print(f"UserID: {created_user.userid}")
            print(f"Nickname: {created_user.nickname}")
            print(f"Password Hash: {created_user.password}")

            # 測試密碼驗證
            test_password = "1111"
            is_valid = bcrypt.checkpw(
                test_password.encode('utf-8'),
                created_user.password.encode('utf-8')
            )
            print(f"\nPassword verification test: {'Success' if is_valid else 'Failed'}")

        except Exception as e:
            print(f"Error: {str(e)}")
            db.session.rollback()
            raise

if __name__ == "__main__":
    reset_test_user() 