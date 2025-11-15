import React, { useEffect, useRef, useState, useCallback } from 'react';
import WindTurbine from '../equipment/WindTurbine';
import styled, { createGlobalStyle } from 'styled-components';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Divider } from '@mui/material';
import DirectorComp from '../equipment/DirectorComp';
import DashboardComp from '../../../components/DashboardComp';

// 添加數字字體的 @import
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Digital+7&display=swap');
`;

// 創建主容器
const Container = styled.div`
  display: flex;
  width: 96vw;
  height: calc(100vh - 60px);
  border: 2px solid #000;
  box-sizing: border-box;
`;

// 左側容器 (60%)
const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 65%;
  height: 100%;
  border-right: 2px solid #333;
  box-sizing: border-box;
`;

// 右側容器 (40%)
const RightSection = styled.div`
  width: 35%;
  height: 100%;
  background-color: rgb(3, 39, 67);  // 改為深藍色天空色
  padding: 10px;
  box-sizing: border-box;
`;

// 左上容器 (60%)
const TopLeftSection = styled.div`
  height: 65%;
  width: 100%;
  position: relative;
  border-bottom: 2px solid #333;
  background-color: #ffffff;
  box-sizing: border-box;
`;

// 左下容器 (40%)
const BottomLeftSection = styled.div`
  height: 35%;
  width: 100%;
  background-color: rgb(3, 39, 67);
  padding: 4px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  gap: 2px;
`;

const BottomLeftMainArea = styled.div`
  flex: 7;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const BottomLeftMainAreaTop = styled.div`
  flex: 3;
  display: flex;
  gap: 2px;
`;

const BottomLeftMainAreaTopLeft = styled.div`
  flex: 1;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px;
`;

const BottomLeftMainAreaTopRight = styled.div`
  flex: 1;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px;
`;

const BottomLeftMainAreaBottom = styled.div`
  flex: 7;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px;
`;

const BottomLeftMiddleArea = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const BottomLeftMiddleAreaTop = styled.div`
  flex: 7;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px;
`;

const BottomLeftMiddleAreaBottom = styled.div`
  flex: 3;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px;
`;

const BottomLeftRightArea = styled.div`
  flex: 1;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px;
`;

// WindTurbine 容器
const WindTurbineContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
`;

// 首先添加一個新的狀態指示燈組件
const StatusIndicator = ({ status, label }) => {
  // 定義狀態對應的顏色
  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return {
          main: '#4CAF50',
          glow: 'rgba(76, 175, 80, 0.6)',
          border: 'rgba(76, 175, 80, 0.8)'
        }; // 綠色
      case 'warning':
        return {
          main: '#FFA500',
          glow: 'rgba(255, 165, 0, 0.6)',
          border: 'rgba(255, 165, 0, 0.8)'
        }; // 橙色
      case 'error':
        return {
          main: '#F44336',
          glow: 'rgba(244, 67, 54, 0.6)',
          border: 'rgba(244, 67, 54, 0.8)'
        }; // 紅色
      default:
        return {
          main: '#9E9E9E',
          glow: 'rgba(158, 158, 158, 0.6)',
          border: 'rgba(158, 158, 158, 0.8)'
        }; // 灰色
    }
  };

  const colors = getStatusColor(status);

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1
    }}>
      <div style={{
        width: '34px',     // 這裡控制指示燈的寬度
        height: '34px',    // 這裡控制指示燈的高度
        borderRadius: '50%',
        backgroundColor: colors.main,
        border: '2px solid',
        borderColor: colors.border,
        boxShadow: `0 0 10px ${colors.glow}, inset 0 0 5px rgba(255,255,255,0.5)`,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '2px',
          left: '2px',
          width: '8px',      // 這裡控制內部高光的寬度
          height: '8px',     // 這裡控制內部高光的高度
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.8)',
          filter: 'blur(1px)'
        }
      }} />
      <Typography sx={{
        color: '#fff',
        fontSize: '0.8rem',  // 這裡控制標籤文字的大小
        opacity: 0.8
      }}>
        {label}
      </Typography>
    </Box>
  );
};

