import React, { useState, useEffect, Suspense, lazy, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import WindPowerStation from './WindPowerStation';
import Compass from '../../../components/Compass';
import TemperatureComp from '../../../components/TemperatureComp';
import WeatherComp from '../../../components/WeatherComp';
import { Tabs, Tab, Box, Slider, IconButton, Switch, Typography } from '@mui/material';
import WindPowerChart from '../../../components/Charts/WindPowerChart';
import RefreshIcon from '@mui/icons-material/Refresh';
import { GiExpand, GiWindTurbine } from "react-icons/gi";
import WebPageViewer from '../../../components/WebPageViewer';
import { useLocation } from 'react-router-dom';
import { getAlertLevel } from '../../../data/alert';
import WindTurbine from './WindTurbine';
import { FaBolt } from "react-icons/fa"; // 发电量图标
import { FaMoneyBillWave } from "react-icons/fa"; // 收益图标
import { FaLeaf } from "react-icons/fa"; // 减碳图标
import { processWeatherData } from '@/data/weather';  // 確保路徑正確
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { CircularProgress } from '@mui/material';
import { useDynamicRoute } from '../../../components/DynamicRoute';

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

// 添加天氣狀態中文對照表
const WEATHER_DESCRIPTIONS = {
  'clear sky': '晴天',
  'few clouds': '少雲',
  'scattered clouds': '多雲',
  'broken clouds': '陰天',
  'overcast clouds': '陰天',
  'shower rain': '陣雨',
  'light rain': '小雨',
  'moderate rain': '中雨',
  'heavy rain': '大雨',
  'rain': '雨',
  'thunderstorm': '雷雨',
  'snow': '雪',
  'mist': '薄霧',
  'fog': '霧'
};

const WindPowerGenerator = ({
  width = "300",
  height = "100vh",
}) => {
  const { navigateTo: navigateToWindSite3D } = useDynamicRoute('A.1.5.7');
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
    periods: [],
    powerData: [],
    avgWindSpeedData: [],
    minWindSpeedData: [],
    maxWindSpeedData: []
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
    
    return id;
  });

  // 簡化網路狀態管理
  const [isNetworkError, setIsNetworkError] = useState(false);

  // 在組件內添加 weatherData 狀態
  const [weatherData, setWeatherData] = useState(null);

  // 添加新的狀態
  const [chartPeriod, setChartPeriod] = useState('min');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [chartError, setChartError] = useState(null);

  // 在組件頂部添加狀態
  const [isStatChart, setIsStatChart] = useState(false);

  // 修改 fetchRealData 函數
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
      
      if (response.data?.Info) {
        setRealData(response.data);
        setIsNetworkError(false);
        
        try {
          const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=23.5&lon=121.5&appid=ffc7fea93c88b05ee42c86af26b602a2&units=metric`;
          const weatherResponse = await fetch(weatherUrl);
          if (weatherResponse.ok) {
            const weatherInfo = await weatherResponse.json();
            
            // 處理天氣數據時轉換成中文描述
            const processedData = {
              temperature: Math.round(weatherInfo.main.temp),
              weatherIcon: weatherInfo.weather[0].icon,
              weatherDescription: WEATHER_DESCRIPTIONS[weatherInfo.weather[0].description] || weatherInfo.weather[0].description,
              windSpeed: weatherInfo.wind.speed,
              windDeg: weatherInfo.wind.deg
            };
            
            setWeatherData(processedData);
          }
        } catch (weatherError) {
          console.error('Weather API error:', weatherError);
        }

        if (response.data.Info.ID && response.data.Info.ID !== deviceId) {
          setDeviceId(response.data.Info.ID);
        }
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('API請求失敗:', error);
      setIsNetworkError(true);
    }
  }, [deviceId]);

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

  // 修改 formatNumber 函數，添加一個參數來控制是否顯示小數
  const formatNumber = (value, decimals = 1, showDecimals = true) => {
    if (!value) return '0';
    const num = Number(value);
    return num.toLocaleString('en-US', {
      minimumFractionDigits: showDecimals ? decimals : 0,
      maximumFractionDigits: showDecimals ? decimals : 0
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
  const adjustedHeight = `calc(${height} - 62.5px)`; // 使用 calc 函數來計算高度

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

  // 在組件內添加或修改相關狀態
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
    // 不要在這裡使用任何 Hooks
    // 只處理顯示邏輯
    return (
      <Box>
        {/* 風機動畫的內容 */}
      </Box>
    );
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

  // 修改统计卡片的通用样式
  const statCardStyle = {
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '8px'
  };

  // 修改图标样式
  const iconStyle = {
    fontSize: '24px',
    marginRight: '8px'
  };

  // 修改 fetchChartData 函數
  const fetchChartData = async (deviceId, periodType, selectedDate) => {
    setIsChartLoading(true);
    setChartError(null);
    try {
      let url = isStatChart 
        ? `/api/wind/statistic/${deviceId}/${periodType}` 
        : `/api/wind/${deviceId}/${periodType}`;

      if (selectedDate && !dayjs().isSame(selectedDate, 'day')) {
        url += `?date=${selectedDate.format('YYYY-MM-DD')}`;
        if (isStatChart) {
          url += '&statistic=true';
        }
      } else if (isStatChart) {
        url += '?statistic=true';
      }

      const response = await axios.get(url, {
        headers: {
          'Authorization': 'Bearer wind_test_only_123'
        }
      });

      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        setChartData(data);
      } else {
        setChartData([]);
      }
    } catch (error) {
      console.error('獲取圖表數據失敗:', error);
      setChartError('獲取數據失敗，請稍後重試');
    } finally {
      setIsChartLoading(false);
    }
  };

  // 添加 Switch 變更處理函數
  const handleStatisticChange = (event) => {
    setIsStatChart(event.target.checked);
  };

  // 修改 useEffect，監聽 isStatChart 的變化
  useEffect(() => {
    if (deviceId) {
      fetchChartData(deviceId, chartPeriod, selectedDate);
    }
  }, [deviceId, chartPeriod, selectedDate, isStatChart]); // 添加 isStatChart 到依賴數組

  // 修改圖表配置
  const getChartOption = () => {
    // 確保 chartData 是數組
    if (!Array.isArray(chartData)) {
      return {};
    }

    const periods = chartData.map(item => item.period);
    const windPowerData = chartData.map(item => item.wind_power);
    const gridPowerData = chartData.map(item => item.grid_power);
    const avgWindSpeedData = chartData.map(item => item.avg_wind_speed);
    const minWindSpeedData = chartData.map(item => item.min_wind_speed);
    const maxWindSpeedData = chartData.map(item => item.max_wind_speed);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['風力發電量', '並網發電量', '平均風速', '最小風速', '最大風速']
      },
      xAxis: {
        type: 'category',
        data: periods
      },
      yAxis: [
        {
          type: 'value',
          name: '發電量',
          position: 'left',
          axisLabel: {
            formatter: '{value} kWh'
          }
        },
        {
          type: 'value',
          name: '風速',
          position: 'right',
          axisLabel: {
            formatter: '{value} m/s'
          }
        }
      ],
      series: [
        {
          name: '風力發電量',
          type: 'bar',
          data: windPowerData,
          yAxisIndex: 0
        },
        {
          name: '並網發電量',
          type: 'bar',
          data: gridPowerData,
          yAxisIndex: 0
        },
        {
          name: '平均風速',
          type: 'line',
          yAxisIndex: 1,
          data: avgWindSpeedData,
          lineStyle: {
            type: 'solid'
          }
        },
        {
          name: '最小風速',
          type: 'line',
          yAxisIndex: 1,
          data: minWindSpeedData,
          lineStyle: {
            type: 'dashed'
          }
        },
        {
          name: '最大風速',
          type: 'line',
          yAxisIndex: 1,
          data: maxWindSpeedData,
          lineStyle: {
            type: 'dashed'
          }
        }
      ]
    };
  };

  // 修改導航函數
  const handleNavigateToWindSite3D = () => {
    console.log('按鈕被點擊');
    try {
      console.log('嘗試導航到 WindSite3D (功能編號: A.1.5.7)');
      navigateToWindSite3D({
        state: {
          deviceId: deviceId, // 當前設備的 ID
          deviceName: realData?.Info?.Name || '風機狀態監控' // 當前設備的名稱
        }
      });
      console.log('導航函數已執行');
    } catch (error) {
      console.error('導航過程中發生錯誤:', error);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      padding: '5px',
      backgroundColor: 'rgb(3, 39, 67)',
      width: '101%',  // 改为100%
      height: adjustedHeight,
      gap: '5px',
      position: 'relative'
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

      {/* 主要内容区域 */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        gap: '5px',  // 增加间距
        minHeight: '0',
        overflow: 'hidden',
        width: '100%'  // 确保宽度100%
      }}>
        {/* 左侧区域 - 风力发电机 (6份) */}
        <div style={{ 
          flex: '6 1 0%',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',  // 添加間距
          minWidth: 0,
          height: '100%'  // 確保容器佔滿高度
        }}>
          {/* 左上區域 - 固定高度 */}
          <div style={{ 
            height: '430px',
            ...cardStyle,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '2px'
          }}>
            {/* 添加標題 */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '20px',
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              {realData?.Info?.Name || '風機狀態'}
            </div>

            {/* 修改風機圖標按鈕 */}
            <IconButton
              onClick={handleNavigateToWindSite3D}
              style={{
                position: 'absolute',
                top: '10px',
                right: '20px',
                backgroundColor: 'rgba(6, 43, 98, 0.1)',
                padding: '8px',
                transition: 'all 0.3s ease',
                zIndex: 1000  // 確保按鈕在最上層
              }}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(6, 43, 98, 0.2)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <GiWindTurbine size={24} color="#062B62"/>
            </IconButton>

            <WindPowerStation 
              data={realData?.Info}
              name={realData?.Info?.Name || ''}
              style={{  
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '0px'
              }}
            />
          </div>

          {/* 左下區域 - 響應式高度 */}
          <div style={{ 
            flex: '1',
            ...cardStyle,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px'
          }}>
            {/* 控制區域 */}
            <div style={{ 
              marginBottom: '20px',
              padding: '0 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              {/* 時間週期滑塊 */}
              <div style={{ width: '30%' }}>
                <Slider
                  value={['min', 'hour', 'day', 'mon'].indexOf(chartPeriod)}
                  min={0}
                  max={3}
                  step={1}
                  marks={[
                    { value: 0, label: '分' },
                    { value: 1, label: '時' },
                    { value: 2, label: '天' },
                    { value: 3, label: '月' }
                  ]}
                  onChange={(_, value) => {
                    const periods = ['min', 'hour', 'day', 'mon'];
                    setChartPeriod(periods[value]);
                  }}
                />
              </div>
              
              {/* 添加統計圖表開關 */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ 
                  fontSize: '14px',
                  color: '#666'
                }}>
                  統計圖表
                </span>
                <Switch
                  checked={isStatChart}
                  onChange={handleStatisticChange}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase': {
                      padding: '4px',
                    },
                    '& .MuiSwitch-thumb': {
                      width: 14,
                      height: 14,
                    },
                    '& .MuiSwitch-track': {
                      borderRadius: 16,
                    }
                  }}
                />
              </div>
              
              {/* 日期選擇器 */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={selectedDate}
                  onChange={(newValue) => {
                    setSelectedDate(newValue);
                    if (deviceId && newValue) {
                      fetchChartData(deviceId, chartPeriod, newValue);
                    }
                  }}
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    width: '18%',
                    '& .MuiInputBase-root': {
                      height: '30px'
                    }
                  }}
                  maxDate={dayjs()}
                  slotProps={{
                    textField: {
                      size: "small",
                      placeholder: "選擇日期"
                    }
                  }}
                />
              </LocalizationProvider>
            </div>
            
            {/* 圖表區域 */}
            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
              {isChartLoading && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  zIndex: 1
                }}>
                  載入中...
                </div>
              )}
              
              {chartError && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  padding: '10px 20px',
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  border: '1px solid #ff4d4f',
                  borderRadius: '4px',
                  color: '#ff4d4f'
                }}>
                  {chartError}
                </div>
              )}
              
              <ReactECharts
                option={getChartOption()}
                style={{ height: '100%', width: '100%' }}
                notMerge={true}
              />
            </div>
          </div>
        </div>

        {/* 右侧区域 (4份) */}
        <div style={{ 
          flex: '4 1 0%',  // 修改flex属性
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          minWidth: 0,  // 添加最小宽度
          overflow: 'hidden'
        }}>
          {/* 右上區域 - 指南針和天氣 */}
          <div style={{ 
            flex: '3 0 30%',
            ...cardStyle,
            position: 'relative',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '0',
            overflow: 'hidden',
            padding: '10px'
          }}>
            {/* 左側天氣和溫度 */}
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: '0 0 30%',
              marginRight: '10px'
            }}>
              {/* 上方天氣圖標 */}
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '5px'
              }}>
                {weatherData && (
                  <>
                    <img 
                      src={`https://openweathermap.org/img/wn/${weatherData.weatherIcon}@2x.png`}
                      alt="Weather Icon"
                      style={{ 
                        width: '80px',
                        height: '80px',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                      }}
                      onError={(e) => {
                        console.error('圖標載入失敗:', e);
                      }}
                    />
                    <div style={{ 
                      fontSize: '14px',
                      marginTop: '2px',
                      textAlign: 'center'
                    }}>
                      {weatherData.weatherDescription || '未知天氣'}
                    </div>
                  </>
                )}
              </div>

              {/* 下方溫度計 */}
              <div style={{ 
                transform: 'scale(0.7)',
                transformOrigin: 'center top'
              }}>
                <TemperatureComp 
                  temperature={weatherData ? weatherData.temperature : 25}
                  min={15} 
                  max={35} 
                />
              </div>
            </div>

            {/* 右側指南針 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flex: '0 0 70%',
              justifyContent: 'center',
              transform: 'scale(1.5)',
              transformOrigin: 'center center'
            }}>
              <Compass 
                direction={0} 
                windSpeedData={weatherData ? weatherData.windSpeed : (realData?.Info?.FD_WindSpeed_3s || 0)}
                windDirectorData={weatherData ? weatherData.windDeg : (realData?.Info?.FD_WindDirector_1s || 0)}
              />
            </div>
          </div>

          {/* 右下区域 - 统计数据 (7份) */}
          <div style={{ 
            flex: '7 0 70%',  // 修改flex属性
            ...cardStyle,
            overflow: 'hidden', // 改为 hidden
            minHeight: '0',
            display: 'flex',    // 添加 flex 布局
            flexDirection: 'column',
          }}>
            {/* 统计卡片容器 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '8px',
              height: '100%',
              overflow: 'auto',  // 将滚动条移到内层容器
            }}>
              {/* 统计卡片 */}
              {[
                { title: '日統計', data: realData?.Info?.DayEnergy, showDecimals: true },
                { title: '月統計', data: realData?.Info?.MonthEnergy, showDecimals: true },
                { title: '年統計', data: realData?.Info?.YearEnergy, showDecimals: true },
                { title: '總統計', data: realData?.Info?.TotalEnergy, showDecimals: false }  // 總統計不顯示小數
              ].map((item, index) => (
                <div key={index} style={{
                  flex: '1 1 0%',
                  padding: '8px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '0',
                  transform: 'scale(0.95)',
                  height: '100%',  // 確保卡片占滿高度
                  justifyContent: 'space-between'  // 垂直均勻分布
                }}>
                  <div style={{ 
                    color: '#666', 
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    textAlign: 'center'  // 標題置中
                  }}>{item.title}</div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    flex: 1,
                    alignItems: 'center',  // 網格內容垂直置中
                    justifyContent: 'center'  // 網格內容水平置中
                  }}>
                    {/* 發電量 */}
                    <div style={{
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',  // 垂直置中
                      height: '100%'  // 確保內容占滿高度
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '4px'
                      }}>
                        <FaBolt style={{...iconStyle, color: '#faad14'}}/>
                        <span style={{fontSize: '14px', color: '#666'}}>發電量(kWh)</span>
                      </div>
                      <div style={{fontSize: '30px', fontWeight: 'bold'}}>
                        {formatNumber(item.data, 1, item.showDecimals)}
                      </div>
                    </div>
                    {/* 收益 */}
                    <div style={{
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',  // 垂直置中
                      height: '100%'  // 確保內容占滿高度
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '4px'
                      }}>
                        <FaMoneyBillWave style={{...iconStyle, color: '#52c41a'}}/>
                        <span style={{fontSize: '14px', color: '#666'}}>收益(NT$)</span>
                      </div>
                      <div style={{fontSize: '30px', fontWeight: 'bold'}}>
                        {formatNumber(item.data * 5.1)}
                      </div>
                    </div>
                    {/* 減碳 */}
                    <div style={{
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',  // 垂直置中
                      height: '100%'  // 確保內容占滿高度
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '4px'
                      }}>
                        <FaLeaf style={{...iconStyle, color: '#13c2c2'}}/>
                        <span style={{fontSize: '14px', color: '#666'}}>減碳(kgCO2e)</span>
                      </div>
                      <div style={{fontSize: '30px', fontWeight: 'bold'}}>
                        {formatNumber(item.data * 0.494)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
