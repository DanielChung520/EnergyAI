// 獲取 CSS 變量的函數
const getCssVariable = (variableName) => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
};

// 定義標記點
const markers = (colors) => [
  { name: "Tokyo", coordinates: [139.6917, 35.6895], color: colors?.primary.red },
  { name: "New York", coordinates: [-74.0059, 40.7128], color: colors?.primary.red }
];

// 定義國家標記及其顏色
const countryMarkers = (colors) => {
  return [
    { name: "China", color: colors?.primary.red },
    { name: "Taiwan", color: colors?.primary.blue },
    { name: "Japan", color: colors?.primary.yellow },
    { name: "Philippines", color: colors?.primary.green },
    // ... 其他國家標記，為未啟用的國家設置預設顏色
  ];
};

// 導出標記點和國家標記
export { markers, countryMarkers };

export const palette = {
  // ... palette 的配置
};
