// 获取 CSS 变量的函数
const getCssVariable = (variableName) => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
};

// 定义标记点
const markers = (colors) => [
  { name: "Tokyo", coordinates: [139.6917, 35.6895], color: colors?.primary.green },
  { name: "New York", coordinates: [-74.0059, 40.7128], color: colors?.primary.red }
];

// 定义国家标记及其颜色
const countryMarkers = (colors) => [
  { name: "China", color: colors?.primary.red },
  { name: "Taiwan", color: colors?.primary.blue },
  { name: "Japan", color: colors?.primary.yellow },
  { name: "United States", color: colors?.primary.green },
  { name: "Canada", color: colors?.primary.lightgray },
  { name: "Australia", color: colors?.primary.darkgray },
  { name: "France", color: colors?.primary.orange },
  { name: "Germany", color: colors?.primary.purple },
  { name: "Italy", color: colors?.primary.lightblue },
  { name: "Spain", color: colors?.primary.darkred },
  { name: "Russia", color: colors?.primary.darkgray },
  { name: "Korea", color: colors?.primary.lightgray },
  { name: "India", color: colors?.primary.lightblue },
  { name: "Brazil", color: colors?.primary.darkred },
  { name: "Mexico", color: colors?.primary.orange },
  { name: "Argentina", color: colors?.primary.purple },
  { name: "Chile", color: colors?.primary.lightgray },
  { name: "Peru", color: colors?.primary.darkgray },
  { name: "South Africa", color: colors?.primary.lightblue },
  { name: "Egypt", color: colors?.primary.darkgray },
  { name: "Nigeria", color: colors?.primary.lightblue },
  { name: "Kenya", color: colors?.primary.darkred },
  { name: "Ethiopia", color: colors?.primary.orange },
  { name: "Tanzania", color: colors?.primary.purple },
  { name: "Zambia", color: colors?.primary.lightgray },
  { name: "Mozambique", color: colors?.primary.darkgray },
  { name: "Uganda", color: colors?.primary.lightblue },
  { name: "Sudan", color: colors?.primary.darkred },
  { name: "Togo", color: colors?.primary.lightgray },
  { name: "United States of America", color: colors?.primary.green },
];

// 添加 palette 的定義和導出
export const palette = {
  region: {
    fill: 'rgba(255, 255, 255, 0.1)',
    stroke: 'rgba(0, 0, 0, 0.5)'
  },
  selected: {
    fill: 'rgba(255, 255, 0, 0.3)',
    stroke: 'rgba(255, 255, 0, 0.8)'
  },
  hover: {
    fill: 'rgba(0, 255, 255, 0.3)',
    stroke: 'rgba(0, 255, 255, 0.8)'
  }
};

// 导出标记点和国家标记
export { markers, countryMarkers };
