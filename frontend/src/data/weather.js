// 天气描述翻译函数
export const translateWeatherDescription = (description) => {
  const translations = {
    'clear sky': '晴空萬里',
    'few clouds': '少雲',
    'scattered clouds': '零星雲',
    'broken clouds': '多雲',
    'overcast clouds': '陰天',
    'light rain': '小雨',
    'moderate rain': '中雨',
    'heavy rain': '大雨',
    'light snow': '小雪',
    'moderate snow': '中雪',
    'heavy snow': '大雪',
    'thunderstorm': '雷暴',
    'mist': '薄霧',
    'fog': '霧',
    'haze': '霾',
    'smoke': '煙霧',
    'dust': '塵土',
    'sand': '沙塵',
    'ash': '火山灰',
    'squall': '狂風',
    'tornado': '龍捲風'
  };

  return translations[description] || description;
};

// 天气数据处理函数
export const processWeatherData = (weatherData) => {
  if (!weatherData) return null;

  return {
    windSpeed: weatherData.wind.speed,
    temperature: Math.round(weatherData.main.temp),
    weatherDescription: translateWeatherDescription(weatherData.weather[0].description),
    weatherIcon: weatherData.weather[0].icon
  };
};
