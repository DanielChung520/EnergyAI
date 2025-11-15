import json
import random
from datetime import datetime, timedelta
import uuid
import sys
from flask import Flask
from config import Config
from extensions import db
from models.performance import EquipmentLog

# 初始化Flask应用
app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

# 设备配置
devices = [
    {
        "site_id": "02bbb00f-7f46-45b0-8c23-82b05e37225c",
        "equip_type": "wind",
        "equip_ids": [
            "00b8c241-67b9-4988-afe6-043103678280",
            "0327b1fe-e08d-45b2-9fd3-8881bfd61a01",
            "1b0733bd-7095-41bd-bd53-b621bb89173c"
        ]
    },
    {
        "site_id": "19b48f78-e8e2-4858-a248-b4250c940b64",
        "equip_type": "solar",
        "equip_ids": [str(uuid.uuid4()) for _ in range(3)]  # 生成3个随机UUID
    },
    {
        "site_id": "42d5e858-14b5-4078-81fa-cf788669e3ed",
        "equip_type": "geothermal",
        "equip_ids": [str(uuid.uuid4()) for _ in range(2)]  # 生成2个随机UUID
    },
    {
        "site_id": "b3ddfe7e-fd62-4031-a2b4-a39e4556eb14",
        "equip_type": "biomass",
        "equip_ids": [str(uuid.uuid4()) for _ in range(4)]  # 生成4个随机UUID
    }
]

def log_progress(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")
    sys.stdout.flush()

def generate_data():
    all_logs = []
    end_time = datetime.now()
    
    for device in devices:
        site_id = device["site_id"]
        equip_type = device["equip_type"]
        total_equips = len(device["equip_ids"])
        
        log_progress(f"开始生成站点 {site_id} ({equip_type}) 的数据，共 {total_equips} 台设备")
        
        for idx, equip_id in enumerate(device["equip_ids"], 1):
            # 分两个时间段生成
            time_ranges = [
                {
                    "start": datetime(2024, 1, 1),
                    "end": datetime(2024, 12, 31, 23, 59, 59),
                    "delta": timedelta(hours=1)
                },
                {
                    "start": datetime(2025, 1, 1),
                    "end": end_time,
                    "delta": timedelta(hours=1)
                }
            ]

            for time_range in time_ranges:
                current_time = time_range["start"]
                range_end = min(time_range["end"], end_time)
                
                if current_time > range_end:
                    continue
                
                delta_desc = "每小时"
                
                log_progress(f"生成时段 {current_time.strftime('%Y-%m-%d')} 至 {range_end.strftime('%Y-%m-%d')} ({delta_desc})")

                total_records = 0
                last_log_day = current_time.date()
                
                while current_time <= range_end:
                    if current_time.date() != last_log_day:
                        log_progress(f"进度：{current_time.strftime('%Y-%m-%d')} 已生成 {total_records} 条记录")
                        last_log_day = current_time.date()
                        total_records = 0

                    # 发电量计算（优化后的版本）
                    hour = current_time.hour
                    minute = current_time.minute
                    
                    if equip_type == "wind":
                        base = 100 * (1 + random.uniform(-0.5, 0.5))  # ±50%波动
                    elif equip_type == "solar":
                        if 6 <= hour < 18:  # 白天时间
                            solar_factor = 0.8 + 0.4 * (1 - abs(12 - hour)/6)
                        else:
                            solar_factor = 0.1
                        base = 500 * solar_factor * random.uniform(0.9, 1.1)
                    elif equip_type == "biomass":
                        base = 200 * 0.85 * random.uniform(0.95, 1.05)  # ±5%波动
                    else:  # geothermal
                        base = 3 * random.uniform(0.98, 1.02)
                    
                    # 生成记录
                    log = {
                        "siteid": site_id,
                        "equip_id": equip_id,
                        "equip_type": equip_type,
                        "powder_gen": round(base + random.uniform(-5, 5), 2),
                        "voltage": round(random.uniform(220, 380), 1),
                        "current": round(random.uniform(10, 200), 1),
                        "wind_speed": round(random.uniform(0, 25), 1) if equip_type == "wind" else None,
                        "run_speed": round(random.uniform(1000, 2000), 0) if equip_type in ["wind", "biomass"] else None,
                        "temperature": round(random.uniform(20, 80), 1),
                        "humidity": round(random.uniform(30, 90), 1),
                        "emissions": round(random.uniform(0.1, 0.5), 2),
                        "log_time": current_time.strftime("%Y-%m-%d %H:%M:%S")
                    }
                    
                    all_logs.append(log)
                    total_records += 1
                    
                    # 时间递增优化
                    current_time += time_range["delta"]  # 统一按小时递增
                    
                log_progress(f"时段 {time_range['start'].year} 数据生成完成，共 {total_records} 条")

    # 新增数据库写入部分
    with app.app_context():  # 确保在应用上下文中操作
        try:
            log_progress("开始写入数据库...")
            total = len(all_logs)
            batch_size = 1000  # 每批插入1000条
            
            for i in range(0, total, batch_size):
                batch = all_logs[i:i+batch_size]
                
                try:
                    # 使用批量插入提高性能
                    db.session.bulk_insert_mappings(EquipmentLog, batch)
                    db.session.commit()
                    log_progress(f"已提交 {min(i+batch_size, total)}/{total} 条记录")
                
                except Exception as e:
                    db.session.rollback()
                    log_progress(f"批量插入失败：{str(e)}")
                    raise
                    
            log_progress("数据库写入完成！")
            
        except Exception as e:
            log_progress(f"数据库写入过程中发生错误：{str(e)}")
            raise
    
    return all_logs

# 执行数据生成
try:
    with app.app_context():
        db.create_all()  # 确保表已创建
        
    log_progress("开始生成模拟数据...")
    simulated_data = generate_data()
    
    log_progress(f"数据生成完成，总记录数：{len(simulated_data)}")

except Exception as e:
    log_progress(f"发生错误：{str(e)}")
    sys.exit(1)