from sqlalchemy import Column, Integer, String, DateTime, Float, DECIMAL, TIMESTAMP, Date, Text
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class WindPowerData(Base):
    __tablename__ = 'wind_power_data'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), comment='風機名稱')
    device_id = Column(String(36), comment='設備ID')
    record_time = Column(DateTime, comment='記錄時間')
    
    # 風速相關
    fd_wind_speed_3s = Column(Float, comment='3秒風速')
    fd_wind_speed_5min = Column(Float, comment='5分鐘風速')
    fd_wind_director_1s = Column(Float, comment='1秒風向')
    fd_wind_director_10min = Column(Float, comment='10分鐘風向')
    
    # 負載相關
    fd_wg_load_vdc = Column(Float, comment='負載電壓')
    fd_wg_load_idc = Column(Float, comment='負載電流')
    fd_output_power = Column(Float, comment='輸出功率')
    fd_wg_rpm = Column(Float, comment='轉速')
    rotor_torque = Column(Float, comment='轉子扭矩')
    fd_dpvdc = Column(Float, comment='DPVdc')
    
    # 溫度相關
    fd_temperature_w = Column(Float, comment='溫度W')
    fd_temperature_u = Column(Float, comment='溫度U')
    fd_temperature_v = Column(Float, comment='溫度V')
    fd_nace_temp = Column(Float, comment='機艙溫度')
    
    # 系統狀態
    iw_nace_dir_angle = Column(Integer, comment='機艙方向角度')
    iw_system_current_ctrl_mode = Column(Integer, comment='系統當前控制模式')
    iw_system_current_run_mode = Column(Integer, comment='系統當前運行模式')
    iw_system_alarm_status = Column(Integer, comment='系統警報狀態')
    iw_op_sys_run_status = Column(Integer, comment='操作系統運行狀態')
    iw_sys_cur_yaw_action = Column(Integer, comment='當前偏航動作')
    iw_sys_cur_pitch_action = Column(Integer, comment='當前變槳動作')
    iw_sys_cur_heat_action = Column(Integer, comment='當前加熱動作')
    iw_sys_cur_dumpload_action = Column(Integer, comment='當前卸載動作')
    iw_auto_yaw_direction = Column(Integer, comment='自動偏航方向')
    iw_stop_anti_twist_cable_dir = Column(Integer, comment='防扭纜停止方向')
    
    # 角度相關
    fd_yaw_aim_angle = Column(Float, comment='偏航目標角度')
    fd_yaw_passed_angle = Column(Float, comment='偏航通過角度')
    iw_yaw_twist_cable_angle = Column(Integer, comment='偏航扭纜角度')
    fd_blade_cur_pitch_real_angle = Column(Float, comment='葉片當前實際角度')
    
    # 功率相關
    fd_pitch_power = Column(Float, comment='變槳功率')
    fd_yaw_power = Column(Float, comment='偏航功率')
    day_energy = Column(Float, comment='日發電量')
    month_energy = Column(Float, comment='月發電量')
    year_energy = Column(Float, comment='年發電量')
    total_energy = Column(Float, comment='總發電量')
    
    # 系統狀態
    sys_pro_state = Column(Integer, comment='系統生產狀態')
    powe_ctrl_state = Column(Integer, comment='功率控制狀態')
    grid_state = Column(Integer, comment='電網狀態')
    grid_feq = Column(Float, comment='電網頻率')
    cos_fai = Column(Float, comment='功率因數')
    
    # 電壓電流相關
    ug_ab = Column(Float, comment='AB相電壓')
    ug_bc = Column(Float, comment='BC相電壓')
    ug_ca = Column(Float, comment='CA相電壓')
    iout_a = Column(Float, comment='A相電流')
    iout_b = Column(Float, comment='B相電流')
    iout_c = Column(Float, comment='C相電流')
    power_pac = Column(Float, comment='有功功率')
    power_qac = Column(Float, comment='無功功率')
    
    # 運行時間
    running_days = Column(Integer, comment='運行天數')
    running_hour = Column(Integer, comment='運行小時')
    running_minute = Column(Integer, comment='運行分鐘')
    running_second = Column(Float, comment='運行秒數')
    
    # 時間戳
    created_at = Column(TIMESTAMP, server_default=func.now(), comment='創建時間')
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), comment='更新時間')

    def __repr__(self):
        return f"<WindPowerData(id={self.id}, name='{self.name}', device_id='{self.device_id}')>"

