CREATE TABLE wind_power_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT DEFAULT NULL, -- 風機名稱
  device_id TEXT DEFAULT NULL, -- 設備ID
  record_time DATETIME DEFAULT NULL, -- 記錄時間
  fd_wind_speed_3s REAL DEFAULT NULL, -- 3秒風速
  fd_wind_speed_5min REAL DEFAULT NULL, -- 5分鐘風速
  fd_wind_director_1s REAL DEFAULT NULL, -- 1秒風向
  fd_wind_director_10min REAL DEFAULT NULL, -- 10分鐘風向
  fd_wg_load_vdc REAL DEFAULT NULL, -- 負載電壓
  fd_wg_load_idc REAL NOT NULL DEFAULT 0,
  fd_output_power REAL DEFAULT NULL, -- 輸出功率
  fd_wg_rpm REAL DEFAULT NULL, -- 轉速
  rotor_torque REAL DEFAULT NULL, -- 轉子扭矩
  fd_dpvdc REAL DEFAULT NULL, -- DPVdc
  fd_temperature_w REAL DEFAULT NULL, -- 溫度W
  fd_temperature_u REAL DEFAULT NULL, -- 溫度U
  fd_temperature_v REAL DEFAULT NULL, -- 溫度V
  fd_nace_temp REAL DEFAULT NULL, -- 機艙溫度
  iw_nace_dir_angle INTEGER DEFAULT NULL, -- 機艙方向角度
  iw_system_current_ctrl_mode INTEGER DEFAULT NULL, -- 系統當前控制模式
  iw_system_current_run_mode INTEGER DEFAULT NULL, -- 系統當前運行模式
  iw_system_alarm_status INTEGER DEFAULT NULL, -- 系統警報狀態
  iw_op_sys_run_status INTEGER DEFAULT NULL, -- 操作系統運行狀態
  iw_sys_cur_yaw_action INTEGER DEFAULT NULL, -- 當前偏航動作
  iw_sys_cur_pitch_action INTEGER DEFAULT NULL, -- 當前變槳動作
  iw_sys_cur_heat_action INTEGER DEFAULT NULL, -- 當前加熱動作
  iw_sys_cur_dumpload_action INTEGER DEFAULT NULL, -- 當前卸載動作
  iw_auto_yaw_direction INTEGER DEFAULT NULL, -- 自動偏航方向
  iw_stop_anti_twist_cable_dir INTEGER DEFAULT NULL, -- 防扭纜停止方向
  fd_yaw_aim_angle REAL DEFAULT NULL, -- 偏航目標角度
  fd_yaw_passed_angle REAL DEFAULT NULL, -- 偏航通過角度
  iw_yaw_twist_cable_angle INTEGER DEFAULT NULL, -- 偏航扭纜角度
  fd_blade_cur_pitch_real_angle REAL DEFAULT NULL, -- 葉片當前實際角度
  fd_pitch_power REAL DEFAULT NULL, -- 變槳功率
  fd_yaw_power REAL DEFAULT NULL, -- 偏航功率
  day_energy REAL DEFAULT NULL, -- 日發電量
  month_energy REAL DEFAULT NULL, -- 月發電量
  year_energy REAL DEFAULT NULL, -- 年發電量
  total_energy REAL DEFAULT NULL, -- 總發電量
  sys_pro_state INTEGER DEFAULT NULL, -- 系統生產狀態
  powe_ctrl_state INTEGER DEFAULT NULL, -- 功率控制狀態
  grid_state INTEGER DEFAULT NULL, -- 電網狀態
  grid_feq REAL DEFAULT NULL, -- 電網頻率
  cos_fai REAL DEFAULT NULL, -- 功率因數
  ug_ab REAL DEFAULT NULL, -- AB相電壓
  ug_bc REAL DEFAULT NULL, -- BC相電壓
  ug_ca REAL DEFAULT NULL, -- CA相電壓
  iout_a REAL DEFAULT NULL, -- A相電流
  iout_b REAL DEFAULT NULL, -- B相電流
  iout_c REAL DEFAULT NULL, -- C相電流
  power_pac REAL DEFAULT NULL, -- 有功功率
  power_qac REAL DEFAULT NULL, -- 無功功率
  running_days INTEGER DEFAULT NULL, -- 運行天數
  running_hour INTEGER DEFAULT NULL, -- 運行小時
  running_minute INTEGER DEFAULT NULL, -- 運行分鐘
  running_second REAL DEFAULT NULL, -- 運行秒數
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 創建時間
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP -- 更新時間
);

-- 建立索引
CREATE INDEX idx_device_id ON wind_power_data(device_id);
CREATE INDEX idx_record_time ON wind_power_data(record_time);
CREATE INDEX idx_name ON wind_power_data(name);