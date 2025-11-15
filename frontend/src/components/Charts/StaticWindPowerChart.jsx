import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

// 创建静态数据
const staticData = {
  times: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
  power: [320, 450, 750, 800, 600, 400],
  accumulated: [320, 770, 1520, 2320, 2920, 3320]
};

const StaticWindPowerChart = React.memo(() => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // 确保容器已经存在
    if (!chartRef.current) return;

    // 初始化图表
    chartInstance.current = echarts.init(chartRef.current);

    // 配置图表选项
    const option = {
      animation: false, // 禁用动画
      grid: {
        top: 40,
        right: 60,
        bottom: 20,
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
        data: staticData.times,
        axisLabel: { 
          fontSize: 10
        }
      },
      yAxis: [{
        type: 'value',
        name: '發電量',
        position: 'left',
        axisLabel: { 
          fontSize: 10,
          formatter: '{value} kW'
        },
        splitLine: { show: false }
      }, {
        type: 'value',
        name: '累計發電量',
        position: 'right',
        axisLabel: { 
          fontSize: 10,
          formatter: '{value} kWh'
        },
        splitLine: { show: false }
      }],
      series: [{
        name: '發電量',
        type: 'bar',
        data: staticData.power,
        barWidth: 20,
        itemStyle: {
          color: '#91cc75'
        }
      }, {
        name: '累計發電量',
        type: 'line',
        data: staticData.accumulated,
        yAxisIndex: 1,
        showSymbol: false,
        itemStyle: {
          color: '#5470c6'
        }
      }]
    };

    // 设置图表选项
    chartInstance.current.setOption(option);

    // 清理函数
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []); // 空依赖数组，确保只运行一次

  return (
    <div 
      ref={chartRef}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: '4px',
        transition: 'opacity 0.3s' // 添加过渡效果
      }}
    />
  );
});

export default StaticWindPowerChart; 