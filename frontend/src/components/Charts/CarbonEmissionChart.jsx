import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { PieChart, Pie, Cell, ResponsiveContainer, Text, Label } from 'recharts';

// 定義 PropTypes
const CarbonEmissionChart = ({ 
  data = [], 
  total = 0,
  width = '100%', 
  height = '100%',
  colors = {
    wind: '#f44336',      // 紅色
    biomass: '#ff9800',   // 橘色
    solar: '#2196f3'      // 藍色
  }
}) => {
  const theme = useTheme();
  
  // 計算百分比
  const dataWithPercentage = data.map(item => ({
    ...item,
    color: colors[item.type] || '#999',  // 使用傳入的顏色或預設灰色
    percentage: ((item.value / total) * 100).toFixed(1)
  }));

  return (
    <div style={{ 
      width, 
      height, 
      position: 'relative',
      overflow: 'visible'  // 允許內容溢出
    }}>
      <ResponsiveContainer width="100%" height="100%" debounce={1}>
        <PieChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
          <defs>
            <filter id="textBackground" x="-50%" y="-50%" width="200%" height="200%">
              <feFlood floodColor="#fff" result="bg" />
              <feComposite in="bg" in2="SourceGraphic" operator="behind" />
            </filter>
          </defs>

          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy="65%"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            dataKey="value"
            labelLine={{ 
              stroke: '#666',
              strokeWidth: 1,
              strokeDasharray: '2 2'
            }}
            label={({
              cx,
              cy,
              midAngle,
              innerRadius,
              outerRadius,
              value,
              index,
              percentage,
              name
            }) => {
              const RADIAN = Math.PI / 180;
              const radius = outerRadius + 20;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              
              return (
                <g>
                  <text
                    x={x}
                    y={y - 8}
                    fill="#333"
                    textAnchor={x > cx ? 'start' : 'end'}
                    style={{
                      fontSize: '11px',
                      opacity: 0.6,
                      textShadow: '0 1px 2px rgba(255,255,255,0.5)'
                    }}
                  >
                    {name}
                  </text>
                  <text
                    x={x}
                    y={y + 8}
                    fill="#333"
                    textAnchor={x > cx ? 'start' : 'end'}
                    style={{
                      fontSize: '13px',
                      fontWeight: 'bold',
                      textShadow: '0 1px 2px rgba(255,255,255,0.5)'
                    }}
                  >
                    {`${value.toFixed(1)}t`}
                  </text>
                  <text
                    x={x}
                    y={y + 8}
                    dx={x > cx ? 45 : -45}
                    fill="#666"
                    textAnchor={x > cx ? 'start' : 'end'}
                    style={{
                      fontSize: '11px',
                      fontStyle: 'italic',
                      textShadow: '0 1px 2px rgba(255,255,255,0.5)'
                    }}
                  >
                    {`(${percentage}%)`}
                  </text>
                </g>
              );
            }}
          >
            {dataWithPercentage.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          
          {/* 中央文字 */}
          <g>
            <text 
              x="50%"
              y="48%"
              textAnchor="middle"
              fill="rgba(0, 0, 0, 0.6)"
              fontStyle="italic"
              fontSize={14}
              style={{
                userSelect: 'none',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              總計
            </text>
            <text 
              x="50%"
              y="65%"
              textAnchor="middle"
              fontSize={26}
              fontWeight="bold"
              fill="#333"
              style={{
                userSelect: 'none',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              {total.toFixed(1)}
            </text>
            <text 
              x="50%"
              y="76%"
              textAnchor="middle"
              fill="rgba(0, 0, 0, 0.6)"
              fontStyle="italic"
              fontSize={20}
              style={{
                userSelect: 'none',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              t
            </text>
          </g>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CarbonEmissionChart; 