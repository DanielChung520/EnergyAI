import React, { useEffect, useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const GaugeChart = ({ 
  value, 
  title, 
  min = 0, 
  max = 100, 
  unit = '', 
  colors = ['#757575', '#4CAF50', '#FF5252'],
  multipleValues = false,
  values = [],
  isVoltage = false,
  size = '300px'
}) => {
  const gaugeData = useMemo(() => 
    multipleValues ? 
      values.map((val, index) => ({
        value: Math.round(val),
        name: unit,
        title: {
          show: false
        },
        itemStyle: {
          color: colors[index % colors.length]
        }
      })) : 
      [{
        value: Math.round(value),
        name: unit,
        title: {
          show: false
        }
      }],
    [multipleValues, values, value, unit, colors]
  );

  const options = useMemo(() => ({
    title: {
      text: title,
      left: 'center',
      top: '47%',
      textStyle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ff5722'
      },
      z: 1
    },
    series: [{
      type: 'gauge',
      radius: '75%',
      center: ['50%', '65%'],
      startAngle: 200,
      endAngle: -20,
      min,
      max,
      splitNumber: 10,
      itemStyle: {
        color: 'auto'
      },
      progress: {
        show: !multipleValues,
        roundCap: true,
        width: 10,
        z: 2
      },
      pointer: {
        show: true,
        width: 5,
        length: '60%',
        offsetCenter: [0, 0],
        z: 3
      },
      axisLine: {
        roundCap: true,
        lineStyle: {
          width: 18,
          color: isVoltage ? 
            [
              [180/max, '#FAC858'],
              [250/max, '#91CC75'],
              [1, '#EE6666']
            ] :
            multipleValues ? 
              [[1, '#E0E0E0']] :
              [
                [0.3, '#757575'],
                [0.7, '#4CAF50'],
                [1, '#FF5252']
              ]
        }
      },
      axisTick: {
        splitNumber: 5,
        distance: -26,
        length: 8,
        lineStyle: {
          width: 2,
          color: '#999'
        }
      },
      splitLine: {
        distance: -22,
        length: 14,
        lineStyle: {
          width: 3,
          color: '#999'
        }
      },
      axisLabel: {
        distance: -30,
        color: '#999',
        fontSize: 14,
        align: 'center',
        verticalAlign: 'middle',
        padding: [0, 0, 0, 0],
        formatter: function(value) {
          return value.toString();
        }
      },
      detail: multipleValues ? {
        valueAnimation: true,
        width: '60%',
        lineHeight: 40,
        borderRadius: 8,
        offsetCenter: [0, '60%'],
        fontSize: 30,
        fontWeight: 'bold',
        formatter: function(value) {
          const voltages = values.map((v, i) => 
            `{color${i}|${Math.round(v)}}`
          ).join('/');
          return `{unitStyle|${unit}}\n${voltages}`;
        },
        rich: { 
          color0: {
            color: colors[0],
            fontSize: 28,
            fontWeight: 'bolder',
            padding: [0, 2]
          },
          color1: {
            color: colors[1],
            fontSize: 28,
            fontWeight: 'bolder',
            padding: [0, 2]
          },
          color2: {
            color: colors[2],
            fontSize: 28,
            fontWeight: 'bolder',
            padding: [0, 2]
          },
          unitStyle: {
            fontSize: 20,
            fontWeight: 'normal',
            color: '#666',
            padding: [0, 0, 2, 0]
          }
        }
      } : {
        valueAnimation: true,
        width: '60%',
        lineHeight: 40,
        borderRadius: 8,
        offsetCenter: [0, '50%'],
        fontSize: 35,
        fontWeight: 'bold',
        formatter: function(value) {
          return `{unitStyle|${unit}}\n${Math.round(value)}`;
        },
        rich: {
          unitStyle: {
            fontSize: 20,
            fontWeight: 'normal',
            color: '#666',
            padding: [0, 0, 1, 0]
          }
        },
        color: 'auto'
      },
      data: gaugeData
    }]
  }), [min, max, multipleValues, colors, values, unit, gaugeData, isVoltage, title]);

  return (
    <Box sx={{ 
      width: size,
      height: size,
      position: 'relative',
    }}>
      <Card sx={{ 
        height: '100%',
        bgcolor: '#ffffff'
      }}>
        <CardContent sx={{
          height: 'calc(100% - 32px)',
          p: 1,
          '&:last-child': {
            pb: 1
          }
        }}>
          <Box sx={{ 
            height: '100%',
            width: '100%',
            position: 'relative'
          }}>
            <ReactECharts
              option={options}
              style={{ 
                height: '100%',
                width: '100%',
                position: 'absolute',
                left: 0,
                top: 0
              }}
              opts={{ renderer: 'svg' }}
              notMerge={true}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GaugeChart; 