# 在原有模型下方添加分钟级视图模型
class WindMinDataView(Base):
    __tablename__ = 'wind_min_data_view'
    __table_args__ = {'comment': '分钟级聚合数据视图'}

    device_id = Column(String(36), primary_key=True, comment='设备ID')
    name = Column(String(100), primary_key=True, comment='风机名称')
    period = Column(String(50), primary_key=True, comment='分钟级时间戳')
    
    # 风速相关
    # fd_wind_speed_3s = Column(Float, comment='3秒风速平均值')
    fd_wind_speed_5min = Column(Float, comment='5分钟风速平均值')
    avg_wind_speed = Column(Float, comment='平均风速')
    min_wind_speed = Column(Float, comment='最小风速')
    max_wind_speed = Column(Float, comment='最大风速')
    fd_wind_director_1m = Column(Float, comment='1分钟风向平均值')
    fd_wind_director_10min = Column(Float, comment='10分钟风向平均值')
    
    # 电气参数
    fd_wg_load_vdc = Column(Float, comment='负载电压平均值')
    fd_wg_load_idc = Column(Float, comment='负载电流平均值')
    fd_output_power = Column(Float, comment='输出功率平均值')
    sum_output_power = Column(Float, comment='電力產出-直流')
    
    # 机械参数
    fd_wg_rpm = Column(Float, comment='转速平均值')
    rotor_torque = Column(Float, comment='转子扭矩平均值')
    fd_dpvdc = Column(Float, comment='DPVdc平均值')
    
    # 温度监测
    fd_temperature_w = Column(Float, comment='温度W平均值')
    fd_temperature_u = Column(Float, comment='温度U平均值')
    fd_temperature_v = Column(Float, comment='温度V平均值')
    fd_nace_temp = Column(Float, comment='机舱温度平均值')
    
    # 系统状态（最新值）
    iw_nace_dir_angle = Column(Integer, comment='机舱方向角度最新值')
    iw_system_current_ctrl_mode = Column(Integer, comment='系统控制模式最新值')
    iw_system_current_run_mode = Column(Integer, comment='系统运行模式最新值')
    iw_system_alarm_status = Column(Integer, comment='系统报警状态最新值')
    iw_op_sys_run_status = Column(Integer, comment='操作系统运行状态最新值')
    
    # 动作状态（最新值）
    iw_sys_cur_yaw_action = Column(Integer, comment='当前偏航动作最新值')
    iw_sys_cur_pitch_action = Column(Integer, comment='当前变桨动作最新值')
    iw_sys_cur_heat_action = Column(Integer, comment='当前加热动作最新值')
    iw_sys_cur_dumpload_action = Column(Integer, comment='当前卸载动作最新值')
    
    # 偏航系统
    iw_auto_yaw_direction = Column(Integer, comment='自动偏航方向平均值')
    iw_stop_anti_twist_cable_dir = Column(Integer, comment='防扭缆停止方向平均值')
    fd_yaw_aim_angle = Column(Float, comment='偏航目标角度平均值')
    fd_yaw_passed_angle = Column(Float, comment='偏航通过角度平均值')
    iw_yaw_twist_cable_angle = Column(Integer, comment='偏航扭缆角度平均值')
    
    # 变桨系统
    fd_blade_cur_pitch_real_angle = Column(Float, comment='叶片实际角度平均值')
    fd_pitch_power = Column(Float, comment='变桨功率平均值')
    fd_yaw_power = Column(Float, comment='偏航功率平均值')
    
    # 能量统计（最新值）
    day_energy = Column(Float, comment='日发电量最新值')
    month_energy = Column(Float, comment='月发电量最新值')
    year_energy = Column(Float, comment='年发电量最新值')
    total_energy = Column(Float, comment='总发电量最新值')
    
    # 系统状态（最新值）
    sys_pro_state = Column(Integer, comment='系统生产状态最新值')
    powe_ctrl_state = Column(Integer, comment='功率控制状态最新值')
    grid_state = Column(Integer, comment='电网状态最新值')
    
    # 电网参数
    grid_feq = Column(Float, comment='电网频率平均值')
    cos_fai = Column(Float, comment='功率因数平均值')
    
    # 三相电参数
    ug_ab = Column(Float, comment='AB相电压平均值')
    ug_bc = Column(Float, comment='BC相电压平均值')
    ug_ca = Column(Float, comment='CA相电压平均值')
    iout_a = Column(Float, comment='A相电流平均值')
    iout_b = Column(Float, comment='B相电流平均值')
    iout_c = Column(Float, comment='C相电流平均值')
    
    # 功率参数
    power_pac = Column(Float, comment='有功功率平均值')
    sum_power_pac = Column(Float, comment='產出電力—並網')
    power_qac = Column(Float, comment='无功功率平均值')
    
    # 运行时间（最新值）
    running_days = Column(Integer, comment='运行天数最新值')
    running_hour = Column(Integer, comment='运行小时数最新值')
    running_minute = Column(Integer, comment='运行分钟数最新值')
    running_second = Column(Float, comment='运行秒数最新值')
    
    # 统计信息
    sample_count = Column(Integer, comment='样本数量')
    period_start = Column(DateTime, comment='时段起始时间')
    period_end = Column(DateTime, comment='时段结束时间')

    def __repr__(self):
        return f"<WindMinDataView(device_id={self.device_id}, time={self.minute_time})>"

