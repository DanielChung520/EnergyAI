import React from 'react';
import styled from 'styled-components';

const DirectorContainer = styled.div`
  position: relative;
  width: ${props => props.size || '120px'};
  height: ${props => props.size || '120px'};
`;

const Circle = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  
  &.outer {
    width: 110px;
    height: 110px;
    border: 10px solid #B8C6DB;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  &.inner {
    width: 90px;
    height: 90px;
    background-color: rgba(255, 255, 255, 0.2);
    z-index: 1;
  }
`;

const DirectionMarker = styled.div`
  position: absolute;
  width: ${props => props.isMain ? '2px' : '1px'};
  height: ${props => props.isMain ? '6px' : '4px'};
  background-color: #fff;
  transform-origin: bottom center;
  transform: ${props => `rotate(${props.angle}deg) translateY(-55px)`};
`;

const DirectionText = styled.span`
  position: absolute;
  font-size: ${props => props.isMain ? '12px' : '8px'};
  color: #fff;
  font-weight: ${props => props.isMain ? 'bold' : 'normal'};
  transform-origin: center;
  transform: ${props => `
    rotate(${props.angle}deg)
    translate(0, -65px)
    rotate(-${props.angle}deg)
  `};
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
`;

const Arrow = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 20px;
  background-color: #FF4444;
  transform-origin: center;
  transform: ${props => {
    const angle = props.rotation || 15;
    const radius = 55;
    const startX = radius * Math.sin(angle * Math.PI / 180);
    const startY = -radius * Math.cos(angle * Math.PI / 180);
    return `translate(calc(${startX}px - 50%), calc(${startY}px - 50%)) rotate(${angle}deg)`;
  }};
  z-index: 3;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 8px solid #FF4444;
  }
`;

const DirectionArrow = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 14px;
  height: 32px;
  background-color: #FFD700;
  clip-path: polygon(50% 0, 100% 100%, 50% 85%, 0 100%);
  transform: ${props => `translate(-50%, -50%) rotate(${props.rotation}deg)`};
  transform-origin: center center;
  z-index: 2;
`;

const DirectorComp = ({ 
  size = 120,           // 組件大小，默認 120px
  innerDirection = 315, // 內部灰色箭頭方向，默認指向西北方
  outerDirection = 15   // 外部紅色箭頭方向，默認 15 度
}) => {
  // 生成 16 個方位的角度和標籤
  const directions = [
    { angle: 0, label: 'N', isMain: true },
    { angle: 22.5, label: 'NNE', isMain: false },
    { angle: 45, label: 'NE', isMain: false },
    { angle: 67.5, label: 'ENE', isMain: false },
    { angle: 90, label: 'E', isMain: true },
    { angle: 112.5, label: 'ESE', isMain: false },
    { angle: 135, label: 'SE', isMain: false },
    { angle: 157.5, label: 'SSE', isMain: false },
    { angle: 180, label: 'S', isMain: true },
    { angle: 202.5, label: 'SSW', isMain: false },
    { angle: 225, label: 'SW', isMain: false },
    { angle: 247.5, label: 'WSW', isMain: false },
    { angle: 270, label: 'W', isMain: true },
    { angle: 292.5, label: 'WNW', isMain: false },
    { angle: 315, label: 'NW', isMain: false },
    { angle: 337.5, label: 'NNW', isMain: false }
  ];

  return (
    <DirectorContainer>
      <Circle className="outer">
        {directions.map((dir, index) => (
          <DirectionMarker 
            key={`marker-${index}`}
            angle={dir.angle}
            isMain={dir.isMain}
          />
        ))}
        {directions.map((dir, index) => (
          <DirectionText 
            key={`text-${index}`}
            angle={dir.angle}
            isMain={dir.isMain}
          >
            {dir.label}
          </DirectionText>
        ))}
      </Circle>
      <Circle className="inner" />
      <DirectionArrow rotation={innerDirection} />
      <Arrow rotation={outerDirection} />
    </DirectorContainer>
  );
};

// 使用示例：
// <DirectorComp 
//   size={150}           // 設置組件大小為 150px
//   innerDirection={270} // 內部箭頭指向西方
//   outerDirection={90}  // 外部箭頭指向東方
// />

export default DirectorComp;
