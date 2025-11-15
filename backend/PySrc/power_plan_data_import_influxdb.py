from flask import Flask, jsonify
from influxdb_client import InfluxDBClient, Point, WritePrecision
import requests
import json
from datetime import datetime
import asyncio
from aiohttp import ClientSession
import logging

app = Flask(__name__)

# InfluxDB 配置
INFLUXDB_URL = "http://localhost:8086"
INFLUXDB_TOKEN = "z0JX4a98e1dYqNVsVwsNXkggyeKD2oY7hJiLvuUZFhTuuO0Od_dl4tc_eIQLWgpKP3hGWnI6iUMGI29EKF6vFQ=="
INFLUXDB_ORG = "energy-ai"
INFLUXDB_BUCKET = "power-plant-data"

# API 配置
API_URL = "http://www.ghrepower.net.cn:1250/Src/WebServiceTest.asmx/GetRealData_TaiWan"
API_PARAMS = {
    "strid": "76e7c14f-1fc0-4178-bb2a-5b883bf4e92c",
    "account": "acc_taiwan_accs",
    "password": "gggTTaiwanPswd123"
}

# 創建 InfluxDB 客戶端
client = InfluxDBClient(url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=INFLUXDB_ORG)

async def fetch_data(session, strid):
    params = API_PARAMS.copy()
    params['strid'] = strid
    try:
        async with session.get(API_URL, params=params) as response:
            if response.status != 200:
                logging.error(f"Error fetching data for strid {strid}: Status {response.status}")
                return None
                
            data = await response.json()
            logging.info(f"Successfully fetched data for strid {strid}")
            logging.info(f"API response for strid {strid}: {data}")
            return data
    except Exception as e:
        logging.error(f"Exception while fetching data for strid {strid}: {e}")
        return None

async def write_to_influxdb(data):
    if not data:
        logging.error("No data to write to InfluxDB")
        return
        
    info = data.get('Info', {})
    if not info:
        logging.error("No Info field in data")
        return
        
    try:
        timestamp = datetime.strptime(info['Time'], '%Y/%m/%d %H:%M:%S').timestamp()
        
        point = Point("wind_turbine") \
            .tag("ID", info['ID']) \
            .tag("Name", info['Name']) \
            .field("FD_OutputPower", info['FD_OutputPower']) \
            .field("FD_WindSpeed_3s", info['FD_WindSpeed_3s']) \
            .field("FD_WindSpeed_5min", info['FD_WindSpeed_5min']) \
            .field("FD_WindDirector_1s", info['FD_WindDirector_1s']) \
            .field("FD_WindDirector_10min", info['FD_WindDirector_10min']) \
            .field("FD_WGLoadVdc", info['FD_WGLoadVdc']) \
            .field("FD_WGLoadIdc", info['FD_WGLoadIdc']) \
            .field("FD_DPVdc", info['FD_DPVdc']) \
            .field("FD_TemperatureW", info['FD_TemperatureW']) \
            .field("IW_NaceDirAngle", info['IW_NaceDirAngle']) \
            .field("IW_SystemCurrentCtrlMode", info['IW_SystemCurrentCtrlMode']) \
            .field("IW_SystemCurrentRunMode", info['IW_SystemCurrentRunMode']) \
            .field("IW_SystemAlarmStatus", info['IW_SystemAlarmStatus']) \
            .field("IW_OPSysRunStatus", info['IW_OPSysRunStatus']) \
            .field("IW_SysCurYawAction", info['IW_SysCurYawAction']) \
            .field("IW_SysCurPitchAction", info['IW_SysCurPitchAction']) \
            .field("IW_SysCurHeatAction", info['IW_SysCurHeatAction']) \
            .field("IW_SysCurDumploadAction", info['IW_SysCurDumploadAction']) \
            .field("IW_AutoYawDirection", info['IW_AutoYawDirection']) \
            .field("IW_StopAntiTwistCableDir", info['IW_StopAntiTwistCableDir']) \
            .field("FD_YawAimAngle", info['FD_YawAimAngle']) \
            .field("FD_YawPassedAngle", info['FD_YawPassedAngle']) \
            .field("IW_YawTwistCableAngle", info['IW_YawTwistCableAngle']) \
            .field("FD_BladeCurPitchRealAngle", info['FD_BladeCurPitchRealAngle']) \
            .field("FD_TemperatureU", info['FD_TemperatureU']) \
            .field("FD_TemperatureV", info['FD_TemperatureV']) \
            .field("FD_NaceTemp", info['FD_NaceTemp']) \
            .field("FD_PitchPower", info['FD_PitchPower']) \
            .field("FD_YawPower", info['FD_YawPower']) \
            .field("DayEnergy", info['DayEnergy']) \
            .field("MonthEnergy", info['MonthEnergy']) \
            .field("YearEnergy", info['YearEnergy']) \
            .field("TotalEnergy", info['TotalEnergy']) \
            .field("SysProState", info['SysProState']) \
            .field("PoweCtrlState", info['PoweCtrlState']) \
            .field("GridState", info['GridState']) \
            .field("GridFeq", info['GridFeq']) \
            .field("cosFai", info['cosFai']) \
            .field("UgAB", info['UgAB']) \
            .field("UgBC", info['UgBC']) \
            .field("UgCA", info['UgCA']) \
            .field("IoutA", info['IoutA']) \
            .field("IoutB", info['IoutB']) \
            .field("IoutC", info['IoutC']) \
            .field("PowerPac", info['PowerPac']) \
            .field("PowerQac", info['PowerQac']) \
            .field("RunningDays", info['RunningDays']) \
            .field("RunningHour", info['RunningHour']) \
            .field("RunningMinute", info['RunningMinute']) \
            .field("RunningSecond", info['RunningSecond']) \
            .time(int(timestamp * 1000), WritePrecision.MS)

        write_api = client.write_api()
        write_api.write(bucket=INFLUXDB_BUCKET, record=point)
        
        print(f"Data written to InfluxDB: ID={info['ID']}, Time={info['Time']}, FD_OutputPower={info['FD_OutputPower']}")
        logging.info(f"Data written to InfluxDB: ID={info['ID']}, Time={info['Time']}, FD_OutputPower={info['FD_OutputPower']}")
        
    except Exception as e:
        print(f"Error writing data: {e}")
        logging.error(f"Error writing data: {e}")