class WindHrDataView(Base):
    __tablename__ = 'wind_hr_data_view'
    __table_args__ = {'comment': '小时级聚合数据视图'}

    device_id = Column(String(36), primary_key=True, comment='设备ID')
    name = Column(String(100), primary_key=True, comment='风机名称')
    period = Column(String(50), primary_key=True, comment='小时级时间戳')
    
    # 风速统计
    avg_wind_speed = Column(Float, comment='5分钟风速小时平均值')
    min_wind_speed = Column(Float, comment='小时最小风速')
    max_wind_speed = Column(Float, comment='小时最大风速')
    std_wind_speed = Column(Float, comment='风速标准差')
    fd_wind_director = Column(Float, comment='10分钟风向小时平均值')
    
    # 电气参数
    fd_wg_load_vdc = Column(Float, comment='负载电压小时平均值')
    fd_wg_load_idc = Column(Float, comment='负载电流小时平均值')
    fd_output_power = Column(Float, comment='输出功率小时平均值')
    min_output_power = Column(Float, comment='小时最小输出功率')
    max_output_power = Column(Float, comment='小时最大输出功率')
    std_output_power = Column(Float, comment='输出功率标准差')
    sum_output_power = Column(Float, comment='電力產出-直流')
    
    # 机械参数
    fd_wg_rpm = Column(Float, comment='转速小时平均值')
    rotor_torque = Column(Float, comment='转子扭矩小时平均值')
    fd_dpvdc = Column(Float, comment='DPVdc小时平均值')
    
    # 温度监测
    fd_temperature_w = Column(Float, comment='温度W小时平均值')
    fd_temperature_u = Column(Float, comment='温度U小时平均值')
    fd_temperature_v = Column(Float, comment='温度V小时平均值')
    fd_nace_temp = Column(Float, comment='机舱温度小时平均值')
    
    # 系统状态（最新值）
    iw_nace_dir_angle = Column(Integer, comment='机舱方向角度最新值')
    iw_system_current_ctrl_mode = Column(Integer, comment='系统控制模式最新值')
    iw_system_current_run_mode = Column(Integer, comment='系统运行模式最新值')
    iw_system_alarm_status = Column(Integer, comment='系统报警状态最新值')
    iw_op_sys_run_status = Column(Integer, comment='操作系统运行状态最新值')
    
    # 动作状态（最新值）
    iw_sys_cur_yaw_action = Column(Integer, comment='当前偏航动作最新值')
    iw_sys_cur_pitch_action = Column(Integer, comment='当前变桨动作最新值')
    iw_sys_cur_heat_action = Column(Integer, comment='当前加热动作最新值')
    iw_sys_cur_dumpload_action = Column(Integer, comment='当前卸载动作最新值')
    
    # 偏航系统
    iw_auto_yaw_direction = Column(Integer, comment='自动偏航方向小时平均值')
    iw_stop_anti_twist_cable_dir = Column(Integer, comment='防扭缆停止方向小时平均值')
    fd_yaw_aim_angle = Column(Float, comment='偏航目标角度小时平均值')
    fd_yaw_passed_angle = Column(Float, comment='偏航通过角度小时平均值')
    iw_yaw_twist_cable_angle = Column(Integer, comment='偏航扭缆角度小时平均值')
    
    # 变桨系统
    fd_blade_cur_pitch_real_angle = Column(Float, comment='叶片实际角度小时平均值')
    fd_pitch_power = Column(Float, comment='变桨功率小时平均值')
    fd_yaw_power = Column(Float, comment='偏航功率小时平均值')
    
    # 能量统计（最新值）
    day_energy = Column(Float, comment='日发电量最新值')
    month_energy = Column(Float, comment='月发电量最新值')
    year_energy = Column(Float, comment='年发电量最新值')
    total_energy = Column(Float, comment='总发电量最新值')
    
    # 系统状态（最新值）
    sys_pro_state = Column(Integer, comment='系统生产状态最新值')
    powe_ctrl_state = Column(Integer, comment='功率控制状态最新值')
    grid_state = Column(Integer, comment='电网状态最新值')
    
    # 电网参数
    grid_feq = Column(Float, comment='电网频率小时平均值')
    cos_fai = Column(Float, comment='功率因数小时平均值')
    
    # 三相电参数
    ug_ab = Column(Float, comment='AB相电压小时平均值')
    ug_bc = Column(Float, comment='BC相电压小时平均值')
    ug_ca = Column(Float, comment='CA相电压小时平均值')
    iout_a = Column(Float, comment='A相电流小时平均值')
    iout_b = Column(Float, comment='B相电流小时平均值')
    iout_c = Column(Float, comment='C相电流小时平均值')
    
    # 功率参数
    power_pac = Column(Float, comment='有功功率小时平均值')
    sum_power_pac = Column(Float, comment='產出電力—並網')
    power_qac = Column(Float, comment='无功功率小时平均值')
    
    # 运行时间（最新值）
    running_days = Column(Integer, comment='运行天数最新值')
    running_hour = Column(Integer, comment='运行小时数最新值')
    running_minute = Column(Integer, comment='运行分钟数最新值')
    running_second = Column(Float, comment='运行秒数最新值')
    
    # 统计信息
    sample_count = Column(Integer, comment='样本数量')
    period_start = Column(DateTime, comment='时段起始时间')
    period_end = Column(DateTime, comment='时段结束时间')

    def __repr__(self):
        return f"<WindHrDataView(device_id={self.device_id}, time={self.period})>"

