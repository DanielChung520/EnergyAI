import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import dayjs from 'dayjs';

const PowerRatioChart = ({ date, width = '100%', height = '100%' }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  const COLORS = {
    wind: '#f44336',      // 紅色
    biomass: '#ff9800',   // 橘色
    solar: '#2196f3'      // 藍色
  };

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

        // 計算每種類型的總發電量
        const totals = {
          wind: 0,
          biomass: 0,
          solar: 0
        };

        // 累加每小時的發電量
        for (let hour = 0; hour < 24; hour++) {
          const hourStr = String(hour).padStart(2, '0');
          totals.wind += data.logs?.wind?.[hourStr] || 0;
          totals.biomass += data.logs?.biomass?.[hourStr] || 0;
          totals.solar += data.logs?.solar?.[hourStr] || 0;
        }

        // 轉換為餅圖數據格式
        const processed = [
          { name: '風力', value: totals.wind / 1000, color: COLORS.wind },
          { name: '生質能', value: totals.biomass / 1000, color: COLORS.biomass },
          { name: '太陽能', value: totals.solar / 1000, color: COLORS.solar }
        ];

        setChartData(processed);
      } catch (error) {
        console.error('Failed to fetch power ratio data:', error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '5px 8px',
          border: '1px solid #ccc',
          borderRadius: 4
        }}>
          <div style={{ color: data.color, fontWeight: 'bold' }}>
            {data.name}
          </div>
          <div>
            {data.value.toLocaleString()} MkW
          </div>
          <div>
            {percentage}%
          </div>
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
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="90%"
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <text x="50%" y="38%" textAnchor="middle" fontSize={14} fontWeight="bold">
              發電佔比
            </text>
            {chartData.map((entry, index) => {
              const total = chartData.reduce((sum, item) => sum + item.value, 0);
              const percentage = ((entry.value / total) * 100).toFixed(1);
              return (
                <text
                  key={index}
                  x="50%"
                  y={`${48 + index * 8}%`}
                  textAnchor="middle"
                  fill={entry.color}
                  fontSize={14}
                  fontWeight="bold"
                >
                  {`${entry.name} ${percentage}%`}
                </text>
              );
            })}
          </PieChart>
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

export default PowerRatioChart; 