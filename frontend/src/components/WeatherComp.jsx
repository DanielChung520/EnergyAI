import React from 'react';
import DayCloudy from '../assets/weather/day-cloudy.svg';
import DayClear from '../assets/weather/day-clear.svg';
import DayCloudyFog from '../assets/weather/day-cloudy-fog.svg';
import DayFog from '../assets/weather/day-fog.svg';
import DayPartiallyClearWithRain from '../assets/weather/day-partially-clear-with-rain.svg';
import NightCloudy from '../assets/weather/night-cloudy.svg';
import NightClear from '../assets/weather/night-clear.svg';
import NightCloudyFog from '../assets/weather/night-cloudy-fog.svg';
import NightFog from '../assets/weather/night-fog.svg';
import NightPartiallyClearWithRain from '../assets/weather/night-partially-clear-with-rain.svg';

const WeatherComp = ({ isDaytime, weatherStatus }) => {
  let WeatherIcon;

  if (isDaytime) {
    switch (weatherStatus) {
      case 'cloudy':
        WeatherIcon = DayCloudy;
        break;
      case 'clear':
        WeatherIcon = DayClear;
        break;
      case 'cloudy-fog':
        WeatherIcon = DayCloudyFog;
        break;
      case 'fog':
        WeatherIcon = DayFog;
        break;
      case 'partially-clear-with-rain':
        WeatherIcon = DayPartiallyClearWithRain;
        break;
      default:
        WeatherIcon = DayClear; // 默認為晴朗
    }
  } else {
    switch (weatherStatus) {
      case 'cloudy':
        WeatherIcon = NightCloudy;
        break;
      case 'clear':
        WeatherIcon = NightClear;
        break;
      case 'cloudy-fog':
        WeatherIcon = NightCloudyFog;
        break;
      case 'fog':
        WeatherIcon = NightFog;
        break;
      case 'partially-clear-with-rain':
        WeatherIcon = NightPartiallyClearWithRain;
        break;
      default:
        WeatherIcon = NightClear; // 默認為晴朗
    }
  }

  return (
    <div style={{ width: '100px', height: '100px' }}>
      <WeatherIcon />
    </div>
  );
};

export default WeatherComp;
