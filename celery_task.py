from celery import Celery
import mysql.connector
from datetime import datetime

app = Celery('tasks', broker='redis://localhost:6379/0')

@app.task
def update_wind_min_data():
    conn = mysql.connector.connect(
        host="your_host",
        user="your_user",
        password="your_password",
        database="your_database"
    )
    cursor = conn.cursor()

    current_minute = datetime.now().strftime('%Y-%m-%d %H:%i')
    
    query = """
    SELECT MAX(period) INTO @last_period FROM wind_min_data;
    
    INSERT INTO wind_min_data (period, device_id, name, fd_wind_speed_3s, fd_output_power, fd_wind_direction, fd_temperature, fd_humidity, fd_pressure, fd_rainfall, fd_solar_radiation, fd_wind_speed_10min, fd_wind_direction_10min, fd_temperature_10min, fd_humidity_10min, fd_pressure_10min, fd_rainfall_10min, fd_solar_radiation_10min)
    SELECT w.period, w.device_id, w.name, w.fd_wind_speed_3s, w.fd_output_power, w.fd_wind_direction, w.fd_temperature, w.fd_humidity, w.fd_pressure, w.fd_rainfall, w.fd_solar_radiation, w.fd_wind_speed_10min, w.fd_wind_direction_10min, w.fd_temperature_10min, w.fd_humidity_10min, w.fd_pressure_10min, w.fd_rainfall_10min, w.fd_solar_radiation_10min
    FROM wind_min_data_view w
    WHERE w.period > IFNULL(@last_period, '0000-00-00 00:00')
    AND w.period <= %s;
    """
    
    cursor.execute(query, (current_minute,))
    conn.commit()
    
    cursor.close()
    conn.close() 