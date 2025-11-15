import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, CircularProgress, IconButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReactECharts from 'echarts-for-react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import zhTW from 'date-fns/locale/zh-TW';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// 常量定義
const CARBON_FACTOR = 0.494;
const INCOME_FACTOR = 5.1;

// 圖表顏色配置
const CHART_COLORS = {
  power: '#8884d8',
  carbon: '#82ca9d',
  income: '#ffc658'
};

// 修改常量定義，為每個週期定義特定的配置
const PERIOD_CONFIGS = {
  day: {
    title: '日統計',
    xAxis: '小時',
    format: (date) => {
      // 如果日期字符串包含時間部分
      if (date.includes(' ')) {
        return `${date.split(' ')[1].substring(0, 2)}時`;
      }
      // 如果只有小時數
      return `${date.padStart(2, '0')}時`;
    },
    barWidth: '60%'
  },
  month: {
    title: '月統計',
    xAxis: '日期',
    format: (date) => `${parseInt(date.split('-')[2])}日`,
    barWidth: '80%'
  },
  year: {
    title: '年統計',
    xAxis: '月份',
    format: (date) => `${parseInt(date.split('-')[1])}月`,
    barWidth: '90%'
  }
};

const STAT_TYPE_LABELS = {
  power: {
    label: '發電量',
    unit: 'kWh'
  },
  carbon: {
    label: '碳減排量',
    unit: '公噸'
  },
  income: {
    label: '收益',
    unit: 'TWD'
  }
};

