import React from 'react';
import PropTypes from 'prop-types';

// 定義狀態顏色常量
const STATUS_COLORS = {
  N: { // 正常
    fill: '#69db7c',
    stroke: '#2b8a3e',
    duration: 2,
    rotate: true
  },
  A: { // 警告
    fill: '#ffa94d',
    stroke: '#f76707',
    duration: 0.7,
    rotate: true
  },
  E: { // 異常
    fill: '#ff6b6b',
    stroke: '#e03131',
    duration: 0.5,
    rotate: false
  },
  G: { // 停機
    fill: '#999999',
    stroke: '#777777',
    duration: 0,
    rotate: false
  }
};

const WindPowerComp = ({ 
  scale = 50, // 默認50%
  status = 'N', // 默認正常狀態
  rotationDuration = 2, // 默認2秒轉一圈
  fill = '#cccccc' // 添加基礎填充顏色參數
}) => {
  // 獲取當前狀態的顏色和動畫設置
  const statusStyle = STATUS_COLORS[status] || STATUS_COLORS.G;
  
  // 計算實際的旋轉時間
  const actualRotationDuration = statusStyle.rotate ? rotationDuration : 0;

  // 獲取機艙顏色
  const nacelleStyle = STATUS_COLORS[status] || STATUS_COLORS.grey;

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 300 500"
      style={{
        width: `${scale}%`,
        height: `${scale}%`,
        display: 'block',
        margin: '0',
        backgroundColor: 'transparent',
      }}
    >
      {/* 主桿 (上細下粗) */}
      <path 
        d="M103.7 360 L116.3 360 L114 180 L106 180 Z"  // x 和 y 座標都再減少 20
        fill={fill}
        stroke={fill === '#cccccc' ? '#bbbbbb' : fill}
        strokeWidth="0.5"
      />
      
      {/* 葉片組 */}
      <g transform="translate(110, 180)">  // x 座標從 130 改為 110，y 座標從 200 改為 180
        {/* 葉片中心圓 */}
        <circle 
          cx="0" 
          cy="0" 
          r="4" 
          fill={fill}  // 使用外部傳入的填充顏色
          stroke={fill === '#cccccc' ? '#444444' : fill}  // 根據填充顏色調整邊框顏色
          strokeWidth="0.5"
        />
        
        {/* 旋轉的葉片組 */}
        <g id="blades">
          {/* 葉片1 */}
          <path 
            d="M0 0 L-8 -110 C-8 -125, 8 -125, 8 -110 Z" 
            fill={fill}  // 使用外部傳入的填充顏色
            stroke={fill === '#cccccc' ? '#dddddd' : fill}  // 根據填充顏色調整邊框顏色
            strokeWidth="0.5"
          />
          
          {/* 葉片2 */}
          <path 
            d="M0 0 L-8 -110 C-8 -125, 8 -125, 8 -110 Z" 
            fill={fill}  // 使用外部傳入的填充顏色
            stroke={fill === '#cccccc' ? '#dddddd' : fill}  // 根據填充顏色調整邊框顏色
            strokeWidth="0.5" 
            transform="rotate(120 0 0)"
          />
          
          {/* 葉片3 */}
          <path 
            d="M0 0 L-8 -110 C-8 -125, 8 -125, 8 -110 Z" 
            fill={fill}  // 使用外部傳入的填充顏色
            stroke={fill === '#cccccc' ? '#dddddd' : fill}  // 根據填充顏色調整邊框顏色
            strokeWidth="0.5" 
            transform="rotate(240 0 0)"
          />
          
          {/* 旋轉動畫 */}
          <animateTransform 
            attributeName="transform" 
            attributeType="XML" 
            type="rotate" 
            from="0 0 0" 
            to="360 0 0" 
            dur={`${actualRotationDuration}s`}
            repeatCount="indefinite"
          />
        </g>
      </g>

      {/* 發電機艙 */}
      <circle 
        cx="110"  // x 座標從 130 改為 110
        cy="180"  // y 座標從 200 改為 180
        r="7.5" 
        fill={nacelleStyle.fill}
        stroke={nacelleStyle.stroke}
        strokeWidth="0.5"
      >
        {/* 狀態閃爍動畫 */}
        {nacelleStyle.duration > 0 && (
          <animate
            attributeName="fill-opacity"
            values="1;0.3;1"
            dur={`${nacelleStyle.duration}s`}
            repeatCount="indefinite"
          />
        )}
      </circle>
    </svg>
  );
};

// 添加 PropTypes 驗證
WindPowerComp.propTypes = {
  scale: PropTypes.number, // 顯示比例（百分比）
  status: PropTypes.oneOf(['N', 'A', 'E', 'G']), // 設備狀態
  rotationDuration: PropTypes.number, // 正常旋轉一圈所需秒數
  fill: PropTypes.string // 基礎填充顏色
};

export default WindPowerComp;