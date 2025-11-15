from dataclasses import dataclass

@dataclass
class SolarSite:
    site_id: str
    module_type: str                  # 適合光伏模組類型
    bracket_height: float             # 支架高度
    annual_sunlight: float           # 年平均光照
    output_voltage: float            # 標準輸出電壓
    inverter_output: str             # 逆變器輸出形式
    ground_direction: str            # 場地坡面方向
    sunlight_direction: str          # 光照方向
    avg_temperature: float           # 年平均溫度
    avg_rainfall: float              # 年平均降雨量
    avg_wind_speed: float           # 平均風速
    remark: str                      # 備註 