function SitePerformanceChart({ 
  siteId,
  period = 'day',
  statType = 'power',
  hideTitle = false,
  refreshFlag = 0,
  onRefresh
}) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // 添加日誌來追蹤 props 變化
  useEffect(() => {
    console.log('Props changed:', { siteId, period, statType, refreshFlag });
  }, [siteId, period, statType, refreshFlag]);

  useEffect(() => {
    async function fetchData() {
      if (!siteId) return;

      try {
        setLoading(true);
        setError(null);

        const currentPeriod = period || 'day';
        console.log('開始獲取數據:', {
          siteId,
          period: currentPeriod,
          statType,
          selectedDate: selectedDate.toISOString(),
          timestamp: new Date().toISOString()
        });
        
        // 格式化日期為 YYYY-MM-DD 格式
        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        
        const formattedDate = formatDate(selectedDate);
        
        // 修改為使用 archive-power 接口
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/performance/archive-power/${siteId}?period=${currentPeriod}&query_day=${formattedDate}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('API 返回數據:', result);

        if (!result.data || !Array.isArray(result.data)) {
          throw new Error('無效的數據格式');
        }

        const formattedData = result.data.map(item => ({
          period: item.period,
          value: calculateValue(Number(item.grid_power) || 0, statType)
        }));

        console.log('格式化後的數據:', {
          period: currentPeriod,
          dataLength: formattedData.length,
          firstItem: formattedData[0],
          lastItem: formattedData[formattedData.length - 1]
        });

        setChartData(formattedData);

      } catch (error) {
        console.error('獲取數據錯誤:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [siteId, period, statType, refreshFlag, selectedDate]);

  const calculateValue = useCallback((power, type) => {
    switch (type) {
      case 'carbon':
        return +(power * CARBON_FACTOR).toFixed(2);
      case 'income':
        return +(power * INCOME_FACTOR).toFixed(2);
      default:
        return +power.toFixed(2);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    } else {
      setRefreshFlag(prev => prev + 1);
    }
  }, [onRefresh]);

  // 修改 DatePicker 的 onChange 函數，確保它重新獲取數據
  const handleDateChange = (newDate) => {
    console.log('日期已變更:', newDate);
    setSelectedDate(newDate);
    // 注意：不需要顯式調用 fetchData，因為 useEffect 依賴已經包含 selectedDate
  };

  function getChartOption(data, period, statType, hideTitle) {
    const currentPeriod = period || 'day';
    const periodConfig = PERIOD_CONFIGS[currentPeriod];
    const currentStatType = STAT_TYPE_LABELS[statType];

    console.log('生成圖表配置:', {
      currentPeriod,
      dataLength: data.length,
      periodConfig,
      currentStatType
    });

    // 計算累計數據
    const accumulatedData = data.map((item, index) => {
      const sum = data.slice(0, index + 1).reduce((acc, curr) => acc + curr.value, 0);
      return sum;
    });

    return {
      title: {
        show: !hideTitle,
        text: `${periodConfig.title} ${currentStatType.label}統計`,
        left: 'center',
        top: 0
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        formatter: (params) => {
          const barData = params[0];
          const lineData = params[1];
          return `${barData.name}<br/>
                  ${statType === 'power' ? '發電量' : statType === 'carbon' ? '碳減排' : '收益'}: 
                  ${barData.value.toFixed(2)}${getUnit(statType)}<br/>
                  累計: ${lineData.value.toFixed(2)}${getUnit(statType)}`;
        }
      },
      legend: {
        data: ['當期', '累計'],
        top: 10,
        left: 'center',
        itemWidth: 15,
        itemHeight: 10,
        textStyle: {
          fontSize: 12
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10px',
        top: '60px',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(item => periodConfig.format(item.period)),
        // name: periodConfig.xAxis,
        nameLocation: 'middle',
        nameGap: 35,
        axisLabel: {
          interval: currentPeriod === 'day' ? 3 : 0,
          rotate: currentPeriod === 'month' ? 45 : 0
        }
      },
      yAxis: [
        {
          type: 'value',
          name: getYAxisName(statType),
          position: 'left',
          axisLabel: {
            formatter: (value) => `${value}${getUnit(statType)}`
          }
        },
        {
          type: 'value',
          name: '累計',
          position: 'right',
          axisLabel: {
            formatter: (value) => `${value}${getUnit(statType)}`
          }
        }
      ],
      series: [
        {
          name: '當期',
          type: 'bar',
          data: data.map(item => item.value),
          barWidth: periodConfig.barWidth,
          itemStyle: {
            color: CHART_COLORS[statType],
            borderRadius: [4, 4, 0, 0]
          }
        },
        {
          name: '累計',
          type: 'line',
          yAxisIndex: 1,
          data: accumulatedData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 2,
            type: 'solid'
          },
          itemStyle: {
            color: '#2e7d32'
          }
        }
      ]
    };
  }

  // 輔助函數：獲取單位
  const getUnit = (statType) => {
    switch (statType) {
      case 'power':
        return ' kWh';
      case 'carbon':
        return ' kg';
      case 'income':
        return ' 元';
      default:
        return '';
    }
  };

  // 輔助函數：獲取Y軸名稱
  const getYAxisName = (statType) => {
    switch (statType) {
      case 'power':
        return '發電量 (kWh)';
      case 'carbon':
        return '碳減排 (kg)';
      case 'income':
        return '收益 (元)';
      default:
        return '';
    }
  };

  // 輔助函數：根據週期獲取柱狀圖寬度
  const getBarWidth = (period) => {
    switch (period) {
      case 'day':
        return '50%';
      case 'month':
        return '60%';
      case 'year':
        return '70%';
      default:
        return '50%';
    }
  };

  // 修改渲染部分
  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: 340, position: 'relative' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 1,
        px: 1 
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2 
        }}>
        </Box>
      </Box>
      
      <Box sx={{ 
        position: 'absolute',
        right: '16px',
        top: '-10px',
        zIndex: 10
      }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
          <DatePicker
            label="選擇日期"
            value={selectedDate}
            onChange={handleDateChange}
            slotProps={{ 
              textField: { 
                size: 'small',
                sx: {
                  backgroundColor: 'white',
                  '& .MuiInputBase-root': {
                    fontSize: '0.875rem',
                  }
                }
              }
            }}
          />
        </LocalizationProvider>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <CircularProgress size={24} />
          <Typography sx={{ ml: 2 }}>載入中...</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : !chartData.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Typography>無數據</Typography>
        </Box>
      ) : (
        <ReactECharts 
          option={getChartOption(chartData, period, statType, hideTitle)}
          style={{ height: 320 }}
          notMerge={true}
          lazyUpdate={false}
          key={`${period}-${statType}-${chartData.length}`}
        />
      )}
    </Box>
  );
}

export default SitePerformanceChart; 