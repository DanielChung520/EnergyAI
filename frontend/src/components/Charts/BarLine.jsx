import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import weekOfYear from 'dayjs/plugin/weekOfYear';
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

dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);

/**
 * 组合图表组件
 * @param {string} dataScope - 统计范围: 'all' | 'site' | 'equip' | 'type'
 * @param {string} timeRange - 时间周期: 'year' | 'quarter' | 'month' | 'day'
 * @param {string|number} width - 图表宽度
 * @param {string|number} height - 图表高度
 */
const BarLine = ({ 
  dataScope = 'all',
  timeRange = 'year',
  year,
  month,
  equipType,
  width = '100%',
  height = '100%'
}) => {
  const theme = useTheme();
  const containerRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });
  const [chartData, setChartData] = useState({
    xAxis: [],
    bars: [],
    lines: []
  });

  // 从API获取数据时间范围
  const [dataRange, setDataRange] = useState({ start: dayjs(), end: dayjs() });
  
  // 在组件顶部添加状态
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/performance/data-range')
      .then(res => res.json())
      .then(({ start, end }) => {
        setDataRange({
          start: dayjs(start),
          end: dayjs(end)
        });
      });
  }, []);

  // 更新尺寸的 useEffect
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setChartDimensions({
          width: clientWidth,
          height: clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // 时间范围配置保持通用性
  const getTimeRange = () => {
    const now = dayjs();
    
    // 如果指定了年月，使用指定的時間範圍
    if (year && month) {
      const targetDate = dayjs(`${year}-${month.padStart(2, '0')}-01`);
      return {
        start: targetDate.startOf('month'),
        end: targetDate.endOf('month'),
        format: 'YYYY-MM-DD',
        displayFormat: 'MM/DD',
        dataKey: 'day',
        barName: '日發電量',
        lineName: '月度累計'
      };
    }

    const ranges = {
      month: {
        start: now.subtract(29, 'day'),
        end: now,
        format: 'YYYY-MM-DD',
        displayFormat: 'MM/DD',
        dataKey: 'day',
        barName: '日發電量',
        lineName: '月度累計'
      },
      year: {
        start: now.subtract(1, 'year').startOf('month'),
        end: now.endOf('month'),
        format: 'YYYY-MM',
        displayFormat: 'MMM-YY',
        dataKey: 'month',
        barName: '月度發電量',
        lineName: '年度累計'
      },
      quarter: {
        start: now.subtract(3, 'month').startOf('month'),
        end: now.endOf('month'),
        format: 'YYYY-[W]WW',
        displayFormat: '第WW周',
        dataKey: 'week',
        barName: '周發電量',
        lineName: '季度累計'
      }
    };
    return ranges[timeRange];
  };

  // 生成时间标签
  const generateTimeLabels = () => {
    const range = getTimeRange();
    const labels = [];
    let current = range.start;
    
    while (current <= range.end) {
      if (timeRange === 'quarter') {
        const weekNumber = current.isoWeek();
        const value = `${current.year()}-${String(weekNumber).padStart(2, '0')}`;
        labels.push({
          value,
          display: `${current.year()}年 第${weekNumber}周`
        });
      } else {
        const value = current.format(range.format);
        const display = current.format(range.displayFormat);
        labels.push({ value, display });
      }
      
      // 根據時間範圍選擇增加的單位
      const addUnit = 
        timeRange === 'quarter' ? 'week' : 
        (timeRange === 'month' || (year && month)) ? 'day' : 
        'month';
      current = current.add(1, addUnit);
    }
    
    return labels;
  };

  useEffect(() => {
    // 先生成時間標籤
    const labels = generateTimeLabels();
    setChartData({
      xAxis: labels.map(label => label.display),
      bars: [],
      lines: []
    });
    
    // 然後獲取數據
    const fetchAndProcessData = async () => {
      setLoading(true);
      try {
        const range = getTimeRange();
        // 只包含有效的參數
        const params = new URLSearchParams({
          scope: dataScope,
          time_range: timeRange,
          start: range.start.format('YYYY-MM-DDTHH:mm:ss'),
          end: range.end.format('YYYY-MM-DDTHH:mm:ss')
        });
        
        // 有值時才添加可選參數
        if (year) params.append('year', year);
        if (month) params.append('month', month);
        if (equipType) params.append('equip_type', equipType);

        console.log('Time range:', {
          start: range.start.format('YYYY-MM-DD HH:mm:ss'),
          end: range.end.format('YYYY-MM-DD HH:mm:ss')
        });
        
        const url = `/api/performance/equipment-logs?${params}`;
        console.log('Request URL:', url);

        const res = await fetch(url);
        console.log('Response status:', res.status);
        
        if (!res.ok) {
          console.error('API response not ok:', res.status, res.statusText);
          const errorText = await res.text();
          console.error('Error response:', errorText);
          throw new Error(res.statusText);
        }
        
        const data = await res.json();
        console.log('Received data:', data);
        
        // 檢查數據格式
        if (!data || (!data.logs && !data.total)) {
          console.error('Invalid data format:', data);
          throw new Error('Invalid data format');
        }
        
        // 使用 total 或 logs.total
        const totalData = data.total || (data.logs && data.logs.total) || {};
        
        const processed = processLogs({ total: totalData }, labels);
        console.log('处理后的图表数据:', processed);
        
        setChartData(processed);

      } catch (error) {
        console.error('数据获取失败:', error);
        setChartData({
          xAxis: [],
          bars: [],
          lines: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, [dataScope, timeRange, dataRange, year, month, equipType]);

  // 通用数据处理
  const processLogs = (logs, labels) => {
    const { dataKey, barName, lineName } = getTimeRange();
    
    // 转换API数据格式
    const apiDataMap = Object.entries(logs.total || {}).reduce((acc, [key, value]) => {
      // 统一处理不同周数格式
      const formattedKey = key
        .replace('W', '') // 处理2024-W43格式
        .replace(/(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/, (_, y, m, d) => {
          if (d) {
            // 处理完整日期格式 YYYY-MM-DD
            return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          } else {
            // 处理年月或年周格式
            return `${y}-${m.padStart(2, '0')}`;
          }
        });
      acc[formattedKey] = value;
      return acc;
    }, {});

    console.log('API原始数据键:', Object.keys(logs.total || {}));
    console.log('转换后的数据键:', Object.keys(apiDataMap));
    console.log('生成的时间标签键:', labels.map(l => l.value));

    return labels.map((label, index) => {
      const currentValue = (apiDataMap[label.value] || 0) / 1000;
      let accumulator = 0;
      
      for (let i = 0; i <= index; i++) {
        accumulator += (apiDataMap[labels[i].value] || 0) / 1000;
      }

      return {
        [dataKey]: label.display,
        [barName]: currentValue,
        [lineName]: accumulator
      };
    });
  };

  // 在組件頂部添加自定義 Tooltip 組件
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 230, 0.7)',
          borderRadius: 8,
          border: '1px solid rgba(0, 0, 0, 0.1)',
          padding: 12,
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{ 
            fontSize: 12,
            color: '#333',
            marginBottom: 4,
            fontWeight: 500 
          }}>
            {label}
          </div>
          {payload.map((entry, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 5
            }}>
              <span style={{ color: entry.color }}>
                {entry.name}:
              </span>
              <span style={{ fontWeight: 600, marginLeft: 4 }}>
                {entry.value.toLocaleString()}
                {entry.name === '月度發電量' ? ' MkW' : ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // 修改周显示格式处理函数
  const formatWeekLabel = (weekString) => {
    const [year, week] = weekString.split('-W');
    // 移除前导零
    const cleanWeek = week.replace(/^0+/, '');
    return `${year}年 第${cleanWeek}周`;
  };

  // 动态配置图表元素
  const { dataKey, barName, lineName } = getTimeRange();

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: width,
        height: height,
        padding: '0px',
        position: 'relative'
      }}
    >
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: theme.palette.text.secondary
        }}>
{/*  */}
        </div>
      )}
      {!loading && chartData.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: theme.palette.text.secondary
        }}>
          暂无数据
        </div>
      )}
      <ResponsiveContainer>
        {chartData.length > 0 && (
          <ComposedChart
            data={chartData}
            margin={{
              top: 65,    // 增加頂部邊距，讓圖表往下移
              right: 0,
              left: 10,
              bottom: 2
            }}
            options={{
              scales: {
                x: {
                  ticks: {
                    callback: function(value) {
                      return formatWeekLabel(this.getLabelForValue(value));
                    }
                  }
                }
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={dataKey}
              scale="point"
              padding={{ left: 15, right: 15 }}
              tick={{ fontSize: 11 }}
              height={20}
            />
            <YAxis 
              yAxisId="left"
              orientation="left"
              tick={{ fontSize: 11 }}
              width={45}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11 }}
              width={60}
            />
            <Tooltip 
              content={<CustomTooltip />}
              contentStyle={{ 
                padding: 0,  // 移除默認 padding
                border: 'none',  // 移除默認邊框
                backgroundColor: 'transparent'  // 背景透明
              }}
            />
            <Legend 
              wrapperStyle={{ 
                fontSize: 11,
                top: 35,    // 往上移動一點
                left: '50%',
                transform: 'translateX(-50%)',
                paddingBottom: 0
              }}
              position="top"
            />
            <Bar
              yAxisId="left"
              dataKey={barName}
              name={barName}
              fill="#f44336"
              barSize={20}
              maxBarSize={24}
              radius={[5, 5, 0, 0]}
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            />
            <Line
              yAxisId="right"
              dataKey={lineName}
              name={lineName}
              stroke="#1890ff"
              strokeWidth={2}
              dot={{ stroke: '#1890ff', fill: '#fff' }}
            />
          </ComposedChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default BarLine;
