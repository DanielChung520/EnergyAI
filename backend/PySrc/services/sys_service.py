from models.sys import SystemSetting, SystemSettingHistory
from extensions import db
import logging
from sqlalchemy.sql import text
import bcrypt

logger = logging.getLogger(__name__)

class SysService:
    @staticmethod
    def get_all_settings():
        """獲取所有系統設置"""
        settings = SystemSetting.query.all()
        # 將結果轉換為前端需要的格式
        result = {}
        for setting in settings:
            if setting.category not in result:
                result[setting.category] = {}
            result[setting.category][setting.setting_key] = setting.setting_value
        return result

    @staticmethod
    def update_settings(category, settings, user=None):
        """更新指定類別的設置"""
        try:
            for key, value in settings.items():
                # 查找現有設置
                setting = SystemSetting.query.filter_by(
                    category=category,
                    setting_key=key
                ).first()

                if setting:
                    # 記錄舊值並更新
                    old_value = setting.setting_value
                    setting.setting_value = value
                    setting.updated_by = user
                else:
                    # 創建新設置
                    setting = SystemSetting(
                        category=category,
                        setting_key=key,
                        setting_value=value,
                        updated_by=user
                    )
                    old_value = None
                    db.session.add(setting)

                # 記錄修改歷史
                SystemSettingHistory.log_change(
                    category=category,
                    key=key,
                    old_value=old_value,
                    new_value=value,
                    user=user
                )

            db.session.commit()
            return True
        except Exception as e:
            logger.error(f"更新設置失敗: {str(e)}")
            db.session.rollback()
            raise

    @staticmethod
    def get_settings_history(category=None, limit=100):
        """獲取設置修改歷史"""
        query = SystemSettingHistory.query
        if category:
            query = query.filter_by(category=category)
        return query.order_by(SystemSettingHistory.updated_at.desc()).limit(limit).all()
    