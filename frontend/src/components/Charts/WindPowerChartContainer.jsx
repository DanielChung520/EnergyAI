import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import StaticWindPowerChart from './StaticWindPowerChart';

const WindPowerChartContainer = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化图表
    chartInstance.current = echarts.init(chartRef.current);
    
    const option = {
      grid: {
        top: 40,
        right: 60,
        bottom: 20,
        left: 60,
        containLabel: true
      },
      tooltip: {
        show: false
      },
      xAxis: {
        type: 'category',
        data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
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
        }
      }, {
        type: 'value',
        name: '累計發電量',
        position: 'right',
        axisLabel: { 
          fontSize: 10,
          formatter: '{value} kWh'
        }
      }],
      series: [{
        name: '發電量',
        type: 'bar',
        data: [320, 450, 750, 800, 600, 400],
        barWidth: 20,
        itemStyle: {
          color: '#91cc75'
        }
      }, {
        name: '累計發電量',
        type: 'line',
        data: [320, 770, 1520, 2320, 2920, 3320],
        yAxisIndex: 1,
        showSymbol: false,
        itemStyle: {
          color: '#5470c6'
        }
      }]
    };

    chartInstance.current.setOption(option);

    // 清理函数
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []); // 空依赖数组，只在挂载时运行一次

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        flex: '1 1 50%',
        minHeight: '0',
        overflow: 'auto'
      }}>
        <StaticWindPowerChart />
      </div>
      <div style={{
        flex: '1 1 50%',
        minHeight: '0',
        position: 'relative'
      }}>
        <div 
          ref={chartRef}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            bottom: '10px',
            left: '10px',
            backgroundColor: '#ffffff'
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(WindPowerChartContainer); 