async def fetch_and_write_data():
    turbine_ids = [
        "c4950a63-4f2a-40fc-b335-c5e8feec0997",
        "048ca70d-becf-4e21-9c04-078a39d79bde",
        "81f6d637-b345-43dd-a8a3-0baea391bdd7",
        "cf21e03b-694a-4ee9-9fdb-772e83e03980"
    ]

    async with ClientSession() as session:
        tasks = [fetch_data(session, strid) for strid in turbine_ids]
        data_list = await asyncio.gather(*tasks)

        for data in data_list:
            await write_to_influxdb(data)

async def periodic_write_data():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s', filename='app.log', filemode='a')
    last_log_time = datetime.now()
    print("Starting periodic write data task")
    logging.info("Starting periodic write data task")

    while True:
        try:
            print("Fetching and writing data...")
            logging.info("Fetching and writing data...")
            await fetch_and_write_data()
            print("Data written successfully")
            logging.info("Data written successfully")
            await asyncio.sleep(10)  # 等待10秒

            current_time = datetime.now()
            if (current_time - last_log_time).total_seconds() >= 60:
                logging.info("Data written successfully")
                last_log_time = current_time
        except Exception as e:
            print(f"Error in periodic write data: {e}")
            logging.error(f"Error in periodic write data: {e}")
            await asyncio.sleep(10)  # 發生錯誤時等待10秒

@app.route('/api/write_data', methods=['GET'])
def write_data():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(fetch_and_write_data())
        logging.info("Data written successfully via /api/write_data")
        return "Data written successfully", 200
    except Exception as e:
        logging.error(f"Error in /api/write_data: {e}")
        return "Error writing data", 500

@app.route('/api/loadPowerPlanData', methods=['GET'])
async def load_power_plan_data():
    query_api = client.query_api()
    query = 'from(bucket: "power-plant-data") |> range(start: -1h) |> filter(fn: (r) => r._measurement == "wind_turbine")'
    result = query_api.query(query)

    data = []
    for table in result:
        for record in table.records:
            turbine_data = {
                "ID": record.values.get("ID"),
                "Name": record.values.get("Name"),
                "Time": record.get_time().isoformat(),
                "FD_WindSpeed_3s": record.values.get("FD_WindSpeed_3s"),
                "FD_WindSpeed_5min": record.values.get("FD_WindSpeed_5min"),
                # ... 其他字段 ...
            }
            data.append(turbine_data)

    return jsonify(data)

@app.route('/api/start_periodic_write', methods=['GET'])
def start_periodic_write():
    # 這裡不需要再次啟動 periodic_write_data 任務
    return "Periodic data writing is already started", 200

