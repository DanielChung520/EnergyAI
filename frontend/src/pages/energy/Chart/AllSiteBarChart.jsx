import { Box, Card, Typography } from '@mui/material';
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

const AllSiteBarChart = () => {
  // 模擬數據
  const data = [
    { month: '1月', monthlyOutput: 156.3, accumulated: 156.3 },
    { month: '2月', monthlyOutput: 142.8, accumulated: 299.1 },
    { month: '3月', monthlyOutput: 187.5, accumulated: 486.6 },
    { month: '4月', monthlyOutput: 198.4, accumulated: 685.0 },
    { month: '5月', monthlyOutput: 225.6, accumulated: 910.6 },
    { month: '6月', monthlyOutput: 245.2, accumulated: 1155.8 },
    { month: '7月', monthlyOutput: 267.8, accumulated: 1423.6 },
    { month: '8月', monthlyOutput: 278.4, accumulated: 1702.0 },
    { month: '9月', monthlyOutput: 234.5, accumulated: 1936.5 },
    { month: '10月', monthlyOutput: 189.3, accumulated: 2125.8 },
    { month: '11月', monthlyOutput: 167.2, accumulated: 2293.0 },
    { month: '12月', monthlyOutput: 145.6, accumulated: 2438.6 }
  ];

  return (
    <Card
      sx={{
        p: 2,
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        boxShadow: 5
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        2024年度發電量統計
      </Typography>
      
      <Box sx={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <ComposedChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month"
              scale="point"
              padding={{ left: 10, right: 10 }}
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              yAxisId="left"
              orientation="left"
              tick={{ fontSize: 11 }}
              label={{ 
                value: '月發電量 (MWh)',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 11 }
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11 }}
              label={{
                value: '年度累計 (MWh)',
                angle: 90,
                position: 'insideRight',
                style: { fontSize: 11 }
              }}
            />
            <Tooltip 
              contentStyle={{ fontSize: 11 }}
              labelStyle={{ fontSize: 11 }}
            />
            <Legend 
              wrapperStyle={{ fontSize: 11 }}
            />
            <Bar
              yAxisId="left"
              dataKey="monthlyOutput"
              name="月發電量"
              fill="#8884d8"
              barSize={15}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="accumulated"
              name="年度累計"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
};

export default AllSiteBarChart;
