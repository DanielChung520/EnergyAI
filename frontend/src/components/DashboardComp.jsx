import React, { useState, useEffect } from 'react';

const GaugeChart = ({ 
  value = 0,           // 修改默認值為 0
  min = 0, 
  max = 450,          // 修改默認最大值
  title = "標題",
  segments = [        // 修改默認的顏色區段
    { value: 80, color: '#e0e0e0' },    // 淺灰色 0-80
    { value: 380, color: '#bdbdbd' },   // 灰色 80-380
    { value: 410, color: '#66bb6a' },   // 綠色 380-410
    { value: 420, color: '#ffab40' },   // 橙色 410-420
    { value: 450, color: '#ff5252' }    // 紅色 420-450
  ],
  unit = 'V',         // 修改默認單位
  animate = true,
  animationDuration = 500,
  width = 400,        // 增加默認寬度從 350 到 400
  height = 300        // 增加默認高度從 250 到 300
}) => {
  const [currentValue, setCurrentValue] = useState(value);
  
  // 監聽 value 的變化
  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        const animationStartTime = Date.now();
        
        const animationFrame = () => {
          const elapsedTime = Date.now() - animationStartTime;
          const progress = Math.min(elapsedTime / animationDuration, 1);
          const easedProgress = easeOutCubic(progress);
          
          const newValue = currentValue + easedProgress * (value - currentValue);
          setCurrentValue(newValue);
          
          if (progress < 1) {
            requestAnimationFrame(animationFrame);
          }
        };
        
        requestAnimationFrame(animationFrame);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setCurrentValue(value);
    }
  }, [value, animate, animationDuration, currentValue]);
  
  // 修改中心點位置
  const centerX = width / 2;
  const centerY = height * 0.58;  // 保持這個比例以維持當前的垂直位置
  
  // 半徑 - 增加環形大小
  const radius = Math.min(width, height) * 0.45;  // 減小半徑比例從 0.52 到 0.45
  
  // 角度範圍（弧度）- 270度弧 (從-225度到+45度)
  const startAngle = Math.PI * 0.75;  // 開始於左下方（135度）
  const endAngle = Math.PI * 2.25;    // 結束於右下方（405度）
  
  // 計算給定值的弧度
  const valueToRadians = (val) => {
    const valueRange = max - min;
    const angleRange = endAngle - startAngle;
    return startAngle + ((val - min) / valueRange) * angleRange;
  };
  
  // 計算弧形路徑
  const describeArc = (x, y, radius, startAngleRad, endAngleRad) => {
    const start = {
      x: x + radius * Math.cos(startAngleRad),
      y: y + radius * Math.sin(startAngleRad)
    };
    
    const end = {
      x: x + radius * Math.cos(endAngleRad),
      y: y + radius * Math.sin(endAngleRad)
    };
    
    const largeArcFlag = endAngleRad - startAngleRad <= Math.PI ? 0 : 1;
    
    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y
    ].join(' ');
  };
  
  // 計算指針終點
  const getNeedlePoint = (value) => {
    const angle = valueToRadians(value);
    const needleLength = radius * 0.8;
    
    return {
      x: centerX + needleLength * Math.cos(angle),
      y: centerY + needleLength * Math.sin(angle)
    };
  };
  
  // 生成刻度標記 - 增加刻度數以適應270度弧
  const generateTicks = () => {
    const totalTicks = 14; // 增加刻度數以適應更大的弧度
    const angleStep = (startAngle - endAngle) / totalTicks;
    const valueStep = (max - min) / totalTicks;
    
    const ticks = [];
    for (let i = 0; i <= totalTicks; i++) {
      const angle = startAngle - angleStep * i;
      const tickValue = min + valueStep * i;
      
      // 長刻度
      const outerRadius = radius * 1.02;
      const innerRadius = radius * 0.92;
      
      const outerPoint = {
        x: centerX + outerRadius * Math.cos(angle),
        y: centerY + outerRadius * Math.sin(angle)
      };
      
      const innerPoint = {
        x: centerX + innerRadius * Math.cos(angle),
        y: centerY + innerRadius * Math.sin(angle)
      };
      
      // 標籤位置
      const labelRadius = radius * 0.82;
      const labelPoint = {
        x: centerX + labelRadius * Math.cos(angle),
        y: centerY + labelRadius * Math.sin(angle)
      };
      
      ticks.push({
        outerPoint,
        innerPoint,
        labelPoint,
        value: Math.round(tickValue)
      });
      
      // 增加短刻度 (次要刻度)
      if (i < totalTicks) {
        for (let j = 1; j < 5; j++) {
          const subAngle = angle - angleStep * j / 5;
          const subOuterRadius = radius * 1.02;
          const subInnerRadius = radius * 0.96;
          
          const subOuterPoint = {
            x: centerX + subOuterRadius * Math.cos(subAngle),
            y: centerY + subOuterRadius * Math.sin(subAngle)
          };
          
          const subInnerPoint = {
            x: centerX + subInnerRadius * Math.cos(subAngle),
            y: centerY + subInnerRadius * Math.sin(subAngle)
          };
          
          ticks.push({
            outerPoint: subOuterPoint,
            innerPoint: subInnerPoint,
            isSubTick: true
          });
        }
      }
    }
    
    return ticks;
  };
  
  // 緩動函數
  const easeOutCubic = (x) => {
    return 1 - Math.pow(1 - x, 3);
  };
  
  // 生成顏色梯度段
  const generateArcs = () => {
    const arcs = [];
    let prevValue = min;
    
    segments.forEach((segment, index) => {
      if (index === 0 && segment.value <= min) return;
      
      const segmentStart = Math.max(prevValue, min);
      const segmentEnd = Math.min(segment.value, max);
      
      if (segmentStart < segmentEnd) {
        const startRadian = valueToRadians(segmentStart);
        const endRadian = valueToRadians(segmentEnd);
        
        arcs.push({
          path: describeArc(centerX, centerY, radius, startRadian, endRadian),
          color: segment.color
        });
      }
      
      prevValue = segment.value;
    });
    
    return arcs;
  };
  
  const needlePoint = getNeedlePoint(currentValue);
  const arcs = generateArcs();
  const ticks = generateTicks();
  
  return (
    <div className="flex flex-col items-center justify-center" style={{ 
      background: 'transparent',
      width: width,      // 確保容器寬度足夠
      height: height,    // 確保容器高度足夠
      overflow: 'visible' // 防止內容被裁切
    }}>
      <svg 
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`} 
        style={{ 
          background: 'transparent',
          overflow: 'visible'  // 防止 SVG 內容被裁切
        }}
      >
        {/* 標題文字 */}
        <text
          x={centerX}
          y={centerY - radius * 0.3}
          fontSize={radius * 0.23}
          textAnchor="middle"
          fill="#ffffff"
        >
          {title}
        </text>

        {/* 數值顯示 - 向下移動 */}
        <text
          x={centerX}
          y={centerY + radius * 0.6}  // 從 0.4 改為 0.5
          fontSize={radius * 0.32}
          fontWeight="bold"
          textAnchor="middle"
          fill="#ffffff"
        >
          {Math.round(currentValue)}
        </text>

        {/* 單位顯示 - 向下移動 */}
        <text
          x={centerX}
          y={centerY + radius * 0.8}  // 從 0.6 改為 0.7
          fontSize={radius * 0.2}
          textAnchor="middle"
          fill="#ffffff"
        >
          {unit}
        </text>

        {/* 背景圓弧 */}
        <path
          d={describeArc(centerX, centerY, radius, startAngle, endAngle)}
          fill="none"
          stroke="rgba(240, 240, 240, 0.1)"  // 改為半透明
          strokeWidth={radius * 0.16}
          strokeLinecap="round"
        />
        
        {/* 顏色分段 */}
        {arcs.map((arc, index) => (
          <path
            key={index}
            d={arc.path}
            fill="none"
            stroke={arc.color}
            strokeWidth={radius * 0.16}
            strokeLinecap="round"
          />
        ))}
        
        {/* 刻度和標籤 */}
        {ticks.map((tick, index) => (
          <g key={index}>
            {!tick.isSubTick && (
              <>
                <line
                  x1={tick.outerPoint.x}
                  y1={tick.outerPoint.y}
                  x2={tick.innerPoint.x}
                  y2={tick.innerPoint.y}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
                <text
                  x={tick.labelPoint.x}
                  y={tick.labelPoint.y}
                  fontSize="12"
                  fill="#ffffff"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {tick.value}
                </text>
              </>
            )}
            {tick.isSubTick && (
              <line
                x1={tick.outerPoint.x}
                y1={tick.outerPoint.y}
                x2={tick.innerPoint.x}
                y2={tick.innerPoint.y}
                stroke="#ffffff"
                strokeWidth={1}
              />
            )}
          </g>
        ))}
        
        {/* 指針 */}
        <g>
          {/* 指針陰影 */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.1}
            fill="#333"
            opacity="0.3"
            filter="blur(2px)"
            transform={`translate(2, 2)`}
          />
          
          {/* 指針圓心 */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.1}
            fill="#fff"
            stroke="#ddd"
            strokeWidth="2"
          />
          
          {/* 指針 */}
          <line
            x1={centerX}
            y1={centerY}
            x2={needlePoint.x}
            y2={needlePoint.y}
            stroke="#f44336"
            strokeWidth={radius * 0.04}
            strokeLinecap="round"
          />
          
          {/* 指針中心點 */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.04}
            fill="#f44336"
          />
        </g>
      </svg>
    </div>
  );
};

// 示範用法
const GaugeDemo = () => {
  const [gaugeValue, setGaugeValue] = useState(267);
  
  const handleChange = (e) => {
    setGaugeValue(parseInt(e.target.value, 10));
  };
  
  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-white rounded-lg shadow-lg">
      {/* <h2 className="text-2xl font-bold text-gray-700">270度動態儀表盤</h2> */}
      
      <GaugeChart 
        value={gaugeValue}
        min={0}
        max={400}
        width={400}
        height={300}
        animate={true}
        unit="km/h"
      />
      
      {/* <div className="w-full max-w-md">
        <input
          type="range"
          min="0"
          max="400"
          value={gaugeValue}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>0</span>
          <span>100</span>
          <span>200</span>
          <span>300</span>
          <span>400</span>
        </div>
      </div> */}
    </div>
  );
};

// 直接導出 GaugeChart
export default GaugeChart;