class WindDayDataView(Base):
    __tablename__ = 'wind_day_data_view'
    __table_args__ = {'comment': '日级聚合数据视图'}

    device_id = Column(String(36), primary_key=True, comment='设备ID')
    name = Column(String(100), primary_key=True, comment='风机名称')
    period = Column(String(50), primary_key=True, comment='日期（格式：YYYY-MM-DD）')
    
    # 风速统计
    fd_wind_speed = Column(Float, comment='5分钟风速日均值')
    min_wind_speed = Column(Float, comment='日最小风速')
    max_wind_speed = Column(Float, comment='日最大风速')
    std_wind_speed = Column(Float, comment='风速日标准差')
    fd_wind_director = Column(Float, comment='10分钟风向日均值')
    
    # 功率统计
    fd_output_power = Column(Float, comment='输出功率日均值')
    min_output_power = Column(Float, comment='日最小输出功率')
    max_output_power = Column(Float, comment='日最大输出功率')
    std_output_power = Column(Float, comment='输出功率日标准差')
    sum_output_power = Column(Float, comment='電力產出-直流')
    
    # 电气参数
    fd_wg_load_vdc = Column(Float, comment='负载电压日均值')
    fd_wg_load_idc = Column(Float, comment='负载电流日均值')
    
    # 机械参数
    fd_wg_rpm = Column(Float, comment='转速日均值')
    rotor_torque = Column(Float, comment='转子扭矩日均值')
    fd_dpvdc = Column(Float, comment='DPVdc日均值')
    
    # 温度监测
    fd_temperature_w = Column(Float, comment='温度W日均值')
    min_temperature_w = Column(Float, comment='日最低温度W')
    max_temperature_w = Column(Float, comment='日最高温度W')
    fd_temperature_u = Column(Float, comment='温度U日均值')
    fd_temperature_v = Column(Float, comment='温度V日均值')
    fd_nace_temp = Column(Float, comment='机舱温度日均值')
    
    # 系统状态（最新值）
    iw_nace_dir_angle = Column(Integer, comment='机舱方向角度最新值')
    iw_system_current_ctrl_mode = Column(Integer, comment='系统控制模式最新值')
    iw_system_current_run_mode = Column(Integer, comment='系统运行模式最新值')
    iw_system_alarm_status = Column(Integer, comment='系统报警状态最新值')
    iw_op_sys_run_status = Column(Integer, comment='操作系统运行状态最新值')
    
    # 动作状态（最新值）
    iw_sys_cur_yaw_action = Column(Integer, comment='当前偏航动作最新值')
    iw_sys_cur_pitch_action = Column(Integer, comment='当前变桨动作最新值')
    iw_sys_cur_heat_action = Column(Integer, comment='当前加热动作最新值')
    iw_sys_cur_dumpload_action = Column(Integer, comment='当前卸载动作最新值')
    
    # 偏航系统
    iw_auto_yaw_direction = Column(Integer, comment='自动偏航方向日均值')
    iw_stop_anti_twist_cable_dir = Column(Integer, comment='防扭缆停止方向日均值')
    fd_yaw_aim_angle = Column(Float, comment='偏航目标角度日均值')
    fd_yaw_passed_angle = Column(Float, comment='偏航通过角度日均值')
    iw_yaw_twist_cable_angle = Column(Integer, comment='偏航扭缆角度日均值')
    
    # 变桨系统
    fd_blade_cur_pitch_real_angle = Column(Float, comment='叶片实际角度日均值')
    fd_pitch_power = Column(Float, comment='变桨功率日均值')
    fd_yaw_power = Column(Float, comment='偏航功率日均值')
    
    # 能量统计
    day_energy = Column(Float, comment='日发电量最新值')
    month_energy = Column(Float, comment='月发电量最新值')
    year_energy = Column(Float, comment='年发电量最新值')
    total_energy = Column(Float, comment='总发电量最新值')
    daily_energy_estimate = Column(Float, comment='日发电量估算值（基于平均功率）')
    
    # 系统状态（最新值）
    sys_pro_state = Column(Integer, comment='系统生产状态最新值')
    powe_ctrl_state = Column(Integer, comment='功率控制状态最新值')
    grid_state = Column(Integer, comment='电网状态最新值')
    
    # 电网参数
    grid_feq = Column(Float, comment='电网频率日均值')
    min_grid_feq = Column(Float, comment='日最低电网频率')
    max_grid_feq = Column(Float, comment='日最高电网频率')
    cos_fai = Column(Float, comment='功率因数日均值')
    
    # 电压电流统计
    ug_ab = Column(Float, comment='AB相电压日均值')
    ug_bc = Column(Float, comment='BC相电压日均值')
    ug_ca = Column(Float, comment='CA相电压日均值')
    min_voltage = Column(Float, comment='日最低相电压')
    max_voltage = Column(Float, comment='日最高相电压')
    iout_a = Column(Float, comment='A相电流日均值')
    iout_b = Column(Float, comment='B相电流日均值')
    iout_c = Column(Float, comment='C相电流日均值')
    min_current = Column(Float, comment='日最低相电流')
    max_current = Column(Float, comment='日最高相电流')
    
    # 功率参数
    power_pac = Column(Float, comment='有功功率日均值')
    sum_power_pac = Column(Float, comment='產出電力—並網')
    power_qac = Column(Float, comment='无功功率日均值')
    
    # 运行时间
    running_days = Column(Integer, comment='运行天数最新值')
    running_hour = Column(Integer, comment='运行小时数最新值')
    operation_hours = Column(Float, comment='当日实际运行小时数')
    effective_generation_hours = Column(Float, comment='有效发电小时数')
    
    # 统计信息
    sample_count = Column(Integer, comment='样本数量')
    day_start_time = Column(DateTime, comment='日起始时间')
    day_end_time = Column(DateTime, comment='日结束时间')

    def __repr__(self):
        return f"<WindDayDataView(device_id={self.device_id}, day={self.day_time})>"

