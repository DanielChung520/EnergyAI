import React, { useEffect, useState } from 'react';

const STATUS_COLORS = {
  N: '#4CAF50',  // 綠色（正常）
  A: '#FFA500',  // 橘色（警告）
  E: '#FF0000'   // 紅色（異常）
};

const TowerComp = ({ 
  width = "100%", 
  height = "100%", 
  fill = "#666666",     // 改為更明顯的顏色
  scale = 1,
  upperStatus = 'N',
  lowerStatus = 'N',
  status = 'N'          // 新增整體狀態控制
}) => {
  const [visibilities, setVisibilities] = useState({
    upper: true,
    lower: true
  });

  // 使用整體狀態控制兩個橫桿
  const effectiveUpperStatus = status || upperStatus;
  const effectiveLowerStatus = status || lowerStatus;

  useEffect(() => {
    const timeouts = {};
    const INTERVAL_OFF = 100; // 統一的間隔時間 0.1秒

    const blink = (key, status) => {
      // 根據狀態設置亮的持續時間
      const getDuration = (status) => {
        switch(status) {
          case 'N': return 2000;  // 2秒
          case 'A': return 700;   // 0.7秒
          case 'E': return 500;   // 0.5秒
          default: return 2000;
        }
      };

      // 開始亮
      setVisibilities(prev => ({ ...prev, [key]: true }));
      
      // 設置滅的timeout
      const offTimeout = setTimeout(() => {
        setVisibilities(prev => ({ ...prev, [key]: false }));
        
        // 設置下一次亮的timeout
        const onTimeout = setTimeout(() => {
          blink(key, status);
        }, INTERVAL_OFF);
        
        timeouts[`${key}_on`] = onTimeout;
      }, getDuration(status));
      
      timeouts[`${key}_off`] = offTimeout;
    };

    // 更新每個橫桿的狀態
    blink('upper', effectiveUpperStatus);
    blink('lower', effectiveLowerStatus);

    return () => {
      // 清理所有timeouts
      Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, [effectiveUpperStatus, effectiveLowerStatus]);

  const getColor = (status, key) => {
    return visibilities[key] ? STATUS_COLORS[status] : 'transparent';
  };

  // 根據比例調整位置
  const scaleValue = (value) => value * scale;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}  // 確保 SVG 正確顯示
    >
      {/* 底座 */}
      <rect 
        x={scaleValue(70)} 
        y={scaleValue(180)} 
        width={scaleValue(60)} 
        height={scaleValue(10)} 
        fill={fill} 
      />
      
      {/* 左側橫桿 */}
      <g>
        {/* 上層 */}
        <line 
          x1={scaleValue(60)} 
          y1={scaleValue(40)} 
          x2={scaleValue(140)} 
          y2={scaleValue(40)} 
          stroke={getColor(effectiveUpperStatus, 'upper')} 
          strokeWidth={scaleValue(6)} 
        />
        <path 
          d={`M${scaleValue(60)},${scaleValue(37)} 
             L${scaleValue(55)},${scaleValue(45)} 
             L${scaleValue(65)},${scaleValue(45)} Z`} 
          fill={getColor(effectiveUpperStatus, 'upper')} 
        />
        
        {/* 中層 */}
        <line 
          x1={scaleValue(50)} 
          y1={scaleValue(65)} 
          x2={scaleValue(150)} 
          y2={scaleValue(65)} 
          stroke={getColor(effectiveLowerStatus, 'lower')} 
          strokeWidth={scaleValue(6)} 
        />
        <path 
          d={`M${scaleValue(50)},${scaleValue(62)} 
             L${scaleValue(45)},${scaleValue(70)} 
             L${scaleValue(55)},${scaleValue(70)} Z`} 
          fill={getColor(effectiveLowerStatus, 'lower')} 
        />
      </g>
      
      {/* 右側橫桿 */}
      <g>
        {/* 上層 */}
        <path 
          d={`M${scaleValue(140)},${scaleValue(37)} 
             L${scaleValue(145)},${scaleValue(45)} 
             L${scaleValue(135)},${scaleValue(45)} Z`} 
          fill={getColor(effectiveUpperStatus, 'upper')} 
        />
        
        {/* 中層 */}
        <path 
          d={`M${scaleValue(150)},${scaleValue(62)} 
             L${scaleValue(155)},${scaleValue(70)} 
             L${scaleValue(145)},${scaleValue(70)} Z`} 
          fill={getColor(effectiveLowerStatus, 'lower')} 
        />
      </g>

      {/* 主桿（梯形+半圓形頂部） */}
      <path 
        d={`M${scaleValue(95)},${scaleValue(30)} 
           A${scaleValue(5)},${scaleValue(5)} 0 0 1 ${scaleValue(105)},${scaleValue(30)}
           L${scaleValue(107.5)},${scaleValue(180)} 
           L${scaleValue(92.5)},${scaleValue(180)} Z`}
        fill={fill} 
      />
    </svg>
  );
};

export default TowerComp;