// 修改 DataGroup 組件
const DataGroup = ({ title, children }) => (
  <Box sx={{ 
    mb: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',  // 改為半透明白色
    borderRadius: '8px',
    padding: '5px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  }}>
    <Typography 
      variant="subtitle1" 
      sx={{ 
        color: '#fff',  // 改為白色
        fontWeight: 'bold',
        mb: 1,
        borderBottom: '2px solid',
        borderColor: 'rgba(255, 255, 255, 0.3)',  // 改為半透明白色
        pb: 0.5,
        fontSize: '0.9rem'
      }}
    >
      {title}
    </Typography>
    <Box sx={{ 
      pl: 1,
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0 16px',
      '& > *': {
        minWidth: 0
      }
    }}>
      {children}
    </Box>
  </Box>
);

// 首先添加狀態燈組件
const StatusLight = ({ status }) => {
  // 定義狀態對應的顏色
  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return '#4CAF50'; // 綠色
      case 'warning':
        return '#FFA500'; // 橙色
      case 'error':
        return '#F44336'; // 紅色
      default:
        return '#9E9E9E'; // 灰色
    }
  };

  return (
    <div style={{
      width: '12px',  // 縮小燈號尺寸
      height: '12px',  // 縮小燈號尺寸
      borderRadius: '50%',
      backgroundColor: getStatusColor(status),
      border: '1.5px solid rgba(255, 255, 255, 0.8)',
      boxShadow: `0 0 3px ${getStatusColor(status)}, inset 0 0 3px rgba(0,0,0,0.3)`,
      position: 'relative'
    }} />
  );
};

// 修改 DataItem 組件
const DataItem = ({ label, value, unit = '', showStatus = true, getStatus }) => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'space-between',
    alignItems: 'center',
    py: 0.2,
    borderBottom: '1px dashed rgba(255, 255, 255, 0.1)',  // 改為半透明白色
    height: '22px',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)'  // 改為更淡的懸停效果
    }
  }}>
    <Typography 
      variant="body2" 
      sx={{ 
        flex: '0 0 40%',
        fontSize: '0.8rem',
        pr: 1,
        color: 'rgba(255, 255, 255, 0.7)'  // 改為半透明白色
      }}
    >
      {label}
    </Typography>
    <Typography 
      variant="body2" 
      sx={{ 
        flex: '0 0 45%', 
        textAlign: 'right',
        fontSize: '0.8rem',
        fontFamily: 'monospace',
        pl: 1,
        color: 'rgba(255, 255, 255, 0.9)'  // 改為接近白色
      }}
    >
      {value !== undefined && value !== null ? `${value}${unit}` : '- -'}
    </Typography>
    {showStatus && (
      <Box sx={{ 
        flex: '0 0 10%', 
        display: 'flex', 
        justifyContent: 'flex-end',
        pl: 2
      }}>
        <StatusLight status={getStatus ? getStatus(value) : 'inactive'} />
      </Box>
    )}
  </Box>
);

// 添加新的按鈕樣式組件
const ControlButton = styled.button`
  width: 90%;
  margin: 4px auto;
  padding: 6px 12px;
  border-radius: 20px;
  border: none;
  background: ${props => props.active ? 
    'linear-gradient(180deg, #4CAF50 0%, #45a049 100%)' : 
    'linear-gradient(180deg, #ffffff 0%, #e0e0e0 100%)'};
  color: ${props => props.active ? '#fff' : '#666'};
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;
  box-shadow: ${props => props.active ?
    '0 2px 4px rgba(76, 175, 80, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4)' :
    '0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.8)'};

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.active ?
      '0 4px 8px rgba(76, 175, 80, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4)' :
      '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.8)'};
  }

  &:active {
    transform: translateY(1px);
    box-shadow: ${props => props.active ?
      '0 1px 2px rgba(76, 175, 80, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4)' :
      '0 1px 2px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.8)'};
  }
`;