class WindWeekDataView(Base):
    __tablename__ = 'wind_week_data_view'
    __table_args__ = {'comment': '周级聚合数据视图'}

    device_id = Column(String(36), primary_key=True, comment='设备ID')
    name = Column(String(100), primary_key=True, comment='风机名称')
    period = Column(Integer, primary_key=True, comment='年周编号（格式：YYYYWW）')
    week_start_date = Column(Date, comment='周起始日期（周一）')
    
    # 风速统计
    fd_wind_speed = Column(Float, comment='周平均风速')
    min_wind_speed = Column(Float, comment='周最小风速')
    max_wind_speed = Column(Float, comment='周最大风速')
    std_wind_speed = Column(Float, comment='风速周标准差')
    fd_wind_director = Column(Float, comment='周平均风向')
    
    # 功率统计
    fd_output_power = Column(Float, comment='周平均输出功率')
    min_output_power = Column(Float, comment='周最小输出功率')
    max_output_power = Column(Float, comment='周最大输出功率')
    std_output_power = Column(Float, comment='输出功率周标准差')
    sum_output_power = Column(Float, comment='電力產出-直流')
    
    # 电气参数
    fd_wg_load_vdc = Column(Float, comment='负载电压周平均值')
    fd_wg_load_idc = Column(Float, comment='负载电流周平均值')
    
    # 机械参数
    fd_wg_rpm = Column(Float, comment='转速周平均值')
    rotor_torque = Column(Float, comment='转子扭矩周平均值')
    fd_dpvdc = Column(Float, comment='DPVdc周平均值')
    
    # 温度监测
    fd_temperature_w = Column(Float, comment='温度W周平均值')
    min_temperature_w = Column(Float, comment='周最低温度W')
    max_temperature_w = Column(Float, comment='周最高温度W')
    fd_temperature_u = Column(Float, comment='温度U周平均值')
    fd_temperature_v = Column(Float, comment='温度V周平均值')
    fd_nace_temp = Column(Float, comment='机舱温度周平均值')
    min_nace_temp = Column(Float, comment='周最低机舱温度')
    max_nace_temp = Column(Float, comment='周最高机舱温度')
    
    # 系统状态（最新值）
    last_ctrl_mode = Column(Integer, comment='本周最后控制模式')
    last_run_mode = Column(Integer, comment='本周最后运行模式')
    last_alarm_status = Column(Integer, comment='本周最后报警状态')
    
    # 运行指标
    alarm_rate = Column(Float, comment='周报警率（报警样本占比）')
    generation_rate = Column(Float, comment='周发电率（发电样本占比）')
    
    # 偏航系统
    fd_yaw_aim_angle = Column(Float, comment='偏航目标角度周平均值')
    fd_yaw_passed_angle = Column(Float, comment='偏航通过角度周平均值')
    fd_blade_cur_pitch_real_angle = Column(Float, comment='叶片实际角度周平均值')
    
    # 能量管理
    fd_pitch_power = Column(Float, comment='变桨功率周平均值')
    fd_yaw_power = Column(Float, comment='偏航功率周平均值')
    week_energy = Column(Float, comment='周实际发电量（本周累计）')
    weekly_energy_estimate = Column(Float, comment='周发电量估算（基于平均功率）')
    
    # 能量统计（最新值）
    month_energy = Column(Float, comment='月发电量最新值')
    year_energy = Column(Float, comment='年发电量最新值')
    total_energy = Column(Float, comment='总发电量最新值')
    
    # 电网质量
    grid_feq = Column(Float, comment='电网频率周平均值')
    min_grid_feq = Column(Float, comment='周最低电网频率')
    max_grid_feq = Column(Float, comment='周最高电网频率')
    std_grid_feq = Column(Float, comment='电网频率周标准差')
    cos_fai = Column(Float, comment='功率因数周平均值')
    
    # 电压电流统计
    ug_ab = Column(Float, comment='AB相电压周平均值')
    ug_bc = Column(Float, comment='BC相电压周平均值')
    ug_ca = Column(Float, comment='CA相电压周平均值')
    min_voltage = Column(Float, comment='周最低相电压')
    max_voltage = Column(Float, comment='周最高相电压')
    iout_a = Column(Float, comment='A相电流周平均值')
    iout_b = Column(Float, comment='B相电流周平均值')
    iout_c = Column(Float, comment='C相电流周平均值')
    min_current = Column(Float, comment='周最低相电流')
    max_current = Column(Float, comment='周最高相电流')
    
    # 功率参数
    power_pac = Column(Float, comment='有功功率周平均值')
    sum_power_pac = Column(Float, comment='產出電力—並網')
    power_qac = Column(Float, comment='无功功率周平均值')
    
    # 运行时间
    running_days = Column(Integer, comment='累计运行天数最新值')
    running_hour = Column(Integer, comment='累计运行小时数最新值')
    total_hours = Column(Integer, comment='本周总运行小时数')
    effective_generation_hours = Column(Float, comment='本周有效发电小时数')
    
    # 性能指标
    avg_generation_power = Column(Float, comment='平均发电功率（仅发电时段）')
    data_availability = Column(Float, comment='数据可用率（有效样本占比）')
    
    # 统计信息
    sample_count = Column(Integer, comment='周样本数量')
    week_start_time = Column(DateTime, comment='周起始时间')
    week_end_time = Column(DateTime, comment='周结束时间')

    def __repr__(self):
        return f"<WindWeekDataView(device_id={self.device_id}, week={self.year_week})>"

