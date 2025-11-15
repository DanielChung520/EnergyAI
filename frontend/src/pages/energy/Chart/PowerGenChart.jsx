import React, { useMemo } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { getPowerGenData } from '../../../data/powerGenData';

const PowerGenChart = ({ 
  width = '100%',
  height = '100%',
  type = 'month',  // 'year', 'month', 'day'
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1,
  darkMode = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 根據容器大小調整字體大小
  const fontSize = useMemo(() => {
    if (isMobile) return 10;
    if (width < 400) return 11;
    return 12;
  }, [width, isMobile]);

  // 獲取數據
  const data = useMemo(() => getPowerGenData(type, year, month), [type, year, month]);

  // 根據類型設置標籤文字
  const labels = useMemo(() => {
    switch (type) {
      case 'year':
        return { output: '月發電量', accumulated: '年度累計', unit: 'MWh' };
      case 'month':
        return { output: '日發電量', accumulated: '月度累計', unit: 'kWh' };
      case 'day':
        return { output: '小時發電量', accumulated: '日累計', unit: 'kWh' };
      default:
        return { output: '發電量', accumulated: '累計', unit: 'kWh' };
    }
  }, [type]);

  // 主題顏色
  const colors = useMemo(() => ({
    text: darkMode ? '#fff' : '#666',
    grid: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    bar: darkMode ? '#8884d8' : '#8884d8',
    line: darkMode ? '#82ca9d' : '#82ca9d',
    background: darkMode ? '#424242' : '#ffffff'
  }), [darkMode]);

  return (
    <Box sx={{ 
      width, 
      height,
      backgroundColor: colors.background,
      borderRadius: 1,
      p: 0.5
    }}>
      <ResponsiveContainer>
        <ComposedChart
          data={data}
          margin={{
            top: 35,
            right: 35,
            left: 35,
            bottom: 0
          }}
        >
          <Legend 
            wrapperStyle={{ 
              fontSize,
              lineHeight: 1.2,
              paddingBottom: 5
            }}
            height={40}
            verticalAlign="top"
            align="center"
          />
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={colors.grid}
          />
          <XAxis 
            dataKey="time"
            scale="point"
            padding={{ left: 1, right: 1 }}
            tick={{ fontSize, fill: colors.text }}
          />
          <YAxis 
            yAxisId="left"
            orientation="left"
            tick={{ fontSize, fill: colors.text }}
            label={null}
            width={35}
            tickMargin={5}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize, fill: colors.text }}
            label={null}
            width={35}
            tickMargin={5}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: colors.background,
              border: `1px solid ${colors.grid}`,
              fontSize
            }}
            labelStyle={{ color: colors.text }}
            formatter={(value, name) => {
              return [`${value} ${labels.unit}`, name];
            }}
          />
          <Bar
            yAxisId="left"
            dataKey="output"
            name={labels.output}
            fill={colors.bar}
            barSize={15}
            radius={[2, 2, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="accumulated"
            name={labels.accumulated}
            stroke={colors.line}
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PowerGenChart;
