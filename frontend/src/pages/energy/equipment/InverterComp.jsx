import React, { useEffect, useState } from 'react';

const STATUS_COLORS = {
  N: '#4CAF50',  // 綠色（正常）
  X: '#808080',  // 灰色（停機）
  A: '#FFA500',  // 橘色（警告）
  E: '#FF0000'   // 紅色（異常）
};

const InverterComp = ({ 
  width = "200", 
  height = "200", 
  fill = "#4B4B7B",
  lightningStatus = 'N',    // 閃電狀態
  warningStatus = 'X',      // 感歎號狀態
  acStatus = 'N',          // 交流電狀態
  dcStatus = 'N'           // 直流電狀態
}) => {
  const [visibilities, setVisibilities] = useState({
    lightning: true,
    warning: true,
    ac: true,
    dc: true
  });

  useEffect(() => {
    const timeouts = {};
    const INTERVAL_OFF = 100; // 統一的間隔時間 0.1秒

    const blink = (key, onDuration) => {
      // 開始亮
      setVisibilities(prev => ({ ...prev, [key]: true }));
      
      // 設置滅的timeout
      const offTimeout = setTimeout(() => {
        setVisibilities(prev => ({ ...prev, [key]: false }));
        
        // 設置下一次亮的timeout
        const onTimeout = setTimeout(() => {
          blink(key, onDuration);
        }, INTERVAL_OFF);
        
        timeouts[`${key}_on`] = onTimeout;
      }, onDuration);
      
      timeouts[`${key}_off`] = offTimeout;
    };

    const updateVisibility = (key, status) => {
      if (status === 'N') {
        // 正常狀態：3秒亮，0.1秒滅
        blink(key, 3000);
      } else if (status === 'A') {
        // 警告狀態：1秒亮，0.1秒滅
        blink(key, 1000);
      } else if (status === 'E') {
        // 異常狀態：0.7秒亮，0.1秒滅
        blink(key, 700);
      } else {
        // X 狀態：常亮
        setVisibilities(prev => ({
          ...prev,
          [key]: true
        }));
      }
    };

    // 更新每個元素的可見性
    updateVisibility('lightning', lightningStatus);
    updateVisibility('warning', warningStatus);
    updateVisibility('ac', acStatus);
    updateVisibility('dc', dcStatus);

    return () => {
      // 清理所有timeouts
      Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, [lightningStatus, warningStatus, acStatus, dcStatus]);

  const getColor = (status, key) => {
    return visibilities[key] ? STATUS_COLORS[status] : 'transparent';
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 主体矩形 */}
      <rect x="20" y="20" width="100" height="160" fill={fill} />
      
      {/* 閃電圖形 */}
      <path 
        d="M72,40 L60,60 L68,60 L62,80 L80,55 L69,55 Z" 
        fill={getColor(lightningStatus, 'lightning')}
      />
      
      <line x1="20" y1="100" x2="120" y2="100" stroke="white" strokeWidth="2" />
      
      {/* 感歎號 */}
      <path 
        d="M70,115 
           Q75,115 75,120
           L75,137
           Q75,142 70,142
           Q65,142 65,137
           L65,120
           Q65,115 70,115
           Z" 
        fill={getColor(warningStatus, 'warning')}
      />
      <circle cx="70" cy="155" r="6" fill={getColor(warningStatus, 'warning')} />
      
      {/* 右侧两个矩形 */}
      <rect x="122" y="20" width="35" height="160" fill={fill} />
      
      {/* DC符號 */}
      <line x1="128" y1="100" x2="148" y2="100" stroke={getColor(dcStatus, 'dc')} strokeWidth="2" />
      <line x1="128" y1="105" x2="148" y2="105" stroke={getColor(dcStatus, 'dc')} strokeWidth="2" strokeDasharray="2,2" />
      <text x="128" y="95" fill={getColor(dcStatus, 'dc')} fontSize="14" fontFamily="Arial" fontWeight="bold">
        DC
      </text>
      
      <rect x="159" y="20" width="35" height="160" fill={fill} />
      
      {/* AC符號 */}
      <text x="167" y="95" fill={getColor(acStatus, 'ac')} fontSize="14" fontFamily="Arial" fontWeight="bold">
        AC
      </text>
      <line x1="165" y1="100" x2="185" y2="100" stroke={getColor(acStatus, 'ac')} strokeWidth="2" />
      <path 
        d="M165,105 Q170,102 172.5,105 Q175,108 177.5,105 Q180,102 182.5,105 Q185,108 185,105" 
        stroke={getColor(acStatus, 'ac')} 
        strokeWidth="2" 
        fill="none" 
      />
    </svg>
  );
};

export default InverterComp;