class WindMonDataView(Base):
    __tablename__ = 'wind_mon_data_view'
    __table_args__ = {'comment': '月级聚合数据视图'}

    device_id = Column(String(36), primary_key=True, comment='设备ID')
    name = Column(String(100), primary_key=True, comment='风机名称')
    period = Column(String(50), primary_key=True, comment='年月（格式：YYYY-MM）')
    
    # 时间相关
    month_start_date = Column(Date, comment='月起始日期')
    days_in_month = Column(Integer, comment='当月有效天数')
    month_start_time = Column(DateTime, comment='月起始时间')
    month_end_time = Column(DateTime, comment='月结束时间')
    
    # 风速统计
    fd_wind_speed = Column(Float, comment='月平均风速')
    min_wind_speed = Column(Float, comment='月最小风速')
    max_wind_speed = Column(Float, comment='月最大风速')
    std_wind_speed = Column(Float, comment='风速月标准差')
    fd_wind_director = Column(Float, comment='月平均风向')
    
    # 功率统计
    fd_output_power = Column(Float, comment='月平均输出功率')
    min_output_power = Column(Float, comment='月最小输出功率')
    max_output_power = Column(Float, comment='月最大输出功率')
    std_output_power = Column(Float, comment='输出功率月标准差')
    sum_output_power = Column(Float, comment='電力產出-直流')
    
    # 能量管理
    actual_month_energy = Column(Float, comment='实际月发电量（本月累计）')
    year_energy = Column(Float, comment='年发电量最新值')
    total_energy = Column(Float, comment='总发电量最新值')
    
    # 温度监测
    fd_temperature_w = Column(Float, comment='温度W月平均值')
    min_temperature_w = Column(Float, comment='月最低温度W')
    max_temperature_w = Column(Float, comment='月最高温度W')
    fd_nace_temp = Column(Float, comment='机舱温度月平均值')
    min_nace_temp = Column(Float, comment='月最低机舱温度')
    max_nace_temp = Column(Float, comment='月最高机舱温度')
    
    # 运行指标
    generation_rate = Column(Float, comment='月发电率（发电样本占比）')
    alarm_rate = Column(Float, comment='月报警率（报警样本占比）')
    
    # 系统状态变化
    ctrl_mode_changes = Column(Integer, comment='控制模式切换次数')
    run_mode_changes = Column(Integer, comment='运行模式切换次数')
    alarm_status_changes = Column(Integer, comment='报警状态变化次数')
    
    # 系统状态（最新值）
    last_ctrl_mode = Column(Integer, comment='本月最后控制模式')
    last_run_mode = Column(Integer, comment='本月最后运行模式')
    last_alarm_status = Column(Integer, comment='本月最后报警状态')
    
    # 电网质量
    grid_feq = Column(Float, comment='电网频率月平均值')
    min_grid_feq = Column(Float, comment='月最低电网频率')
    max_grid_feq = Column(Float, comment='月最高电网频率')
    std_grid_feq = Column(Float, comment='电网频率月标准差')
    cos_fai = Column(Float, comment='功率因数月平均值')
    
    # 电压电流统计
    avg_voltage_ab = Column(Float, comment='AB相电压月平均值')
    avg_voltage_bc = Column(Float, comment='BC相电压月平均值')
    avg_voltage_ca = Column(Float, comment='CA相电压月平均值')
    min_voltage = Column(Float, comment='月最低相电压')
    max_voltage = Column(Float, comment='月最高相电压')
    avg_current_a = Column(Float, comment='A相电流月平均值')
    avg_current_b = Column(Float, comment='B相电流月平均值')
    avg_current_c = Column(Float, comment='C相电流月平均值')
    
    # 功率参数
    avg_active_power = Column(Float, comment='有功功率月平均值')
    sum_power_pac = Column(Float, comment='產出電力—並網')
    avg_reactive_power = Column(Float, comment='无功功率月平均值')
    max_active_power = Column(Float, comment='月最大有功功率')
    
    # 性能指标
    effective_generation_hours = Column(Float, comment='本月有效发电小时数')
    capacity_factor = Column(Float, comment='容量系数（实际发电量/理论最大发电量）')
    power_coefficient = Column(Float, comment='功率系数（实际功率/理论风能功率）')
    data_availability = Column(Float, comment='数据可用率（有效样本占比）')
    
    # 运行时间
    total_running_days = Column(Integer, comment='累计运行天数')
    total_running_hours = Column(Integer, comment='累计运行小时数')
    
    # 报警统计
    days_with_alarms = Column(Integer, comment='本月报警天数')
    
    # 运行区间统计
    avg_power_in_operating_range = Column(Float, comment='运行风速区间平均功率（3-25m/s）')
    
    # 统计信息
    total_samples = Column(Integer, comment='月样本总数')

    def __repr__(self):
        return f"<WindMonDataView(device_id={self.device_id}, month={self.year_months})>"

