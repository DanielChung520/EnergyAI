// 16方位選項（用於風向和太陽能場地方向）
export const DIRECTIONS = [
  { value: 'N', label: '北' },
  { value: 'NNE', label: '北北東' },
  { value: 'NE', label: '東北' },
  { value: 'ENE', label: '東北東' },
  { value: 'E', label: '東' },
  { value: 'ESE', label: '東南東' },
  { value: 'SE', label: '東南' },
  { value: 'SSE', label: '南南東' },
  { value: 'S', label: '南' },
  { value: 'SSW', label: '南南西' },
  { value: 'SW', label: '西南' },
  { value: 'WSW', label: '西南西' },
  { value: 'W', label: '西' },
  { value: 'WNW', label: '西北西' },
  { value: 'NW', label: '西北' },
  { value: 'NNW', label: '北北西' }
];

// 逆變器輸出形式選項
export const INVERTER_OUTPUT_TYPES = [
  { value: 'AC', label: '交流' },
  { value: 'DC', label: '直流' }
]; 