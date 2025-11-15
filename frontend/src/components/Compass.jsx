import React, { useState, useEffect } from "react";
import '../styles/compass.css';
import { WiStrongWind, WiWindDeg } from "react-icons/wi";

const Compass = ({ direction = 0, windSpeedData = 0, windDirectorData = 19.3405762 }) => {
  const [currentDirection, setCurrentDirection] = useState(direction);
  const [windSpeed, setWindSpeed] = useState(0);
  const [arrowStyle, setArrowStyle] = useState({
    transform: 'rotate(0deg)'
  });

  // 更新指標方向
  const updateArrow = (newDirection) => {
    const formattedDirection = Number(newDirection).toFixed(1);
    setCurrentDirection(formattedDirection);
    setArrowStyle({
      transform: `rotate(${formattedDirection}deg)`
    });
  };

  useEffect(() => {
    // 格式化風速和方向數據
    const formattedWindSpeed = Number(windSpeedData).toFixed(1);
    const formattedDirection = Number(windDirectorData).toFixed(1);

    setWindSpeed(formattedWindSpeed);
    updateArrow(formattedDirection);
  }, [windSpeedData, windDirectorData]);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-end',
      gap: '15px',
      height: '100%',
      justifyContent: 'flex-end'
    }}>
      {/* 指南針部分 */}
      <div style={{ 
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '120px',
        height: '120px'
      }}>
        <div className="compass" style={{ 
          backgroundColor: 'transparent',
          width: '100%',
          height: '100%'
        }}>
          <div className="arrow" style={arrowStyle} />
          <div className="compass-circle" />
        </div>
      </div>

      {/* 數據顯示部分 */}
      <div style={{
        display: 'grid',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '5px',
        minWidth: '120px',
        alignContent: 'end',
        fontSize: '14px',
        color: '#666',
        paddingBottom: '2px',
        marginBottom: '1px'
      }}>
        {/* 風速 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          alignItems: 'center',
          gap: '8px'
        }}>
          <WiStrongWind style={{ 
            fontSize: '24px',
            color: '#1890ff',
            justifySelf: 'center'
          }}/>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '4px',
            justifyContent: 'flex-end'
          }}>
            <span style={{
              fontSize: '24px',
              fontWeight: 'bold',
              minWidth: '60px',
              textAlign: 'right'
            }}>{windSpeed}</span>
            <span style={{
              width: '30px'
            }}>m/s</span>
          </div>
        </div>

        {/* 風向 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          alignItems: 'center',
          gap: '8px'
        }}>
          <WiWindDeg style={{ 
            fontSize: '24px',
            color: '#1890ff',
            justifySelf: 'center'
          }}/>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '4px',
            justifyContent: 'flex-end'
          }}>
            <span style={{
              fontSize: '24px',
              fontWeight: 'bold',
              minWidth: '60px',
              textAlign: 'right'
            }}>{currentDirection}</span>
            <span style={{
              width: '30px'
            }}>°</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compass;