class WindMinData(Base):
    __tablename__ = 'wind_min_data'

    # 設置主鍵
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    device_id = Column(String(36), comment='設備ID')
    name = Column(String(100), comment='風機名稱')
    period = Column(String(21), comment='時間段')
    site_id = Column(String(45), comment='站點ID')
    fd_wind_speed_3s = Column(DECIMAL(14, 12), comment='3秒風速')
    fd_wind_speed_5min = Column(DECIMAL(14, 12), comment='5分鐘風速')
    # avg_wind_speed = Column(DECIMAL(14, 12), comment='平均風速')
    min_wind_speed = Column(DECIMAL(14, 12), comment= '最小風速')
    max_wind_speed = Column(DECIMAL(14, 12), comment= '最大風速')
    fd_wind_director_1m = Column(DECIMAL(14, 8), comment='1分鐘風向')
    fd_wind_director_10min = Column(DECIMAL(14, 10), comment='10分鐘風向')
    fd_wg_load_vdc = Column(DECIMAL(14, 11), comment='負載電壓')
    fd_wg_load_idc = Column(DECIMAL(14, 11), comment='負載電流')
    fd_output_power = Column(DECIMAL(14, 6), comment='輸出功率')
    sum_output_power = Column(DECIMAL(32, 2), comment='總輸出功率')
    fd_wg_rpm = Column(DECIMAL(14, 5), comment='轉速')
    rotor_torque = Column(DECIMAL(14, 5), comment='轉子扭矩')
    fd_dpvdc = Column(DECIMAL(14, 5), comment='DPVdc')
    fd_temperature_w = Column(DECIMAL(14, 11), comment='溫度W')
    fd_temperature_u = Column(DECIMAL(14, 11), comment='溫度U')
    fd_temperature_v = Column(DECIMAL(14, 11), comment='溫度V')
    fd_nace_temp = Column(DECIMAL(14, 11), comment='機艙溫度')
    iw_nace_dir_angle = Column(DECIMAL(14, 4), comment='機艙方向角度')
    iw_system_current_ctrl_mode = Column(Text, comment='系統當前控制模式')
    iw_system_current_run_mode = Column(Text, comment='系統當前運行模式')
    iw_system_alarm_status = Column(Text, comment='系統警報狀態')
    iw_op_sys_run_status = Column(Text, comment='操作系統運行狀態')
    iw_sys_cur_yaw_action = Column(Text, comment='當前偏航動作')
    iw_sys_cur_pitch_action = Column(Text, comment='當前變槳動作')
    iw_sys_cur_heat_action = Column(Text, comment='當前加熱動作')
    iw_sys_cur_dumpload_action = Column(Text, comment='當前卸載動作')
    iw_auto_yaw_direction = Column(DECIMAL(14, 4), comment='自動偏航方向')
    iw_stop_anti_twist_cable_dir = Column(DECIMAL(14, 4), comment='防扭纜停止方向')
    fd_yaw_aim_angle = Column(DECIMAL(14, 5), comment='偏航目標角度')
    fd_yaw_passed_angle = Column(DECIMAL(14, 5), comment='偏航通過角度')
    iw_yaw_twist_cable_angle = Column(DECIMAL(14, 4), comment='偏航扭纜角度')
    fd_blade_cur_pitch_real_angle = Column(DECIMAL(14, 5), comment='葉片當前實際角度')
    fd_pitch_power = Column(DECIMAL(14, 5), comment='變槳功率')
    fd_yaw_power = Column(DECIMAL(14, 5), comment='偏航功率')
    day_energy = Column(Text, comment='日發電量')
    month_energy = Column(Text, comment='月發電量')
    year_energy = Column(Text, comment='年發電量')
    total_energy = Column(Text, comment='總發電量')
    sys_pro_state = Column(Text, comment='系統生產狀態')
    powe_ctrl_state = Column(Text, comment='功率控制狀態')
    grid_state = Column(Text, comment='電網狀態')
    grid_feq = Column(DECIMAL(14, 6), comment='電網頻率')
    cos_fai = Column(DECIMAL(14, 8), comment='功率因數')
    ug_ab = Column(DECIMAL(14, 5), comment='AB相電壓')
    ug_bc = Column(DECIMAL(14, 5), comment='BC相電壓')
    ug_ca = Column(DECIMAL(14, 5), comment='CA相電壓')
    iout_a = Column(DECIMAL(14, 6), comment='A相電流')
    iout_b = Column(DECIMAL(14, 6), comment='B相電流')
    iout_c = Column(DECIMAL(14, 6), comment='C相電流')
    power_pac = Column(DECIMAL(14, 6), comment='有功功率')
    sum_power_pac = Column(DECIMAL(32, 2), comment='總有功功率')
    power_qac = Column(DECIMAL(14, 6), comment='無功功率')
    running_days = Column(Text, comment='運行天數')
    running_hour = Column(Text, comment='運行小時')
    running_minute = Column(Text, comment='運行分鐘')
    running_second = Column(Text, comment='運行秒數')
    sample_count = Column(Integer, comment='樣本數量', default=0)
    period_start = Column(DateTime, comment='記錄開始時間')
    period_end = Column(DateTime, comment='記錄結束時間')

    def __repr__(self):
        return f"<WindMinData(device_id={self.device_id}, name='{self.name}', period='{self.period}')>"


