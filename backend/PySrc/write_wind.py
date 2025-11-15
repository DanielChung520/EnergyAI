from flask import Flask, jsonify
from config import Config
from extensions import db
from models.wind import WindPowerData
import requests
import json
from datetime import datetime
import asyncio
from aiohttp import ClientSession
import logging
from concurrent.futures import ThreadPoolExecutor
import threading

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

# 設置日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='mysql_wind_data.log',
    filemode='a'
)

# API 配置
API_URL = "http://www.ghrepower.net.cn:1250/Src/WebServiceTest.asmx/GetRealData_TaiWan"
API_PARAMS = {
    "account": "acc_taiwan_accs",
    "password": "gggTTaiwanPswd123"
}

# 風機配置
TURBINE_IDS = {
    "turbine1": "c4950a63-4f2a-40fc-b335-c5e8feec0997",
    "turbine2": "048ca70d-becf-4e21-9c04-078a39d79bde",
    "turbine3": "81f6d637-b345-43dd-a8a3-0baea391bdd7",
    "turbine4": "cf21e03b-694a-4ee9-9fdb-772e83e03980"
}

async def fetch_data(session, strid):
    params = API_PARAMS.copy()
    params['strid'] = strid
    try:
        async with session.get(API_URL, params=params) as response:
            if response.status != 200:
                logging.error(f"Error fetching data for strid {strid}: Status {response.status}")
                return None
            data = await response.text()
            return json.loads(data)
    except Exception as e:
        logging.error(f"Exception while fetching data for strid {strid}: {e}")
        return None

async def write_to_mysql(data):
    if not data or 'Info' not in data:
        return
        
    info = data['Info']
    try:
        with app.app_context():
            wind_data = WindPowerData(
                name=info['Name'],
                device_id=info['ID'],
                record_time=datetime.strptime(info['Time'], '%Y/%m/%d %H:%M:%S'),
                fd_wind_speed_3s=info['FD_WindSpeed_3s'],
                fd_wind_speed_5min=info['FD_WindSpeed_5min'],
                fd_wind_director_1s=info['FD_WindDirector_1s'],
                fd_wind_director_10min=info['FD_WindDirector_10min'],
                fd_wg_load_vdc=info['FD_WGLoadVdc'],
                fd_wg_load_idc=info['FD_WGLoadIdc'],
                fd_output_power=info['FD_OutputPower'],
                fd_wg_rpm=info['FD_WGrpm'],
                rotor_torque=info.get('RotorTorque', 0),
                fd_dpvdc=info['FD_DPVdc'],
                fd_temperature_w=info['FD_TemperatureW'],
                fd_temperature_u=info['FD_TemperatureU'],
                fd_temperature_v=info['FD_TemperatureV'],
                fd_nace_temp=info['FD_NaceTemp'],
                iw_nace_dir_angle=info['IW_NaceDirAngle'],
                iw_system_current_ctrl_mode=info['IW_SystemCurrentCtrlMode'],
                iw_system_current_run_mode=info['IW_SystemCurrentRunMode'],
                iw_system_alarm_status=info['IW_SystemAlarmStatus'],
                iw_op_sys_run_status=info['IW_OPSysRunStatus'],
                iw_sys_cur_yaw_action=info['IW_SysCurYawAction'],
                iw_sys_cur_pitch_action=info['IW_SysCurPitchAction'],
                iw_sys_cur_heat_action=info['IW_SysCurHeatAction'],
                iw_sys_cur_dumpload_action=info['IW_SysCurDumploadAction'],
                iw_auto_yaw_direction=info['IW_AutoYawDirection'],
                iw_stop_anti_twist_cable_dir=info['IW_StopAntiTwistCableDir'],
                fd_yaw_aim_angle=info['FD_YawAimAngle'],
                fd_yaw_passed_angle=info['FD_YawPassedAngle'],
                iw_yaw_twist_cable_angle=info['IW_YawTwistCableAngle'],
                fd_blade_cur_pitch_real_angle=info['FD_BladeCurPitchRealAngle'],
                fd_pitch_power=info['FD_PitchPower'],
                fd_yaw_power=info['FD_YawPower'],
                day_energy=info['DayEnergy'],
                month_energy=info['MonthEnergy'],
                year_energy=info['YearEnergy'],
                total_energy=info['TotalEnergy'],
                sys_pro_state=info['SysProState'],
                powe_ctrl_state=info['PoweCtrlState'],
                grid_state=info['GridState'],
                grid_feq=info['GridFeq'],
                cos_fai=info['cosFai'],
                ug_ab=info['UgAB'],
                ug_bc=info['UgBC'],
                ug_ca=info['UgCA'],
                iout_a=info['IoutA'],
                iout_b=info['IoutB'],
                iout_c=info['IoutC'],
                power_pac=info['PowerPac'],
                power_qac=info['PowerQac'],
                running_days=info['RunningDays'],
                running_hour=info['RunningHour'],
                running_minute=info['RunningMinute'],
                running_second=info['RunningSecond']
            )
            
            db.session.add(wind_data)
            db.session.commit()
            logging.info(f"ID={info['ID']} completed")
            
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error writing ID={info.get('ID','unknown')}: {str(e)}")

async def process_turbine(turbine_id):
    """處理單個風機的數據獲取和寫入"""
    # 手動推送應用上下文
    with app.app_context():
        app.app_context().push()
        
        async with ClientSession() as session:
            while True:
                try:
                    data = await fetch_data(session, turbine_id)
                    if data:
                        await write_to_mysql(data)
                    await asyncio.sleep(1)
                except Exception as e:
                    logging.error(f"Error processing turbine {turbine_id}: {e}")
                    await asyncio.sleep(1)

def run_turbine_loop(turbine_id):
    """為每個風機創建一個事件循環"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(process_turbine(turbine_id))
    except Exception as e:
        logging.error(f"Error in turbine loop {turbine_id}: {e}")
    finally:
        loop.close()

@app.route('/api/query_wind_data', methods=['GET'])
def query_data():
    try:
        with app.app_context():
            data = WindPowerData.query.order_by(WindPowerData.record_time.desc()).limit(100).all()
            return jsonify([{
                "id": item.id,
                "name": item.name,
                "device_id": item.device_id,
                "record_time": item.record_time.isoformat(),
                "fd_output_power": item.fd_output_power,
                "fd_wind_speed_3s": item.fd_wind_speed_3s,
                "fd_wind_speed_5min": item.fd_wind_speed_5min,
                "day_energy": item.day_energy,
                "month_energy": item.month_energy,
                "year_energy": item.year_energy,
                "total_energy": item.total_energy
            } for item in data])
    except Exception as e:
        logging.error(f"Error querying data: {e}")
        return "Error querying data", 500

def start_turbine_threads():
    """啟動所有風機的處理線程"""
    logging.info("啟動風機數據採集服務")
    with ThreadPoolExecutor(max_workers=4) as executor:
        for turbine_id in TURBINE_IDS.values():
            executor.submit(run_turbine_loop, turbine_id)
            logging.info(f"已啟動風機ID監控: {turbine_id}")

if __name__ == '__main__':
    try:
        with app.app_context():
            db.create_all()
            logging.info("MySQL連接就緒")
            print("服務啟動成功")
        
        # 啟動風機數據處理線程
        threading.Thread(target=start_turbine_threads, daemon=True).start()
        
        # 啟動 Flask 應用
        app.run(host='0.0.0.0', port=5503, debug=False)
        
    except Exception as e:
        print(f"Error starting application: {e}")
        logging.error(f"Error starting application: {e}")
