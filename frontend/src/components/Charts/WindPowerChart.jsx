import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import axios from 'axios';
import PropTypes from 'prop-types';

const WindPowerChart = ({ deviceId, periodType, updateFrequency, refreshFlag, powerType }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartData, setChartData] = useState([]);

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);

    const option = {
      animation: false,
      grid: {
        top: 40,
        right: 40,
        bottom: 60,
        left: 60,
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        data: chartData.map(item => item.time),
        axisLabel: { 
          fontSize: 10,
          interval: 0,
          rotate: 45,
          margin: 15
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '發電量',
          position: 'left',
          axisLabel: { 
            fontSize: 10,
            formatter: '{value} kW'
          }
        },
        {
          type: 'value',
          name: '累計發電量',
          position: 'right',
          axisLabel: { 
            fontSize: 10,
            formatter: '{value} kWh'
          }
        }
      ],
      series: [
        {
          name: powerType === 'eqp' ? '風機' : '併網',
          type: 'bar',
          data: chartData.map(item => item.value),
          barWidth: '60%',
          itemStyle: {
            color: powerType === 'eqp' ? '#ffa500' : '#91cc75'
          },
          emphasis: {
            itemStyle: {
              color: powerType === 'eqp' ? '#91cc75' : '#ffa500'
            }
          }
        },
        {
          name: '累計發電量',
          type: 'line',
          yAxisIndex: 1,
          data: chartData.map(item => item.accumulated),
          smooth: true,
          itemStyle: {
            color: '#5470c6'
          }
        }
      ]
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current && chartInstance.current.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [chartData, powerType]);

  // 更新图表数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await axios.get(
          `${baseUrl}/api/performance/device-archive-power/${deviceId}`, {
          params: {
            period: periodType // 'min', 'hr', 'day', 'mon'
          }
        });

        if (!response.data.success) {
          throw new Error('Failed to fetch data');
        }

        const rawData = response.data.data;
        let accumulated = 0;
        
        const processedData = rawData.map(item => {
          // 根据 powerType 选择使用 wind_power 或 grid_power
          const value = powerType === 'eqp' ? item.wind_power : item.grid_power;
          accumulated += value;
          
          // 根据周期类型处理时间显示
          let displayTime = item.period;
          switch(periodType) {
            case 'min':
              // 只显示时和分
              displayTime = item.period.split(' ').pop();
              break;
            case 'hr':
              // 只显示小时数
              displayTime = item.period.split(' ')[1].split(':')[0] + '時';
              break;
            case 'day':
              // 只显示月和日
              displayTime = item.period.split('-').slice(1).join('-');
              break;
            case 'mon':
              // 显示年和月
              displayTime = item.period;
              break;
          }

          return {
            time: displayTime,
            value: value,
            accumulated: accumulated
          };
        });

        setChartData(processedData);
      } catch (error) {
        console.error('数据获取失败:', error);
      }
    };

    fetchData();
    const timer = setInterval(fetchData, updateFrequency * 60000);
    return () => clearInterval(timer);
  }, [periodType, updateFrequency, deviceId, refreshFlag, powerType]);

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0px'
    }}>
      <div 
        ref={chartRef}
        style={{
          width: '1500px',
          height: '400px',
          backgroundColor: '#fff',
          borderRadius: '4px',
        }}
      />
      {chartData.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#666'
        }}>
          數據加載中...
        </div>
      )}
    </div>
  );
};

WindPowerChart.propTypes = {
  deviceId: PropTypes.string.isRequired,
  periodType: PropTypes.oneOf(['min', 'hr', 'day', 'mon']).isRequired,
  updateFrequency: PropTypes.number,
  refreshFlag: PropTypes.number.isRequired,
  powerType: PropTypes.oneOf(['eqp', 'pac']).isRequired
};

WindPowerChart.defaultProps = {
  periodType: 'min',  // 默认分
  powerType: 'pac',   // 默认併網產電
  updateFrequency: 5  // 默认5分钟更新
};

export default WindPowerChart; 