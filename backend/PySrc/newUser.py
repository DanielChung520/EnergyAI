from models.users import User
from extensions import db

test_user = User(
    uuid=User.generate_uuid(),
    userid='Daniel520',
    password=User.hash_password('1111'),
    nickname='Daniel'
)
db.session.add(test_user)
db.session.commit()