@app.route('/api/query_data', methods=['GET'])
def query_data():
    query_api = client.query_api()
    query = 'from(bucket: "power-plant-data") |> range(start: -1h) |> filter(fn: (r) => r._measurement == "wind_turbine")'
    result = query_api.query(query)

    data = []
    for table in result:
        for record in table.records:
            turbine_data = {
                "ID": record.values.get("ID"),
                "Name": record.values.get("Name"),
                "Time": record.get_time().isoformat(),
                "FD_WindSpeed_3s": record.values.get("FD_WindSpeed_3s"),
                "FD_WindSpeed_5min": record.values.get("FD_WindSpeed_5min"),
                "FD_WindDirector_1s": record.values.get("FD_WindDirector_1s"),
                "FD_WindDirector_10min": record.values.get("FD_WindDirector_10min"),
                "FD_WGLoadVdc": record.values.get("FD_WGLoadVdc"),
                "FD_WGLoadIdc": record.values.get("FD_WGLoadIdc"),
                "FD_OutputPower": record.values.get("FD_OutputPower"),
                "FD_WGrpm": record.values.get("FD_WGrpm"),
                "RotorTorque": record.values.get("RotorTorque"),
                "FD_DPVdc": record.values.get("FD_DPVdc"),
                "FD_TemperatureW": record.values.get("FD_TemperatureW"),
                "IW_NaceDirAngle": record.values.get("IW_NaceDirAngle"),
                "IW_SystemCurrentCtrlMode": record.values.get("IW_SystemCurrentCtrlMode"),
                "IW_SystemCurrentRunMode": record.values.get("IW_SystemCurrentRunMode"),
                "IW_SystemAlarmStatus": record.values.get("IW_SystemAlarmStatus"),
                "IW_OPSysRunStatus": record.values.get("IW_OPSysRunStatus"),
                "IW_SysCurYawAction": record.values.get("IW_SysCurYawAction"),
                "IW_SysCurPitchAction": record.values.get("IW_SysCurPitchAction"),
                "IW_SysCurHeatAction": record.values.get("IW_SysCurHeatAction"),
                "IW_SysCurDumploadAction": record.values.get("IW_SysCurDumploadAction"),
                "IW_AutoYawDirection": record.values.get("IW_AutoYawDirection"),
                "IW_StopAntiTwistCableDir": record.values.get("IW_StopAntiTwistCableDir"),
                "FD_YawAimAngle": record.values.get("FD_YawAimAngle"),
                "FD_YawPassedAngle": record.values.get("FD_YawPassedAngle"),
                "IW_YawTwistCableAngle": record.values.get("IW_YawTwistCableAngle"),
                "FD_BladeCurPitchRealAngle": record.values.get("FD_BladeCurPitchRealAngle"),
                "FD_TemperatureU": record.values.get("FD_TemperatureU"),
                "FD_TemperatureV": record.values.get("FD_TemperatureV"),
                "FD_NaceTemp": record.values.get("FD_NaceTemp"),
                "FD_PitchPower": record.values.get("FD_PitchPower"),
                "FD_YawPower": record.values.get("FD_YawPower"),
                "DayEnergy": record.values.get("DayEnergy"),
                "MonthEnergy": record.values.get("MonthEnergy"),
                "YearEnergy": record.values.get("YearEnergy"),
                "TotalEnergy": record.values.get("TotalEnergy"),
                "SysProState": record.values.get("SysProState"),
                "PoweCtrlState": record.values.get("PoweCtrlState"),
                "GridState": record.values.get("GridState"),
                "GridFeq": record.values.get("GridFeq"),
                "cosFai": record.values.get("cosFai"),
                "UgAB": record.values.get("UgAB"),
                "UgBC": record.values.get("UgBC"),
                "UgCA": record.values.get("UgCA"),
                "IoutA": record.values.get("IoutA"),
                "IoutB": record.values.get("IoutB"),
                "IoutC": record.values.get("IoutC"),
                "PowerPac": record.values.get("PowerPac"),
                "PowerQac": record.values.get("PowerQac"),
                "RunningDays": record.values.get("RunningDays"),
                "RunningHour": record.values.get("RunningHour"),
                "RunningMinute": record.values.get("RunningMinute"),
                "RunningSecond": record.values.get("RunningSecond")
            }
            data.append(turbine_data)

    return jsonify(data)

if __name__ == '__main__':
    loop = asyncio.new_event_loop()  # 建立新的事件循環
    asyncio.set_event_loop(loop)
    task = loop.create_task(periodic_write_data())  # 創建定期寫入數據的任務
    print("Periodic write data task created")
    
    # 修改這部分，確保異步任務能夠運行
    try:
        # 修改 Flask 啟動方式，使其能夠與異步任務一起運行
        from asyncio import events
        import threading
        
        def run_flask():
            app.run(debug=False, port=5503)  # 將 debug 模式設為 False
        
        # 在單獨的線程中運行 Flask
        threading.Thread(target=run_flask).start()
        
        # 運行事件循環
        loop.run_forever()
    except KeyboardInterrupt:
        print("Shutting down...")
        loop.stop()
        loop.run_until_complete(loop.shutdown_asyncgens())
        loop.close()
        print("Server stopped successfully")

# 在程序啟動時檢查 InfluxDB 連接
try:
    health = client.health()
    if health.status == "pass":
        print("Successfully connected to InfluxDB")
        logging.info("Successfully connected to InfluxDB")
    else:
        print(f"InfluxDB health check failed: {health.message}")
        logging.error(f"InfluxDB health check failed: {health.message}")
except Exception as e:
    print(f"Error connecting to InfluxDB: {e}")
    logging.error(f"Error connecting to InfluxDB: {e}")
