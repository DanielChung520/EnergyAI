import React, { useState, useEffect, Suspense, lazy, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import WindPowerStation from './WindPowerStation';
import Compass from '../../../components/Compass';
import TemperatureComp from '../../../components/TemperatureComp';
import WeatherComp from '../../../components/WeatherComp';
import Switch from 'react-switch';
import { Tabs, Tab, Box, Slider, IconButton } from '@mui/material';
import WindPowerChart from '../../../components/Charts/WindPowerChart';
import RefreshIcon from '@mui/icons-material/Refresh';
import { GiExpand } from "react-icons/gi";
import WebPageViewer from '../../../components/WebPageViewer';
import { useLocation } from 'react-router-dom';
import { getAlertLevel } from '../../../data/alert';
import WindTurbine from './WindTurbine';

// 使用 React.lazy 延迟加载图表组件
const StaticWindPowerChart = lazy(() => import('../../../components/Charts/StaticWindPowerChart'));

const TIME_MARKS = [
  { value: 0, label: '分', interval: 1, periodType: 'min' },
  { value: 33, label: '時', interval: 10, periodType: 'hr' },
  { value: 66, label: '天', interval: 60, periodType: 'day' },
  { value: 100, label: '月', interval: 720, periodType: 'mon' }
];

// 在组件外部创建静态数据
const createStaticData = () => {
  const data = {
    times: [],
    power: [],
    accumulated: []
  };
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let acc = 0;

  for (let i = 0; i < 24 * 60; i++) {
    const time = new Date(now.getTime() + i * 60000);
    const hour = time.getHours();
    
    let powerValue;
    if (hour >= 6 && hour < 18) {
      const midday = 12;
      const hourDiff = Math.abs(hour - midday);
      powerValue = Math.floor(800 - (hourDiff * hourDiff * 30));
    } else {
      powerValue = 100;
    }
    
    acc += powerValue;
    
    data.times.push(`${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`);
    data.power.push(powerValue);
    data.accumulated.push(acc);
  }
  
  return data;
};

const staticData = createStaticData();

const WindPowerGenerator = ({
  width = "300",
  height = "100vh",
}) => {
  const [temperature, setTemperature] = useState(25);
  const [eStop, setEStop] = useState(false);
  const [reset, setReset] = useState(false);
  const [auto, setAuto] = useState(false);
  const [stop, setStop] = useState(false);
  const [realData, setRealData] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [sliderValue, setSliderValue] = useState(() => {
    const saved = localStorage.getItem('windpower-chart-slider');
    return saved ? JSON.parse(saved) : 0; // 默認為"分"
  });

  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isChartInitialized = useRef(false);
  const timerRef = useRef(null);
  const [chartData, setChartData] = useState({
    times: [],
    power: [],
    accumulated: []
  });

  const [currentTime, setCurrentTime] = useState('00:00');
  const [updateFrequency, setUpdateFrequency] = useState(60); // 初始更新频率为60分钟

  // 添加状态颜色常量
  const STATUS_COLORS = {
    N: 'rgba(76, 175, 80, 0.2)',  // 绿色 50% 透明
    A: 'rgba(255, 165, 0, 0.2)',  // 橙色 50% 透明
    E: 'rgba(255, 0, 0, 0.2)',    // 红色 50% 透明
  };

  // 修改 getStatusColor 函数
  const getStatusColor = (key, value) => {
    // 首先检查是否为 alert.js 中定义的变量
    const alertLevel = getAlertLevel(key, value);
    
    switch (alertLevel) {
      case "red":
        return 'rgba(255, 0, 0, 0.2)';    // 红色警戒
      case "yellow":
        return 'rgba(255, 165, 0, 0.2)';  // 黄色警告
      case "normal":
        return 'rgba(76, 175, 80, 0.2)';  // 绿色正常
      default:
        // 如果不是 alert.js 中定义的变量，使用原来的逻辑
        if (typeof value === 'string') {
          if (value.includes('E')) return 'rgba(255, 0, 0, 0.2)';
          if (value.includes('A')) return 'rgba(255, 165, 0, 0.2)';
        }
        return 'rgba(76, 175, 80, 0.2)';
    }
  };

  // 生成隨機溫度 (15-35)
  const getRandomTemperature = () => {
    return Math.floor(Math.random() * (35 - 15) + 15);
  };

  useEffect(() => {
    // 每1秒更新一次温度
    const interval = setInterval(() => {
      const newTemperature = getRandomTemperature();
      setTemperature(newTemperature);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 獲取位置資訊
  const location = useLocation();
  
  // 初始化設備ID狀態，從URL參數或location.state獲取
  const [deviceId, setDeviceId] = useState(() => {
    // 從 URL 參數獲取
    const params = new URLSearchParams(location.search);
    const urlDeviceId = params.get('deviceId');
    
    // 從 state 獲取
    const stateDeviceId = location.state?.deviceId;
    
    // 優先使用URL參數，其次是state，最後是預設值
    const id = urlDeviceId || stateDeviceId || 'cf21e03b-694a-4ee9-9fdb-772e83e03980';
    
    console.log('WindPowerGenerator 初始化 deviceId:', {
      urlDeviceId,
      stateDeviceId,
      finalId: id
    });
    
    return id;
  });

  // 簡化網路狀態管理
  const [isNetworkError, setIsNetworkError] = useState(false);

  // 修改 fetchRealData
  const fetchRealData = useCallback(async () => {
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
      
      // API 請求成功
      if (response.data?.Info) {
        setRealData(response.data);
        setIsNetworkError(false);
        
        // 如果需要更新 deviceId
        if (response.data.Info.ID && response.data.Info.ID !== deviceId) {
          setDeviceId(response.data.Info.ID);
        }
      } else {
        // 如果返回的數據格式不正確
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('API請求失敗:', error);
      setIsNetworkError(true);
      // 不要在這裡設置 setRealData(null)，保留最後的有效數據
    }
  }, [deviceId]); // 依賴 deviceId

  // 修改 useEffect，分開處理輪詢邏輯
  useEffect(() => {
    let isComponentMounted = true;
    let pollInterval;

    const startPolling = async () => {
      while (isComponentMounted) {
        try {
          await fetchRealData();
        } catch (error) {
          console.error('Polling error:', error);
        }
        // 等待1秒
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    };

    // 開始輪詢
    startPolling();

    // 清理函數
    return () => {
      isComponentMounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [fetchRealData]);

  const formatNumber = (value, decimals = 1) => {
    if (!value) return '0';
    const num = Number(value);
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };
  // 根據天氣狀態生成文字說明
  const getWeatherDescription = (weatherStatus) => {
    switch (weatherStatus) {
      case 'cloudy':
        return '陰天';
      case 'clear':
        return '晴朗';
      case 'cloudy-fog':
        return '陰天有霧';
      case 'fog':
        return '大霧';
      case 'partially-clear-with-rain':
        return '晴時多雲偶陣雨';
      default:
        return '未知天氣';
    }
  };

  // 卡片樣式
  const cardStyle = {
    backgroundColor: 'rgb(255, 255, 255)',
    backdropFilter: 'blur(5px)',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '5px',
    margin: '2px', // 卡片之間的距離為2個單位
  };

  // 減去Header高度
  const adjustedHeight = `calc(${height} - 60px)`; // 使用 calc 函數來計算高度

  // 在 WindPowerGenerator 組件內添加一個新的函數來處理數據格式
  const formatGridData = (data) => {
    if (!data || !data.Info) return [];
    
    // 過濾掉 Name、ID 和 Time
    const entries = Object.entries(data.Info).filter(
      ([key]) => !['Name', 'ID', 'Time'].includes(key)
    );

    // 將數據分成 8 行，每行 7 組
    const rows = [];
    for (let i = 0; i < 8; i++) {
      const row = [];
      for (let j = 0; j < 7; j++) {  // 改為 7 列
        const index = i * 7 + j;      // 改為 7
        if (index < entries.length) {
          row.push(entries[index]);
        } else {
          row.push(['', '']); // 填充空數據
        }
      }
      rows.push(row);
    }
    return rows;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 使用 useMemo 优化 TabPanel 的渲染
  const TabPanel = useMemo(() => React.memo(({ children, value, index }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        style={{
          height: '100%',
          overflow: 'auto',
          display: value === index ? 'block' : 'none' // 使用 display 来控制显示隐藏
        }}
      >
        {children}
      </div>
    );
  }), []);

  // 在組件內添加或修改相關狀態
  const [selectedPeriod, setSelectedPeriod] = useState('min'); // 默認為"分"
  const [powerType, setPowerType] = useState('pac'); // 默認使用併網產電
  const [refreshFlag, setRefreshFlag] = useState(0);

  // 修改處理滑塊變化的函數
  const handleSliderChange = useCallback((_, newValue) => {
    const selectedMark = TIME_MARKS.find(m => m.value === newValue);
    const newPeriodType = selectedMark?.periodType || 'min';
    
    setSliderValue(newValue);
    setSelectedPeriod(newPeriodType);
    localStorage.setItem('windpower-chart-slider', newValue);
    
    // 觸發圖表刷新
    setRefreshFlag(prev => prev + 1);
  }, []);

  // 添加刷新圖表的函數
  const handleRefreshChart = useCallback(() => {
    setRefreshFlag(prev => prev + 1);
  }, []);

  // 在组件内部添加状态
  const [showVentusky, setShowVentusky] = useState(false);
  const [showTurbine, setShowTurbine] = useState(false);
  const [turbineProps, setTurbineProps] = useState(null);

  // 修改滑出样式为居中
  const modalStyles = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: showVentusky 
      ? 'translate(-50%, -50%) scale(1)'
      : 'translate(-50%, -50%) scale(0.8)',
    zIndex: 1300,
    opacity: showVentusky ? 1 : 0,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    width: '80vw',
    maxWidth: '1200px',
    height: '80vh',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
  };

  // 處理顯示風機的函數
  const handleShowTurbine = (props) => {
    setTurbineProps(props);
    setShowTurbine(true);
  };

  // 如果要顯示風機模型，直接返回 WindTurbine 組件
  if (showTurbine && turbineProps) {
    return (
      <div style={{ 
        width: width,
        height: height,
        backgroundColor: 'rgb(3, 39, 67)'
      }}>
        <WindTurbine {...turbineProps} />
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      padding: '5px',
      backgroundColor: 'rgb(3, 39, 67)',
      width: width,
      height: adjustedHeight,
      gap: '5px',
      position: 'relative'  // 添加相對定位
    }}>
      {/* 網路狀態提示 */}
      {isNetworkError && (
        <div style={{
          position: 'absolute',
          top: '15px',
          right: '35%',
          backgroundColor: 'rgba(255, 0, 0, 0.75)',
          color: 'white',
          padding: '4px 12px',
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

      {/* 修改動畫樣式 */}
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

      {/* 上方區域 - 改為自動響應 */}
      <div style={{ 
        flex: '1 1 auto',  // 改為自動響應
        display: 'flex',
        gap: '2px',
        minHeight: '0',    // 允許收縮
        overflow: 'hidden' // 防止溢出
      }}>
        {/* 左側區域，從3份改為3份 */}
        <div style={{ 
          flex: 3,
          position: 'relative', // 添加相對定位容器
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          ...cardStyle
        }}>
          {/* 添加展开图标 */}
          <div 
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              zIndex: 1001,
              cursor: 'pointer',
              color: '#1890ff',
              fontSize: '24px',
              backgroundColor: 'rgba(255,255,255,0.8)',
              borderRadius: '4px',
              padding: '4px'
            }}
            onClick={() => setShowVentusky(!showVentusky)}
          >
            <GiExpand />
          </div>

          {/* 在 Compass 上方添加 WeatherComp 和天氣概況文字 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            width: '100%',
            paddingLeft: '5px',
            justifyContent: 'space-between',
            marginBottom: '-10px'
          }}>
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',  // 改为纵向排列
              alignItems: 'center'      // 居中对齐
            }}>
              <div style={{ transform: 'scale(0.6)', transformOrigin: 'center center' }}>
              <WeatherComp isDaytime={true} weatherStatus="clear" />
              </div>
              <div style={{ 
                fontSize: '18px',  // 缩小字体
                marginTop: '5px',  // 减少顶部间距
                textAlign: 'center',
                width: '100%'
              }}>
                {getWeatherDescription('clear')}
              </div>
            </div>
            {/* 温度计 */}
            <div style={{ 
              transform: 'scale(0.8)',  // 进一步缩小温度计
              marginRight: '10px'       // 减少右侧间距
            }}>
              <TemperatureComp temperature={temperature} min={15} max={35} />
            </div>
          </div>

          {/* 修改Compass為絕對定位 */}
          <div style={{
            position: 'absolute',
            top: 160,   // 可調整此數值控制垂直位置
            left: 70,   // 可調整此數值控制水平位置
            zIndex: 1000,
            
            transform: 'scale(1)' // 可調整縮放比例
          }}>
            <Compass 
              direction={0} 
              windSpeedData={realData?.Info?.FD_WindSpeed_3s || 0}
              windDirectorData={realData?.Info?.FD_WindDirector_1s || 0}
            />
          </div>
        </div>

        {/* 中間區域，從6份改為5份 */}
        <div style={{ 
          flex: 5,  // 从6改为5
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'flex-start',
          ...cardStyle,
          position: 'relative'
        }}>
          {/* 風力發電機組件 */}
          <WindPowerStation 
            data={realData?.Info}
            name={realData?.Info?.Name || ''}
            onShowTurbine={handleShowTurbine}
          />
          {/* 在 WindPowerStation 下方添加四個開關按鈕 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            width: '100%', 
            marginTop: '1px',
            position: 'absolute', // 設置絕對定位
            left: '20px', // 調整絕對位置
            bottom: '20px', // 調整絕對位置
            transform: 'scale(0.8)', // 縮小按鈕
            transformOrigin: 'center' // 設置縮放原點
          }}>
            <label style={{ 
              fontSize: '25px', 
              display: 'flex', 
              flexDirection: 'column-reverse', 
              alignItems: 'center' 
            }}> 
              <Switch 
                checked={eStop}
                onChange={setEStop}
                onColor="#86d3ff"
                onHandleColor="#2693e6"
                handleDiameter={38}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={40}
                width={80}
                offHandleColor="#ccc"
                offColor="#f5f5f5"
                handleStyle={{
                  left: eStop ? 42 : 0,
                }}
              />
              <span>E-Stop</span>
            </label>
            <label style={{ 
              fontSize: '25px', 
              display: 'flex', 
              flexDirection: 'column-reverse', 
              alignItems: 'center' 
            }}>
              <Switch 
                checked={reset}
                onChange={setReset}
                onColor="#86d3ff"
                onHandleColor="#2693e6"
                handleDiameter={38}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={40}
                width={80}
                offHandleColor="#ccc"
                offColor="#f5f5f5"
                handleStyle={{
                  left: reset ? 42 : 0,
                }}
              />
              <span>Reset</span>
            </label>
            <label style={{ 
              fontSize: '25px', 
              display: 'flex', 
              flexDirection: 'column-reverse', 
              alignItems: 'center' 
            }}>
              <Switch 
                checked={auto}
                onChange={setAuto}
                onColor="#86d3ff"
                onHandleColor="#2693e6"
                handleDiameter={38}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={40}
                width={80}
                offHandleColor="#ccc"
                offColor="#f5f5f5"
                handleStyle={{
                  left: auto ? 42 : 0,
                }}
              />
              <span>Auto</span>
            </label>
            <label style={{ 
              fontSize: '25px', 
              display: 'flex', 
              flexDirection: 'column-reverse', 
              alignItems: 'center' 
            }}>
              <Switch 
                checked={stop}
                onChange={setStop}
                onColor="#86d3ff"
                onHandleColor="#2693e6"
                handleDiameter={38}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={40}
                width={80}
                offHandleColor="#ccc"
                offColor="#f5f5f5"
                handleStyle={{
                  left: stop ? 42 : 0,
                }}
              />
              <span>Stop</span>
            </label>
          </div>
        </div>

        {/* 右側區域 */}
        <div style={{ 
          flex: 4,
          display: 'flex', 
          flexDirection: 'column',
          ...cardStyle
        }}>
          <Suspense fallback={<div>Loading...</div>}>
            {realData?.Info ? (
              <div style={{
                height: '100%',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px'
              }}>
                {/* 日期數據 */}
                <div style={{
                  padding: '10px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px'
                }}>
                  <div style={{ 
                    color: '#666', 
                    fontSize: '14px',
                    textAlign: 'left',
                    marginBottom: '8px' 
                  }}>日統計</div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '12px', 
                        color: '#666',
                        textAlign: 'center'  // 添加置中對齊
                      }}>發電量(kWh)</div>
                      <div style={{
                        fontSize: '24px', 
                        fontWeight: 'bold',
                        textAlign: 'center'  // 添加置中對齊
                      }}>{formatNumber(realData.Info.DayEnergy)}</div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '12px', 
                        color: '#666',
                        textAlign: 'center'  // 添加置中對齊
                      }}>收益(元)</div>
                      <div style={{
                        fontSize: '24px', 
                        fontWeight: 'bold',
                        textAlign: 'center'  // 添加置中對齊
                      }}>{formatNumber(realData.Info.DayEnergy * 5.1 )}</div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '12px', 
                        color: '#666',
                        textAlign: 'center'  // 添加置中對齊
                      }}>減碳(kg)</div>
                      <div style={{
                        fontSize: '24px', 
                        fontWeight: 'bold',
                        textAlign: 'center'  // 添加置中對齊
                      }}>{formatNumber((realData.Info.DayEnergy * 0.494) )}</div>
                    </div>
                  </div>
                </div>

                {/* 月統計 */}
                <div style={{
                  padding: '10px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px'
                }}>
                  <div style={{ 
                    color: '#666', 
                    fontSize: '14px',
                    textAlign: 'left',
                    marginBottom: '8px' 
                  }}>月統計</div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '12px', 
                        color: '#666',
                        textAlign: 'center'
                      }}>發電量(kWh)</div>
                      <div style={{
                        fontSize: '24px', 
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>{formatNumber(realData.Info.MonthEnergy)}</div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '12px', 
                        color: '#666',
                        textAlign: 'center'
                      }}>收益(萬)</div>
                      <div style={{
                        fontSize: '24px', 
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>{formatNumber((realData.Info.MonthEnergy * 5.1) / 10000)}</div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '12px', 
                        color: '#666',
                        textAlign: 'center'
                      }}>減碳(噸)</div>
                      <div style={{
                        fontSize: '24px', 
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>{formatNumber((realData.Info.MonthEnergy * 0.494) / 1000)}</div>
                    </div>
                  </div>
                </div>

                {/* 年統計 */}
                <div style={{
                  padding: '10px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px'
                }}>
                  <div style={{ 
                    color: '#666', 
                    fontSize: '14px',
                    textAlign: 'left',
                    marginBottom: '8px' 
                  }}>年統計</div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '12px', 
                        color: '#666',
                        textAlign: 'center'
                      }}>發電量(MWh)</div>
                      <div style={{
                        fontSize: '24px', 
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>{formatNumber(realData.Info.YearEnergy / 1000)}</div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '12px', 
                        color: '#666',
                        textAlign: 'center'
                      }}>收益(萬)</div>
                      <div style={{
                        fontSize: '24px', 
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>{formatNumber((realData.Info.YearEnergy * 5.1) / 10000)}</div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '12px', 
                        color: '#666',
                        textAlign: 'center'
                      }}>減碳(噸)</div>
                      <div style={{
                        fontSize: '24px', 
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>{formatNumber((realData.Info.YearEnergy * 0.494) / 1000)}</div>
                    </div>
                  </div>
                </div>

                {/* 總統計 */}
                <div style={{
                  padding: '10px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px'
                }}>
                  <div style={{ 
                    color: '#666', 
                    fontSize: '14px',
                    textAlign: 'left',
                    marginBottom: '8px' 
                  }}>總統計</div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '12px', 
                        color: '#666',
                        textAlign: 'center'
                      }}>發電量(MWh)</div>
                      <div style={{
                        fontSize: '24px', 
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>{formatNumber(realData.Info.TotalEnergy / 1000)}</div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '12px', 
                        color: '#666',
                        textAlign: 'center'
                      }}>收益(萬)</div>
                      <div style={{
                        fontSize: '24px', 
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>{formatNumber((realData.Info.TotalEnergy * 571) / 10000)}</div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '12px', 
                        color: '#666',
                        textAlign: 'center'
                      }}>減碳(噸)</div>
                      <div style={{
                        fontSize: '24px', 
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>{formatNumber((realData.Info.TotalEnergy * 0.494) / 1000)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                載入中...
              </div>
            )}
          </Suspense>
        </div>
      </div>

      {/* 下方區域 - 固定高度 */}
      <div style={{ 
        height: '470px',   // 固定高度
        flex: '0 0 auto',  // 不伸縮
        display: 'flex', 
        flexDirection: 'column',
        ...cardStyle,
        padding: '4px',
        backgroundColor: 'rgba(240, 242, 245, 0.7)'
      }}>
        {/* Tabs 導航和內容的容器 */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',  // 增加整體圓角
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {/* Tabs 導航和時間顯示的容器 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e8e8e8',
            backgroundColor: 'rgba(250, 250, 250, 0.9)',
            borderTopLeftRadius: '8px',   // 增加上方左側圓角
            borderTopRightRadius: '8px',  // 增加上方右側圓角
          }}>
            {/* Tabs 導航 */}
            <div style={{ flex: 1 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="standard"
                sx={{
                  minHeight: '36px',
                  backgroundColor: 'transparent',
                  '& .MuiTab-root': {
                    minHeight: '36px',
                    fontSize: '13px',
                    padding: '0 12px',
                    textTransform: 'none',
                    color: '#666',
                    minWidth: '100px',     // 減小最小寬度
                    maxWidth: '150px',     // 減小最大寬度
                    '&.Mui-selected': {
                      color: '#1890ff',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      fontWeight: 'bold',
                      borderTopLeftRadius: '8px',   // 選中的 tab 上方圓角
                      borderTopRightRadius: '8px',
                    }
                  },
                  '& .MuiTabs-indicator': {
                    height: '2px',
                    backgroundColor: '#1890ff'
                  }
                }}
              >
                <Tab label="即時數據" />
                <Tab label="統計圖表" />
                <Tab label="合約電價與減碳" />
                <Tab label="警告信息" />
              </Tabs>
            </div>
            
            {/* 時間顯示 */}
            <div style={{
              padding: '0 15px',
              fontSize: '13px',
              color: '#666',
              whiteSpace: 'nowrap',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'transparent'  // 改為透明
            }}>
              時間：{realData?.Info?.Time || '--'}
            </div>
          </div>

          {/* Tab 內容區域 */}
          <div style={{ 
            flex: 1, 
            overflow: 'hidden',
            backgroundColor: 'rgba(255, 255, 255)'  // 調整背景透明度
          }}>
            {/* TabPanel 內容保持不變，但背景改為透明 */}
            <TabPanel value={tabValue} index={0}>
              <div style={{ 
                width: '100%',
                backgroundColor: 'transparent',  // 改為透明
                padding: '10px',

              }}>
                <div style={{ 
                  display: 'grid',
                  gridTemplateRows: 'repeat(8, 0.5fr)',
                  gap: '5px',
                  width: '100%',
                  fontSize: '12px'
                }}>
                  {formatGridData(realData).map((row, rowIndex) => (
                    <div key={rowIndex} style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: '4px',
                      justifyContent: 'start'
                    }}>
                      {row.map(([key, value], colIndex) => (
                        <div key={`${rowIndex}-${colIndex}`} style={{
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          padding: '4px',
                          backgroundColor: getStatusColor(key, value),
                          backdropFilter: 'blur(5px)',
                          minWidth: '80px',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{ 
                            fontSize: '10px',
                            color: '#666',
                            marginBottom: '1px',
                            textAlign: 'left',
                            width: '100%',
                            paddingLeft: '4px'
                          }}>
                            {key}
                          </div>
                          <div style={{ 
                            fontSize: '14px',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            textAlign: 'center',
                            width: '100%'
                          }}>
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </TabPanel>

            {/* 統計圖表 Tab */}
            <TabPanel value={tabValue} index={1}>
              <div style={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  padding: '0 10px',
                  marginBottom: '5px',
                  height: '40px'
                }}>
                  {/* 風機/併網切換 */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    marginRight: '20px'
                  }}>
                    <span style={{ marginRight: '8px', fontSize: '14px' }}>風機產電</span>
                    <Switch
                      checked={powerType === 'pac'}
                      onChange={(checked) => setPowerType(checked ? 'pac' : 'eqp')}
                      onColor="#86d3ff"
                      offColor="#ffa500"
                      checkedIcon={false}
                      uncheckedIcon={false}
                      height={20}
                      width={48}
                    />
                    <span style={{ marginLeft: '8px', fontSize: '14px' }}>併網產電</span>
                  </div>

                  {/* 時間週期選擇器和刷新按鈕 */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                      width: '200px',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '8px',
                      padding: '0 8px',
                      marginRight: '10px'
                    }}>
                      <Slider
                        value={sliderValue}
                        onChange={handleSliderChange}
                        step={null}
                        marks={TIME_MARKS}
                        sx={{
                          '& .MuiSlider-markLabel': {
                            fontSize: '10px',
                            transform: 'translateY(-10px)'
                          },
                          padding: '8px 0'
                        }}
                      />
                    </div>
                    <IconButton onClick={handleRefreshChart} style={{ 
                      padding: '6px',
                      transform: 'scale(0.8)'
                    }}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
                
                {/* 圖表區域 */}
                <div style={{ 
                  flex: 1,
                  height: 'calc(100% - 40px)',
                  position: 'relative',
                  marginTop: '0'
                }}>
                  <WindPowerChart 
                    deviceId={deviceId}
                    periodType={selectedPeriod}
                    updateFrequency={TIME_MARKS.find(m => m.periodType === selectedPeriod)?.interval || 5}
                    refreshFlag={refreshFlag}
                    powerType={powerType}
                  />
                </div>
              </div>
            </TabPanel>

            {/* 合約電價與減碳 Tab */}
            <TabPanel value={tabValue} index={2}>
              <div style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'transparent'  // 改為透明
              }}>
                合約電價與減碳數據開發中...
              </div>
            </TabPanel>

            {/* 警告信息 Tab */}
            <TabPanel value={tabValue} index={3}>
              <div style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'transparent'  // 改為透明
              }}>
                警告信息開發中...
              </div>
            </TabPanel>
          </div>
        </div>
      </div>

      {showVentusky && (
        <>
          <div style={modalStyles}>
            <WebPageViewer 
              url="https://www.ventusky.com/"
              title="Ventusky 氣象地圖"
              onClose={() => setShowVentusky(false)}
            />
          </div>
          
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 1299,
            backdropFilter: 'blur(4px)',
            transition: 'opacity 0.3s',
            opacity: showVentusky ? 1 : 0,
            pointerEvents: showVentusky ? 'auto' : 'none'
          }} onClick={() => setShowVentusky(false)} />
        </>
      )}
    </div>
  );
};

export default WindPowerGenerator;