const WindSite3D = () => {
  const location = useLocation();
  
  const deviceId = location.state?.deviceId || '';
  const deviceName = location.state?.deviceName || '風機狀態監控';
  const [realData, setRealData] = useState(null);
  const [isNetworkError, setIsNetworkError] = useState(false);

  const [turbineOptions, setTurbineOptions] = useState({
    rpm: 30,
    status: 'normal',
    direction: 10,
    rotationDirection: 1,
    pitchAngle: 60,
    inverterStatus: 'normal',
    dcStatus: 'normal',
    acStatus: 'normal'
  });

  const [activeButtons, setActiveButtons] = useState({
    emergencyStop: false,
    reset: false,
    auto: false,
    shutdown: false,
    clockwiseYaw: false,
    counterclockwiseYaw: false
  });

  const fetchRealData = useCallback(async () => {
    if (!deviceId) return;

    try {
      const response = await axios.get('/windpower/Src/WebServiceTest.asmx/GetRealData_TaiWan', {
        params: {
          strid: deviceId,
          account: 'acc_taiwan_accs',
          password: 'gggTTaiwanPswd123'
        },
        headers: {
          'Accept': 'application/json',
        },
        timeout: 5000
      });
      
      // 添加日誌來檢查 API 返回的數據結構
      console.log('API Response:', response.data);

      // 檢查數據結構並相應處理
      const data = response.data.d ? JSON.parse(response.data.d) : response.data;
      
      if (data?.Info) {

        setRealData(data);
        setIsNetworkError(false);
        
        setTurbineOptions(prev => ({
          ...prev,
          rpm: data.Info.FD_WGrpm || 30,
          status: data.Info.IW_SystemAlarmStatus === 3 ? 'error' : 
                 data.Info.IW_SystemAlarmStatus === 2 ? 'alert' : 'normal',
          direction: data.Info.FD_WindDirector_1s || 0,
          inverterStatus: data.Info.FD_InverterStatus || 'normal',
          dcStatus: data.Info.FD_DCStatus || 'normal',
          acStatus: data.Info.FD_ACStatus || 'normal'
        }));
      } else {
        console.error('Invalid data structure:', data);
        setIsNetworkError(true);
      }
    } catch (error) {
      console.error('API請求失敗:', error);
      setIsNetworkError(true);
    }
  }, [deviceId]);

  useEffect(() => {
    let isComponentMounted = true;

    const startPolling = async () => {
      while (isComponentMounted) {
        try {
          await fetchRealData();
        } catch (error) {
          console.error('Polling error:', error);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    };

    startPolling();

    return () => {
      isComponentMounted = false;
    };
  }, [fetchRealData]);

  const updateTurbineOptions = (newOptions) => {
    setTurbineOptions(prev => ({ ...prev, ...newOptions }));
  };

  // 添加各種參數的狀態判斷函數
  const getWindSpeedStatus = (value) => {
    if (value === undefined || value === null) return 'inactive';
    if (value > 25) return 'error';
    if (value > 15) return 'warning';
    if (value > 0) return 'normal';
    return 'inactive';
  };

  const getTemperatureStatus = (value) => {
    if (value === undefined || value === null) return 'inactive';
    if (value > 80) return 'error';
    if (value > 60) return 'warning';
    if (value >= 0) return 'normal';
    return 'inactive';
  };

  const getPowerStatus = (value) => {
    if (value === undefined || value === null) return 'inactive';
    if (value > 2000) return 'error';
    if (value > 1500) return 'warning';
    if (value > 0) return 'normal';
    return 'inactive';
  };

  const getVoltageStatus = (value) => {
    if (value === undefined || value === null) return 'inactive';
    if (value > 440 || value < 380) return 'error';
    if (value > 430 || value < 390) return 'warning';
    return 'normal';
  };

  // 在渲染部分添加數據檢查日誌
  useEffect(() => {
    console.log('Current realData:', realData);
  }, [realData]);

  useEffect(() => {
    if (realData?.Info) {
      console.log('更新後的機艙數據:', {
        機艙角度: realData.Info.IW_NaceDirAngle,
        偏航目標角度: realData.Info.FD_YawAimAngle
      });
    }
  }, [realData]);

  const handleButtonClick = (buttonName) => {
    setActiveButtons(prev => ({
      ...prev,
      [buttonName]: !prev[buttonName]
    }));
  };

  return (
    <Container>
      <LeftSection>
        <TopLeftSection>
          <WindTurbineContainer>
            <WindTurbine 
              {...turbineOptions}
              name={deviceName}
            />
          </WindTurbineContainer>
          {isNetworkError && (
            <div style={{
              position: 'absolute',
              top: '5px',
              right: '35%',
              backgroundColor: 'rgba(255, 0, 0, 0.75)',
              color: 'white',
              padding: '4px 2px',
              borderRadius: '16px',
              fontSize: '12px',
              zIndex: 1000,
              animation: 'pulse 1.5s infinite',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(2px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <span style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                backgroundColor: 'white',
                borderRadius: '50%',
                animation: 'blink 1s infinite'
              }}></span>
              網路連接不穩定
            </div>
          )}
        </TopLeftSection>
        <BottomLeftSection>
          <BottomLeftMainArea style={{ flex: 7 }}>
            <BottomLeftMainAreaTop>
              <BottomLeftMainAreaTopLeft>
                <Typography variant="subtitle2" sx={{ 
                  color: '#fff',
                  fontWeight: 'bold',
                  mb: 1,
                  fontSize: '0.8rem'
                }}>
                  每秒風速
                </Typography>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  mt: 1
                }}>
                  <Typography sx={{ 
                    fontFamily: 'Digital-7, monospace',
                    fontSize: '3.5rem',
                    lineHeight: 1,
                    color: '#fff',
                    textShadow: '0 0 10px rgba(255,255,255,0.5)'
                  }}>
                    {realData?.Info?.FD_WindSpeed_3s?.toFixed(2) || '- -'}
                  </Typography>
                  <Typography sx={{ 
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.7)',
                    mb: 0.8,
                    ml: 0.5
                  }}>
                    m/s
                  </Typography>
                </Box>
              </BottomLeftMainAreaTopLeft>
              <BottomLeftMainAreaTopRight>
                <Typography variant="subtitle2" sx={{ 
                  color: '#fff',
                  fontWeight: 'bold',
                  mb: 1,
                  fontSize: '0.8rem'
                }}>
                  輸出功率
                </Typography>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  mt: 1
                }}>
                  <Typography sx={{ 
                    fontFamily: 'Digital-7, monospace',
                    fontSize: '3.5rem',
                    lineHeight: 1,
                    color: '#fff',
                    textShadow: '0 0 10px rgba(255,255,255,0.5)'
                  }}>
                    {realData?.Info?.FD_OutputPower?.toFixed(1) || '- -'}
                  </Typography>
                  <Typography sx={{ 
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.7)',
                    mb: 0.8,
                    ml: 0.5
                  }}>
                    kW
                  </Typography>
                </Box>
              </BottomLeftMainAreaTopRight>
            </BottomLeftMainAreaTop>
            <BottomLeftMainAreaBottom>
              <Typography variant="subtitle2" sx={{ 
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                mb: 1
              }}>
                電壓/電流/轉速
              </Typography>
              <Box sx={{
                position: 'relative',
                height: 'calc(100% - 25px)',
                overflow: 'hidden',
                
              }}>
                {/* 第一個 DashboardComp - 電壓 */}
                <Box sx={{ 
                  marginLeft: '10px',
                  position: 'absolute',
                  left: '0%',
                  top: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transform: 'scale(0.55)',
                  transformOrigin: 'left top',
                  width: '400px',    // 增加容器寬度從 350px 到 400px
                  height: '300px',   // 保持容器高度
                  overflow: 'visible' // 防止內容被裁切
                }}>
                  <DashboardComp
                    min={0}
                    max={450}
                    title="電壓"
                    value={realData?.Info?.FD_WGLoadVdc || 0}
                    unit="V"
                    width={400}     // 增加儀錶盤寬度從 300 到 400
                    height={300}    // 保持儀錶盤高度
                    segments={[    
                      { value: 80, color: '#e0e0e0' },
                      { value: 250, color: '#bdbdbd' },
                      { value: 410, color: '#66bb6a' },
                      { value: 420, color: '#ffab40' },
                      { value: 450, color: '#ff5252' }
                    ]}
                    animationDuration={500}
                  />
                </Box>

                {/* 第二個 DashboardComp - 電流 */}
                <Box sx={{ 
                  marginLeft : '10px',
                  position: 'absolute',
                  left: '33%',
                  top: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transform: 'scale(0.55)',
                  transformOrigin: 'left top'
                }}>
                  <DashboardComp
                    min={0}
                    max={160}
                    title="電流"
                    value={realData?.Info?.FD_WGLoadIdc || 0}
                    unit="A"
                    width={400}
                    height={300}
                    segments={[    
                      { value: 60, color: '#e0e0e0' },    // 淺灰色 0-60
                      { value: 100, color: '#66bb6a' },   // 綠色 60-100
                      { value: 120, color: '#ffab40' },   // 橙色 100-120
                      { value: 160, color: '#ff5252' }    // 紅色 120-160
                    ]}
                    animationDuration={500}
                  />
                </Box>

                {/* 第三個 DashboardComp - 轉速 */}
                <Box sx={{ 
                  marginLeft : '10px',
                  position: 'absolute',
                  left: '66%',
                  top: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transform: 'scale(0.55)',
                  transformOrigin: 'left top'
                }}>
                  <DashboardComp
                    min={0}
                    max={85}
                    title="轉速"
                    value={realData?.Info?.FD_WGrpm || 0}
                    unit="rpm"
                    width={400}
                    height={300}
                    segments={[    
                      { value: 50, color: '#66bb6a' },   // 綠色 0-50
                      { value: 65, color: '#ffab40' },   // 橙色 50-65
                      { value: 85, color: '#ff5252' }    // 紅色 65-85
                    ]}
                    animationDuration={500}
                  />
                </Box>
              </Box>
            </BottomLeftMainAreaBottom>
          </BottomLeftMainArea>
          <BottomLeftMiddleArea style={{ flex: 2 }}>
            <BottomLeftMiddleAreaTop>
              <Typography variant="subtitle2" sx={{ 
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                mb: 1
              }}>
                機艙
              </Typography>
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100% - 30px)',
                transform: 'scale(1.2)',
                transformOrigin: 'center'
              }}>
                {/* 添加日誌輸出 */}
                {console.log('機艙角度:', realData?.Info?.IW_NaceDirAngle)}
                {console.log('偏航目標角度:', realData?.Info?.FD_YawAimAngle)}
                
                <DirectorComp 
                  innerDirection={Number(realData?.Info?.IW_NaceDirAngle) || 315}
                  outerDirection={Number(realData?.Info?.FD_WindDirector_1s) || 15}
                />
              </Box>
            </BottomLeftMiddleAreaTop>
            <BottomLeftMiddleAreaBottom>
              <Typography variant="subtitle2" sx={{ 
                color: '#fff',
                fontWeight: 'bold',
                mb: 1,
                fontSize: '0.8rem'
              }}>
                指示燈
              </Typography>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                mt: 1
              }}>
                <StatusIndicator 
                  status={realData?.Info?.IW_SystemCurrentRunMode === 1 ? 'normal' : 'inactive'} 
                  label="運行"
                />
                <StatusIndicator 
                  status={realData?.Info?.IW_SystemAlarmStatus === 0 ? 'normal' : 
                         realData?.Info?.IW_SystemAlarmStatus === 2 ? 'warning' : 
                         realData?.Info?.IW_SystemAlarmStatus === 3 ? 'error' : 'inactive'} 
                  label="報警"
                />
                <StatusIndicator 
                  status={isNetworkError ? 'error' : 'normal'} 
                  label="通訊"
                />
              </Box>
            </BottomLeftMiddleAreaBottom>
          </BottomLeftMiddleArea>
          <BottomLeftRightArea style={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ 
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              mb: 1
            }}>
              操作
            </Typography>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              height: 'calc(100% - 30px)',
              overflowY: 'auto'
            }}>
              <ControlButton
                active={activeButtons.emergencyStop}
                onClick={() => handleButtonClick('emergencyStop')}
              >
                急停
              </ControlButton>
              <ControlButton
                active={activeButtons.reset}
                onClick={() => handleButtonClick('reset')}
              >
                復位
              </ControlButton>
              <ControlButton
                active={activeButtons.auto}
                onClick={() => handleButtonClick('auto')}
              >
                自動
              </ControlButton>
              <ControlButton
                active={activeButtons.shutdown}
                onClick={() => handleButtonClick('shutdown')}
              >
                停機
              </ControlButton>
              <ControlButton
                active={activeButtons.clockwiseYaw}
                onClick={() => handleButtonClick('clockwiseYaw')}
              >
                順偏航
              </ControlButton>
              <ControlButton
                active={activeButtons.counterclockwiseYaw}
                onClick={() => handleButtonClick('counterclockwiseYaw')}
              >
                逆偏航
              </ControlButton>
            </Box>
          </BottomLeftRightArea>
        </BottomLeftSection>
      </LeftSection>
      <RightSection>
        <Box sx={{ 
          height: '100%', 
          overflow: 'auto',
          px: 0,
          py: 0,
          '&::-webkit-scrollbar': {
            width: '2px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0,0,0,0.05)',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(0,0,0,0.3)'
            }
          }
        }}>
          <Typography variant="h6" sx={{ 
            color: '#fff',  // 改為白色
            fontWeight: 'bold'
          }}>
            設備即時資訊
          </Typography>
          
          {realData?.Info ? (
            <>
              <DataGroup title="風速相關">
                <DataItem 
                  label="3秒平均風速" 
                  value={realData.Info.FD_WindSpeed_3s} 
                  unit=" m/s"
                  getStatus={getWindSpeedStatus}
                />
                <DataItem 
                  label="5分鐘平均風速" 
                  value={realData.Info.FD_WindSpeed_5min}
                  unit=" m/s"
                  getStatus={getWindSpeedStatus}
                />

                <DataItem 
                  label="1秒平均風向" 
                  value={realData.Info.FD_WindDirector_1s}
                  unit="°"
                  getStatus={getWindSpeedStatus}
                />
                <DataItem 
                  label="10分平均風向" 
                  value={realData.Info.FD_WindDirector_10min}
                  unit="°"
                  getStatus={getWindSpeedStatus}
                />
              </DataGroup>

              <DataGroup title="電氣參數">
                <DataItem 
                  label="直流電壓" 
                  value={realData.Info.FD_WGLoadVdc}
                  unit=" V"
                  getStatus={getVoltageStatus}
                />
                <DataItem 
                  label="直流電流" 
                  value={realData.Info.FD_WGLoadIdc}
                  unit=" A"
                  getStatus={getPowerStatus}
                />
                <DataItem 
                  label="直流輸出功率" 
                  value={realData.Info.FD_OutputPower}
                  unit=" kW"
                  getStatus={getPowerStatus}
                />

              </DataGroup>

              <DataGroup title="機械參數">
                <DataItem 
                  label="風輪轉速" 
                  value={realData.Info.FD_WGrpm}
                  unit=" rpm"
                  getStatus={getWindSpeedStatus}
                />
                <DataItem 
                  label="風輪轉矩" 
                  value={realData.Info.RotorTorque}
                  unit=" N·m"
                  getStatus={getPowerStatus}
                />
                <DataItem 
                  label="泄荷动作电压" 
                  value={realData.Info.FD_DPVdc}
                  unit=" V"
                  getStatus={getVoltageStatus}
                />
                <DataItem 
                  label="偏航方向" 
                  value={realData.Info.IW_AutoYawDirection}
                  unit="  "
                  getStatus={getVoltageStatus}
                />
                <DataItem 
                  label="解纜方向" 
                  value={realData.Info.IW_StopAntiTwistCableDir}
                  unit="  "
                  getStatus={getVoltageStatus}
                />
                <DataItem 
                  label="偏航目標角度" 
                  value={realData.Info.FD_YawAimAngle}
                  unit=" °"
                  getStatus={getVoltageStatus}
                />
                <DataItem 
                  label="偏航已走角度" 
                  value={realData.Info.FD_YawPassedAngle}
                  unit=" °"
                  getStatus={getVoltageStatus}
                />
                <DataItem 
                  label="當前絞攬角度" 
                  value={realData.Info.IW_YawTwistCableAngle}
                  unit=" °"
                  getStatus={getVoltageStatus}
                />
                <DataItem 
                  label="葉片當前槳距角" 
                  value={realData.Info.FD_BladeCurPitchRealAngle}
                  unit=" °"
                  getStatus={getVoltageStatus}
                />
              </DataGroup>

              <DataGroup title="溫度監測">
                <DataItem 
                  label="泄荷器溫度" 
                  value={realData.Info.FD_TemperatureW}
                  unit="°C"
                  getStatus={getTemperatureStatus}
                />
                <DataItem 
                  label="發電機溫度U相" 
                  value={realData.Info.FD_TemperatureU}
                  unit="°C"
                  getStatus={getTemperatureStatus}
                />
                <DataItem 
                  label="發電機溫度V相" 
                  value={realData.Info.FD_TemperatureV}
                  unit="°C"
                  getStatus={getTemperatureStatus}
                />
                <DataItem 
                  label="機艙溫度" 
                  value={realData.Info.FD_NaceTemp}
                  unit="°C"
                  getStatus={getTemperatureStatus}
                />
              </DataGroup>

              <DataGroup title="系統狀態">
                <DataItem 
                  label="機艙角度" 
                  value={realData.Info.IW_NaceDirAngle}
                  unit="°"
                  getStatus={getWindSpeedStatus}
                />
                <DataItem 
                  label="控制模式" 
                  value={realData.Info.IW_SystemCurrentCtrlMode}
                  getStatus={getPowerStatus}
                />
                <DataItem 
                  label="運行模式" 
                  value={realData.Info.IW_SystemCurrentRunMode}
                  getStatus={getPowerStatus}
                />
                <DataItem 
                  label="報警狀態" 
                  value={realData.Info.IW_SystemAlarmStatus}
                  getStatus={getPowerStatus}
                />
              </DataGroup>

              <DataGroup title="發電量統計">
                <DataItem 
                  label="日發電量" 
                  value={realData.Info.DayEnergy}
                  unit=" kWh"
                  getStatus={getPowerStatus}
                />
                <DataItem 
                  label="月發電量" 
                  value={realData.Info.MonthEnergy}
                  unit=" kWh"
                  getStatus={getPowerStatus}
                />
                <DataItem 
                  label="年發電量" 
                  value={realData.Info.YearEnergy}
                  unit=" kWh"
                  getStatus={getPowerStatus}
                />
                <DataItem 
                  label="總發電量" 
                  value={realData.Info.TotalEnergy}
                  unit=" kWh"
                  getStatus={getPowerStatus}
                />
              </DataGroup>

              <DataGroup title="電網參數">
                <DataItem 
                  label="電網頻率" 
                  value={realData.Info.GridFeq}
                  unit=" Hz"
                  getStatus={getVoltageStatus}
                />
                <DataItem 
                  label="功率因數" 
                  value={realData.Info.cosFai}
                  getStatus={getPowerStatus}
                />
                <DataItem 
                  label="U相電壓" 
                  value={realData.Info.UgAB}
                  unit=" V"
                  getStatus={getVoltageStatus}
                />
                <DataItem 
                  label="V相電壓" 
                  value={realData.Info.UgBC}
                  unit=" V"
                  getStatus={getVoltageStatus}
                />
                <DataItem 
                  label="W相電壓" 
                  value={realData.Info.UgCA}
                  unit=" V"
                  getStatus={getVoltageStatus}
                />
                <DataItem 
                  label="A相輸出電流" 
                  value={realData.Info.IoutA}
                  unit=" A"
                  getStatus={getPowerStatus}
                />
                <DataItem 
                  label="B相輸出電流" 
                  value={realData.Info.IoutB}
                  unit=" A"
                  getStatus={getPowerStatus}
                />
                <DataItem 
                  label="C相輸出電流" 
                  value={realData.Info.IoutC}
                  unit=" A"
                  getStatus={getPowerStatus}
                />
              </DataGroup>

              <DataGroup title="運行時間">
                <DataItem 
                  label="運行天數" 
                  value={realData.Info.RunningDays}
                  unit=" 天"
                />
                <DataItem 
                  label="運行小時" 
                  value={realData.Info.RunningHour}
                  unit=" 時"
                />
                <DataItem 
                  label="運行分鐘" 
                  value={realData.Info.RunningMinute}
                  unit=" 分"
                />
                <DataItem 
                  label="運行秒數" 
                  value={realData.Info.RunningSecond}
                  unit=" 秒"
                />
              </DataGroup>
            </>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '100%'
            }}>
              <Typography color="text.secondary">
                {isNetworkError ? '網路連接不穩定' : '加載數據中...'}
              </Typography>
            </Box>
          )}
        </Box>
      </RightSection>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 0.9; }
          }
          @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0.3; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Container>
  );
};

export default WindSite3D;
