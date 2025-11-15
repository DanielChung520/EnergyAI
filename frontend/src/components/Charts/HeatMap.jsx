import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { useTheme } from '@mui/material/styles';

const HeatMap = ({ data, style }) => {
  const chartRef = useRef(null);
  const theme = useTheme();

  // 定義顏色閾值 (前4個為淺色，後5個為深色)
  const colorThreshold = 4; 
  const colors = [
    '#FFB3BA', // 最淺紅
    '#FF8080',
    '#FF4D4D',
    '#FF1A1A', // 正紅
    '#E60000', // 深紅
    '#0066CC', // 藍色開始
    '#0052A3',
    '#003D7A',
    '#002952'  // 最深藍
  ];

  useEffect(() => {
    const chart = echarts.init(chartRef.current);
    
    const processedData = data.map(item => {
      // 計算顏色索引
      const colorIndex = Math.floor((item.value / 100) * (colors.length - 1));
      return {
        ...item,
        textColor: theme.palette.common.white
      };
    });

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        formatter: (info) => {
          return `${info.name}<br/>發電量: ${info.value} MkW`;
        }
      },
      visualMap: {
        show: false,
        min: 0,
        max: 100,
        inRange: { color: colors }
      },
      series: [{
        type: 'treemap',
        data: processedData,
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        label: {
          show: true,
          fontSize: 12,
          position: 'inside',
          align: 'center',
          verticalAlign: 'middle',
          padding: [5, 5],
          formatter: (params) => {
            return `{text|${params.name}\n${params.value}}`;
          },
          rich: {
            text: {
              color: 'white',
              fontWeight: 'bold',
              align: 'center',
              verticalAlign: 'middle',
              lineHeight: 20,
              baseline: 'middle',
              verticalOffset: 2
            }
          }
        },
        itemStyle: {
          borderColor: 'rgba(0,0,0,0.1)',
          gapWidth: 2
        },
        upperLabel: {
          show: true,
          height: 0
        }
      }]
    };

    chart.setOption(option);

    const resizeHandler = () => chart.resize();
    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      chart.dispose();
    };
  }, [data, theme]);

  return <div ref={chartRef} style={{ width: '100%', height: '100%', backgroundColor: 'transparent', ...style }} />;
};

export { HeatMap as default }; 