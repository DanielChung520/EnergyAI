import React from 'react';

const TemperatureComp = ({ temperature = 25 }) => {
  // 定义温度刻度值
  const scaleValues = [5, 25, 35];
  
  // 根据温度确定颜色
  const getTemperatureColor = (temp) => {
    if (temp <= 5) return "#44aaff";  // 蓝色 - 寒冷
    if (temp <= 25) return "#4CAF50"; // 绿色 - 适宜
    if (temp <= 35) return "#FFC107"; // 黄色 - 警告
    return "#ff4444";                 // 红色 - 危险
  };

  // 计算显示位置的函数
  const getPosition = (value) => {
    // 将0-40的范围映射到0-180的范围
    return (value * 180) / 40;
  };
  
  // 计算温度填充的宽度
  const getFillWidth = () => {
    const width = getPosition(temperature);
    return Math.min(width, 180);
  };
  
  return (
    <div style={{ margin: '20px auto', width: '200px' }}>
      <svg width="200" height="70" viewBox="0 0 200 70">
        {/* 温度刻度标签 */}
        {scaleValues.map((value) => (
          <text
            key={`label-${value}`}
            x={10 + getPosition(value)}
            y="12"
            textAnchor="middle"
            fill="#666"
            fontSize="12"
            fontWeight="500"
          >
            {value}°C
          </text>
        ))}

        {/* 温度计外壳 */}
        <rect
          x="10"
          y="30"
          width="180"
          height="20"
          rx="10"
          ry="10"
          fill="none"
          stroke="#ccc"
          strokeWidth="2"
        />
        
        {/* 温度填充 */}
        <rect
          x="12"
          y="32"
          width={getFillWidth()}
          height="16"
          rx="8"
          ry="8"
          fill={getTemperatureColor(temperature)}
        />
        
        {/* 温度刻度 */}
        {scaleValues.map((value) => (
          <line
            key={`scale-${value}`}
            x1={10 + getPosition(value)}
            y1="25"
            x2={10 + getPosition(value)}
            y2="55"
            stroke="#999"
            strokeWidth="1"
          />
        ))}
        
        {/* 当前温度数值 */}
        <text
          x="100"
          y="70"
          textAnchor="middle"
          fill="#333"
          fontSize="20"
          fontWeight="bold"
        >
          {temperature}°C
        </text>
      </svg>
    </div>
  );
};

export default TemperatureComp;
