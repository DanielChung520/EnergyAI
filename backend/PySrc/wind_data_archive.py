from flask import Flask
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from config import Config
from extensions import db
from sqlalchemy import text
from models.wind import WindMinData, WindMinDataView
from models.site import SiteEquipment

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

def update_wind_min_data():
    with app.app_context():
        current_minute = datetime.now().strftime('%Y-%m-%d %H:%M')
        
        # 獲取 WindMinData 表的最新 period
        last_period = db.session.query(db.func.max(WindMinData.period)).scalar()
        
        # 如果 last_period 是 None，設置一個初始值
        if last_period is None:
            last_period = '1970-01-01 00:00'
        
        # 從 WindMinDataView 中選擇大於 last_period 且小於 current_minute 的數據
        query = db.session.query(WindMinDataView).filter(
            WindMinDataView.period > last_period,
            WindMinDataView.period < current_minute
        )
        
        data_to_insert = query.all()
        
        # 插入數據到 WindMinData 表
        for row in data_to_insert:
            # 根據 device_id 找到對應的 site_id
            _site_id = db.session.query(SiteEquipment.site_id).filter(
                SiteEquipment.equip_id == row.device_id
            ).scalar()
            
            new_wind_min_data = WindMinData(
                device_id=row.device_id,
                name=row.name,
                period=row.period,
                site_id=_site_id,
                fd_wind_speed_3s=row.avg_wind_speed,
                fd_wind_speed_5min=row.fd_wind_speed_5min,
                # avg_wind_speed=row.avg_wind_speed,
                min_wind_speed=row.min_wind_speed,
                max_wind_speed=row.max_wind_speed,
                fd_wind_director_1m=row.fd_wind_director_1m,
                fd_wind_director_10min=row.fd_wind_director_10min,
                fd_wg_load_vdc=row.fd_wg_load_vdc,
                fd_wg_load_idc=row.fd_wg_load_idc,
                fd_output_power=row.fd_output_power,
                sum_output_power=row.sum_output_power,
                fd_wg_rpm=row.fd_wg_rpm,
                rotor_torque=row.rotor_torque,
                fd_dpvdc=row.fd_dpvdc,
                fd_temperature_w=row.fd_temperature_w,
                fd_temperature_u=row.fd_temperature_u,
                fd_temperature_v=row.fd_temperature_v,
                fd_nace_temp=row.fd_nace_temp,
                iw_nace_dir_angle=row.iw_nace_dir_angle,
                iw_system_current_ctrl_mode=row.iw_system_current_ctrl_mode,
                iw_system_current_run_mode=row.iw_system_current_run_mode,
                iw_system_alarm_status=row.iw_system_alarm_status,
                iw_op_sys_run_status=row.iw_op_sys_run_status,
                iw_sys_cur_yaw_action=row.iw_sys_cur_yaw_action,
                iw_sys_cur_pitch_action=row.iw_sys_cur_pitch_action,
                iw_sys_cur_heat_action=row.iw_sys_cur_heat_action,
                iw_sys_cur_dumpload_action=row.iw_sys_cur_dumpload_action,
                iw_auto_yaw_direction=row.iw_auto_yaw_direction,
                iw_stop_anti_twist_cable_dir=row.iw_stop_anti_twist_cable_dir,
                fd_yaw_aim_angle=row.fd_yaw_aim_angle,
                fd_yaw_passed_angle=row.fd_yaw_passed_angle,
                iw_yaw_twist_cable_angle=row.iw_yaw_twist_cable_angle,
                fd_blade_cur_pitch_real_angle=row.fd_blade_cur_pitch_real_angle,
                fd_pitch_power=row.fd_pitch_power,
                fd_yaw_power=row.fd_yaw_power,
                day_energy=row.day_energy,
                month_energy=row.month_energy,
                year_energy=row.year_energy,
                total_energy=row.total_energy,
                sys_pro_state=row.sys_pro_state,
                powe_ctrl_state=row.powe_ctrl_state,
                grid_state=row.grid_state,
                grid_feq=row.grid_feq,
                cos_fai=row.cos_fai,
                ug_ab=row.ug_ab,
                ug_bc=row.ug_bc,
                ug_ca=row.ug_ca,
                iout_a=row.iout_a,
                iout_b=row.iout_b,
                iout_c=row.iout_c,
                power_pac=row.power_pac,
                sum_power_pac=row.sum_power_pac,
                power_qac=row.power_qac,
                running_days=row.running_days,
                running_hour=row.running_hour,
                running_minute=row.running_minute,
                running_second=row.running_second,
                sample_count=row.sample_count,
                period_start=row.period_start,
                period_end=row.period_end
            )
            
            db.session.add(new_wind_min_data)
        
        db.session.commit()

# 設置定時任務
scheduler = BackgroundScheduler()
scheduler.add_job(func=update_wind_min_data, trigger="interval", minutes=1)
scheduler.start()

# 立即執行一次 update_wind_min_data
update_wind_min_data()

@app.route('/')
def home():
    return "Wind Data Archive service is running and updating wind_min_data every minute."

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5504) 