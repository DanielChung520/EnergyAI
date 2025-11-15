import { Box, Card, Typography } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Label, Tooltip } from 'recharts';

const AllSitePieChart = () => {
  // 模擬數據
  const data = [
    { name: '風力', value: 35.8 },
    { name: '太陽能', value: 42.3 },
    { name: '生質能', value: 15.4 },
    { name: '地熱', value: 6.5 }
  ];

  // 顏色配置
  const COLORS = ['#0088FE', '#FFBB28', '#FF8042', '#8B4513'];

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
        2024年電力種類產出比例
      </Typography>
      
      <Box sx={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name} ${value}%`}
              labelLine={true}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `${value}%`}
              contentStyle={{ fontSize: 11 }}
              labelStyle={{ fontSize: 11 }}
            />
            <Legend 
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: 11 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
};

export default AllSitePieChart;
