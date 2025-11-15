// 生成隨機數據的輔助函數
const generateRandomValue = (min, max) => {
  return Number((Math.random() * (max - min) + min).toFixed(2));
};

// 生成每小時數據
const generateHourlyData = (date) => {
  const data = [];
  for (let hour = 0; hour < 24; hour++) {
    const value = generateRandomValue(0, 100);
    let accumulated = hour === 0 ? value : data[hour - 1].accumulated + value;
    accumulated = Number(accumulated.toFixed(2));
    
    data.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      output: value,
      accumulated: accumulated
    });
  }
  return data;
};

// 生成每日數據
const generateDailyData = (year, month) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const data = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const value = generateRandomValue(100, 300);
    let accumulated = day === 1 ? value : data[day - 2].accumulated + value;
    accumulated = Number(accumulated.toFixed(2));
    
    data.push({
      time: `${day}日`,
      output: value,
      accumulated: accumulated
    });
  }
  return data;
};

// 生成每月數據
const generateMonthlyData = (year) => {
  const data = [];
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', 
                     '7月', '8月', '9月', '10月', '11月', '12月'];
  
  for (let month = 0; month < 12; month++) {
    const value = generateRandomValue(2000, 4000);
    let accumulated = month === 0 ? value : data[month - 1].accumulated + value;
    accumulated = Number(accumulated.toFixed(2));
    
    data.push({
      time: monthNames[month],
      output: value,
      accumulated: accumulated
    });
  }
  return data;
};

export const getPowerGenData = (type = 'month', year = new Date().getFullYear(), month = new Date().getMonth() + 1) => {
  switch (type) {
    case 'year':
      return generateMonthlyData(year);
    case 'month':
      return generateDailyData(year, month);
    case 'day':
      return generateHourlyData(new Date());
    default:
      return [];
  }
}; 