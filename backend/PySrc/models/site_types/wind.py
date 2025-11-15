from dataclasses import dataclass

@dataclass
class WindSite:
    site_id: str
    turbine_model: str
    height: float
    air_density: float
    avg_wind_speed: float
    spring_avg_wind_speed: float
    spring_wind_direction: str
    summer_avg_wind_speed: float
    summer_wind_direction: str
    autumn_avg_wind_speed: float
    autumn_wind_direction: str
    winter_avg_wind_speed: float
    winter_wind_direction: str
    remark: str 