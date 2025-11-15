from extensions import db
from models.users import User
from app import create_app
import bcrypt

def create_test_user():
    app = create_app()
    with app.app_context():
        try:
            # 檢查用戶是否已存在
            existing_user = User.query.filter_by(userid='Daniel520').first()
            if existing_user:
                print(f"Deleting existing user: {existing_user.userid}")
                db.session.delete(existing_user)
                db.session.commit()

            # 創建新用戶
            password = "1111"
            # 使用 bcrypt 直接加密密碼
            hashed_password = bcrypt.hashpw(
                password.encode('utf-8'), 
                bcrypt.gensalt()
            ).decode('utf-8')

            new_user = User(
                uuid=User.generate_uuid(),
                userid='Daniel520',
                password=hashed_password,  # 使用加密後的密碼
                nickname='Daniel'
            )

            db.session.add(new_user)
            db.session.commit()

            print(f"Test user created successfully:")
            print(f"UserID: Daniel520")
            print(f"Password: 1111")
            print(f"Hashed password: {hashed_password}")

            # 驗證密碼
            is_valid = bcrypt.checkpw(
                "1111".encode('utf-8'),
                new_user.password.encode('utf-8')
            )
            print(f"Password verification test: {'Success' if is_valid else 'Failed'}")

        except Exception as e:
            print(f"Error creating test user: {str(e)}")
            db.session.rollback()

if __name__ == "__main__":
    create_test_user() 