class WindMinDataArchive(Base):
    __tablename__ = 'wind_min_data_archive_v'

    # 設置主鍵
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    device_id = Column(String(36), comment='設備ID')
    name = Column(String(100), comment='風機名稱')
    period = Column(String(21), comment='時間段')
    period_hr = Column(String(21), comment='時週期')
    period_day = Column(String(21), comment='日週期')
    period_mon = Column(String(21), comment='月週期')
    site_id = Column(String(45), comment='站點ID')
    fd_wind_speed_3s = Column(DECIMAL(14, 12), comment='3秒風速')
    fd_wind_speed_5min = Column(DECIMAL(14, 12), comment='5分鐘風速')
    min_wind_speed = Column(DECIMAL(14, 12), comment= '最小風速')
    max_wind_speed = Column(DECIMAL(14, 12), comment= '最大風速')
    fd_wind_director_1m = Column(DECIMAL(14, 8), comment='1分鐘風向')
    fd_wind_director_10min = Column(DECIMAL(14, 10), comment='10分鐘風向')
    fd_wg_load_vdc = Column(DECIMAL(14, 11), comment='負載電壓')
    fd_wg_load_idc = Column(DECIMAL(14, 11), comment='負載電流')
    fd_output_power = Column(DECIMAL(14, 6), comment='輸出功率')
    sum_output_power = Column(DECIMAL(32, 2), comment='總輸出功率')
    fd_wg_rpm = Column(DECIMAL(14, 5), comment='轉速')
    rotor_torque = Column(DECIMAL(14, 5), comment='轉子扭矩')
    fd_dpvdc = Column(DECIMAL(14, 5), comment='DPVdc')
    fd_temperature_w = Column(DECIMAL(14, 11), comment='溫度W')
    fd_temperature_u = Column(DECIMAL(14, 11), comment='溫度U')
    fd_temperature_v = Column(DECIMAL(14, 11), comment='溫度V')
    fd_nace_temp = Column(DECIMAL(14, 11), comment='機艙溫度')
    iw_nace_dir_angle = Column(DECIMAL(14, 4), comment='機艙方向角度')
    iw_system_current_ctrl_mode = Column(Text, comment='系統當前控制模式')
    iw_system_current_run_mode = Column(Text, comment='系統當前運行模式')
    iw_system_alarm_status = Column(Text, comment='系統警報狀態')
    iw_op_sys_run_status = Column(Text, comment='操作系統運行狀態')
    iw_sys_cur_yaw_action = Column(Text, comment='當前偏航動作')
    iw_sys_cur_pitch_action = Column(Text, comment='當前變槳動作')
    iw_sys_cur_heat_action = Column(Text, comment='當前加熱動作')
    iw_sys_cur_dumpload_action = Column(Text, comment='當前卸載動作')
    iw_auto_yaw_direction = Column(DECIMAL(14, 4), comment='自動偏航方向')
    iw_stop_anti_twist_cable_dir = Column(DECIMAL(14, 4), comment='防扭纜停止方向')
    fd_yaw_aim_angle = Column(DECIMAL(14, 5), comment='偏航目標角度')
    fd_yaw_passed_angle = Column(DECIMAL(14, 5), comment='偏航通過角度')
    iw_yaw_twist_cable_angle = Column(DECIMAL(14, 4), comment='偏航扭纜角度')
    fd_blade_cur_pitch_real_angle = Column(DECIMAL(14, 5), comment='葉片當前實際角度')
    fd_pitch_power = Column(DECIMAL(14, 5), comment='變槳功率')
    fd_yaw_power = Column(DECIMAL(14, 5), comment='偏航功率')
    day_energy = Column(Text, comment='日發電量')
    month_energy = Column(Text, comment='月發電量')
    year_energy = Column(Text, comment='年發電量')
    total_energy = Column(Text, comment='總發電量')
    sys_pro_state = Column(Text, comment='系統生產狀態')
    powe_ctrl_state = Column(Text, comment='功率控制狀態')
    grid_state = Column(Text, comment='電網狀態')
    grid_feq = Column(DECIMAL(14, 6), comment='電網頻率')
    cos_fai = Column(DECIMAL(14, 8), comment='功率因數')
    ug_ab = Column(DECIMAL(14, 5), comment='AB相電壓')
    ug_bc = Column(DECIMAL(14, 5), comment='BC相電壓')
    ug_ca = Column(DECIMAL(14, 5), comment='CA相電壓')
    iout_a = Column(DECIMAL(14, 6), comment='A相電流')
    iout_b = Column(DECIMAL(14, 6), comment='B相電流')
    iout_c = Column(DECIMAL(14, 6), comment='C相電流')
    power_pac = Column(DECIMAL(14, 6), comment='有功功率')
    sum_power_pac = Column(DECIMAL(32, 2), comment='總有功功率')
    power_qac = Column(DECIMAL(14, 6), comment='無功功率')
    running_days = Column(Text, comment='運行天數')
    running_hour = Column(Text, comment='運行小時')
    running_minute = Column(Text, comment='運行分鐘')
    running_second = Column(Text, comment='運行秒數')
    sample_count = Column(Integer, comment='樣本數量', default=0)
    period_start = Column(DateTime, comment='記錄開始時間')
    period_end = Column(DateTime, comment='記錄結束時間')

    def __repr__(self):
        return f"<WindMinData(device_id={self.device_id}, name='{self.name}', period='{self.period}')>"




"""
 從wind_min_data_archive_v 創建 不同週期的View
"""
class WindDataMinView(Base):
    __tablename__ = 'wind_data_min_v'

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(String(36), comment='設備ID')
    period = Column(String(21), comment='時間段')
    avg_wind_speed = Column(DECIMAL(14, 12), comment='平均風速')
    max_wind_speed = Column(DECIMAL(14, 12), comment='最大風速')
    min_wind_speed = Column(DECIMAL(14, 12), comment='最小風速')
    wind_power = Column(DECIMAL(14, 12), comment='風機風力發電量')
    grid_power = Column(DECIMAL(14, 12), comment='並網發電量')

    def __repr__(self):
        return f"<WindDataMinView(device_id={self.device_id}, period='{self.period}')>"


class WindDataHrsView(Base):
    __tablename__ = 'wind_data_hrs_v'

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(String(36), comment='設備ID')
    period = Column(String(21), comment='時間段')
    avg_wind_speed = Column(DECIMAL(14, 12), comment='平均風速')
    max_wind_speed = Column(DECIMAL(14, 12), comment='最大風速')
    min_wind_speed = Column(DECIMAL(14, 12), comment='最小風速')
    wind_power = Column(DECIMAL(14, 12), comment='風機風力發電量')
    grid_power = Column(DECIMAL(14, 12), comment='並網發電量')

    def __repr__(self):
        return f"<WindDataMinView(device_id={self.device_id}, period='{self.period}')>"

class WindDataDayView(Base):
    __tablename__ = 'wind_data_day_v'

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(String(36), comment='設備ID')
    period = Column(String(21), comment='時間段')
    avg_wind_speed = Column(DECIMAL(14, 12), comment='平均風速')
    max_wind_speed = Column(DECIMAL(14, 12), comment='最大風速')
    min_wind_speed = Column(DECIMAL(14, 12), comment='最小風速')
    wind_power = Column(DECIMAL(14, 12), comment='風機風力發電量')
    grid_power = Column(DECIMAL(14, 12), comment='並網發電量')

    def __repr__(self):
        return f"<WindDataMinView(device_id={self.device_id}, period='{self.period}')>"

class WindDataMonView(Base):
    __tablename__ = 'wind_data_mon_v'

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(String(36), comment='設備ID')
    period = Column(String(21), comment='時間段')
    avg_wind_speed = Column(DECIMAL(14, 12), comment='平均風速')
    max_wind_speed = Column(DECIMAL(14, 12), comment='最大風速')
    min_wind_speed = Column(DECIMAL(14, 12), comment='最小風速')
    wind_power = Column(DECIMAL(14, 12), comment='風機風力發電量')
    grid_power = Column(DECIMAL(14, 12), comment='並網發電量')

    def __repr__(self):
        return f"<WindDataMinView(device_id={self.device_id}, period='{self.period}')>"        