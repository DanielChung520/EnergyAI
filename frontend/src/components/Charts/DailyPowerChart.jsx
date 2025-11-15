import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
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
import dayjs from 'dayjs';

const DailyPowerChart = ({ date, width = '100%', height = '100%' }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const targetDate = dayjs(date);
        const params = {
          scope: 'equip_type',
          time_range: 'day',
          date: targetDate.format('YYYY-MM-DD')
        };

        const res = await fetch(`/api/performance/equipment-logs?${new URLSearchParams(params)}`);
        const data = await res.json();
        
        console.log('Received data:', data);

        // 處理數據
        const hours = Array.from({ length: 24 }, (_, i) => i);
        let dailyAccumulator = 0;  // 添加日累計變量
        const processed = hours.map(hour => {
          const hourStr = String(hour).padStart(2, '0');
          const windValue = data.logs?.wind?.[hourStr] || 0;
          const biomassValue = data.logs?.biomass?.[hourStr] || 0;
          const solarValue = data.logs?.solar?.[hourStr] || 0;
          const hourlyTotal = (windValue + biomassValue + solarValue) / 1000;
          
          dailyAccumulator += hourlyTotal;  // 累加每小時的總量
          
          return {
            hour: `${hourStr}:00`,
            wind: windValue / 1000,
            biomass: biomassValue / 1000,
            solar: solarValue / 1000,
            total: dailyAccumulator  // 使用累計值
          };
        });

        console.log('Processed data:', processed);
        setChartData(processed);
      } catch (error) {
        console.error('Failed to fetch daily power data:', error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 230, 0.7)',
          borderRadius: 8,
          border: '1px solid rgba(0, 0, 0, 0.1)',
          padding: 4,
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{ fontSize: 12, color: '#333', marginBottom: 4 }}>
            {label}
          </div>
          {payload.map((entry, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1
            }}>
              <span style={{ color: entry.color }}>
                {entry.name}:
              </span>
              <span style={{ fontWeight: 600 }}>
                {entry.value.toLocaleString()} MkW
                {entry.name === '日累計' ? ' (累計)' : ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width, height, position: 'relative' }}>
      {loading ? (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: theme.palette.text.secondary
        }}>
          數據加載中...
        </div>
      ) : chartData.length > 0 ? (
        <ResponsiveContainer>
          <ComposedChart
            data={chartData}
            margin={{ top: 30, right: 35, bottom: 10, left: 35 }}
            barCategoryGap="35%"
            barGap={0}
          >
            <CartesianGrid strokeDasharray="3 3" /> 
            <XAxis 
              dataKey="hour"
              scale="point"
              tick={{ fontSize: 11 }}
              height={20}
              axisLine={{ strokeWidth: 2 }}
              tickLine={{ strokeWidth: 2 }}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis 
              yAxisId="left"
              orientation="left"
              tick={{ fontSize: 11 }}
              width={30}
              axisLine={{ strokeWidth: 2 }}
              tickLine={{ strokeWidth: 2 }}
              domain={[0, 'auto']}
              label={{ 
                value: 'MkW',
                angle: -90,
                position: 'insideLeft',
                offset: -5
              }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11 }}
              width={10} 
              axisLine={{ strokeWidth: 2 }}
              tickLine={{ strokeWidth: 2 }}
              domain={[0, 'auto']} 
              label={{ 
                value: 'MkW (累計)',
                angle: 90,
                position: 'insideRight',
                offset: -5
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                fontSize: 11,
                top: -5,
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            />
            <Bar 
              yAxisId="left" 
              dataKey="wind" 
              name="風力" 
              fill="#f44336" 
              stackId="a"
              barSize={20}
              minPointSize={2}
            />
            <Bar 
              yAxisId="left" 
              dataKey="biomass" 
              name="生質能" 
              fill="#ff9800" 
              stackId="a"
              barSize={20}          
              minPointSize={2}
            />
            <Bar 
              yAxisId="left" 
              dataKey="solar" 
              name="太陽能" 
              fill="#2196f3" 
              stackId="a"
              barSize={20}
              minPointSize={2}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="total"
              name="日累計"
              stroke="#4caf50"
              strokeWidth={2}
              dot={{ 
                r: 3,
                fill: '#4caf50',
                stroke: '#fff',
                strokeWidth: 2
              }}
              activeDot={{
                r: 5,
                fill: '#4caf50',
                stroke: '#fff',
                strokeWidth: 2
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: theme.palette.text.secondary
        }}>
          暫無數據
        </div>
      )}
    </div>
  );
};

export default DailyPowerChart; 