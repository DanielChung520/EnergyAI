import uuid
from models.role import Role, RoleFunction
from models.function import Function
from extensions import db
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

class RoleService:
    @staticmethod
    def create_role(role_data):
        """創建新角色"""
        try:
            # 檢查角色ID是否已存在
            if Role.query.get(role_data.get('id')):
                return None, "角色ID已存在"
            
            new_role = Role(
                id=role_data.get('id'),
                role=role_data.get('role'),
                desc=role_data.get('desc'),
                desc_en=role_data.get('desc_en'),
                security_level=role_data.get('security_level'),
                remark=role_data.get('remark'),
                flag=role_data.get('flag', 1)
            )
            db.session.add(new_role)
            db.session.commit()
            return new_role, None
        except IntegrityError as e:
            db.session.rollback()
            return None, f"創建角色失敗: 角色ID已存在"
        except SQLAlchemyError as e:
            db.session.rollback()
            return None, f"創建角色失敗: {str(e)}"

    @staticmethod
    def get_role(role_id):
        """獲取單個角色"""
        try:
            role = Role.query.get(role_id)
            if not role:
                return None, "角色不存在"
            return role, None
        except SQLAlchemyError as e:
            return None, f"獲取角色失敗: {str(e)}"

    @staticmethod
    def get_all_roles():
        """獲取所有角色"""
        try:
            roles = Role.query.all()
            return roles, None
        except SQLAlchemyError as e:
            return None, f"獲取所有角色失敗: {str(e)}"

    @staticmethod
    def update_role(role_id, update_data):
        """更新角色信息"""
        try:
            role = Role.query.get(role_id)
            if not role:
                return None, "角色不存在"
            
            for key, value in update_data.items():
                if hasattr(role, key):
                    setattr(role, key, value)
            role.update_at = datetime.utcnow()
            db.session.commit()
            return role, None
        except SQLAlchemyError as e:
            db.session.rollback()
            return None, f"更新角色失敗: {str(e)}"

    @staticmethod
    def delete_role(role_id):
        """刪除角色"""
        try:
            role = Role.query.get(role_id)
            if not role:
                return False, "角色不存在"
            
            db.session.delete(role)
            db.session.commit()
            return True, None
        except SQLAlchemyError as e:
            db.session.rollback()
            return False, f"刪除角色失敗: {str(e)}"

class RoleFunctionService:
    @staticmethod
    def update_role_functions(role, functions):
        """更新角色的功能權限"""
        try:
            # 刪除該角色現有的所有功能權限
            RoleFunction.query.filter_by(role=role).delete()
            
            # 添加新的功能權限
            for func in functions:
                role_function = RoleFunction(
                    id=str(uuid.uuid4()),  # 明確設置 UUID
                    role=role,
                    function=func['function'],
                    permission=func.get('permission', 'r')
                )
                db.session.add(role_function)
            
            # 提交事務
            db.session.commit()
            return True, None
                
        except Exception as e:
            # 發生錯誤時回滾
            db.session.rollback()
            error_msg = f"Error updating role functions: {str(e)}"
            print(error_msg)
            return False, error_msg

    @staticmethod
    def get_role_functions(role_id):
        """獲取角色的功能權限"""
        try:
            role_functions = RoleFunction.query.filter_by(role=role_id).all()
            if not role_functions:
                return [], None

            functions = []
            for rf in role_functions:
                func = Function.query.filter_by(uid=rf.function).first()
                if func:
                    functions.append({
                        'id': func.uid,
                        'no': func.no,
                        'function': func.item_cn,
                        'desc': func.item_en,
                        'module': func.module,
                        'permission': rf.permission
                    })
            return functions, None
            
        except Exception as e:
            error_msg = f"Error getting role functions: {str(e)}"
            print(error_msg)
            return [], error_msg

    @staticmethod
    def create_role_function(data):
        try:
            role_function = RoleFunction(
                role=data['role'],
                function=data['function'],
                permission=data.get('permission', 'r')  # 默認為只讀權限
            )
            db.session.add(role_function)
            db.session.commit()
            return role_function, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def get_all_role_functions():
        try:
            role_functions = RoleFunction.query.all()
            return role_functions, None
        except Exception as e:
            return None, str(e)

    @staticmethod
    def get_role_function(role_function_id):
        try:
            role_function = RoleFunction.query.get(role_function_id)
            if not role_function:
                return None, "角色功能不存在"
            return role_function, None
        except Exception as e:
            return None, str(e)

    @staticmethod
    def update_role_function(role_function_id, data):
        try:
            role_function = RoleFunction.query.get(role_function_id)
            if not role_function:
                return None, "角色功能不存在"
            
            if 'permission' in data:
                role_function.permission = data['permission']
            
            db.session.commit()
            return role_function, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)

    @staticmethod
    def delete_role_function(role_function_id):
        try:
            role_function = RoleFunction.query.get(role_function_id)
            if not role_function:
                return False, "角色功能不存在"
            
            db.session.delete(role_function)
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, str(e)
