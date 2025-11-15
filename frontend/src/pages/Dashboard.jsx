import { Grid, Box, Paper, FormControl, Select, MenuItem, InputLabel, Button, Typography, Card, CardContent } from '@mui/material';
import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import BarLine from '../components/Charts/BarLine';
import OpenWithOutlinedIcon from '@mui/icons-material/OpenWithOutlined';
import CardHeader from '../components/CardHeader';
import { useTheme } from '@mui/material/styles';
import DailyPowerChart from '../components/Charts/DailyPowerChart';
import PowerRatioChart from '../components/Charts/PowerRatioChart';
import CarbonEmissionChart from '../components/Charts/CarbonEmissionChart';
import HeatMap from '../components/Charts/HeatMap.jsx';

function Dashboard() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const theme = useTheme();

  // 定義通用的卡片樣式
  const cardStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',  // 更透明
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',  // 懸停時更透明
      transition: 'background-color 0.3s ease'
    }
  };

  const carbonData = [
    { 
      name: '風能',
      type: 'wind',
      value: 38.2
    },
    { 
      name: '太陽能',
      type: 'solar',
      value: 45.6
    },
    { 
      name: '生質能',
      type: 'biomass',
      value: 21.5
    }
  ];
  
  const totalCarbon = carbonData.reduce((sum, item) => sum + item.value, 0);

  // 計算月排碳量（年度的約 1/12）
  const monthCarbonData = [
    { 
      name: '風能',
      type: 'wind',
      value: 3.2
    },
    { 
      name: '太陽能',
      type: 'solar',
      value: 3.8
    },
    { 
      name: '生質能',
      type: 'biomass',
      value: 1.8
    }
  ];
  
  // 計算日排碳量（月度的約 1/30）
  const dayCarbonData = [
    { 
      name: '風能',
      type: 'wind',
      value: 0.11
    },
    { 
      name: '太陽能',
      type: 'solar',
      value: 0.13
    },
    { 
      name: '生質能',
      type: 'biomass',
      value: 0.06
    }
  ];
  
  const monthTotalCarbon = monthCarbonData.reduce((sum, item) => sum + item.value, 0);
  const dayTotalCarbon = dayCarbonData.reduce((sum, item) => sum + item.value, 0);

  // 在組件內添加模擬數據
  const heatMapData = [
    { name: '電廠A', value: 95 },
    { name: '電廠B', value: 80 },
    { name: '電廠C', value: 65 },
    { name: '電廠D', value: 50 },
    { name: '電廠E', value: 45 },
    { name: '電廠F', value: 30 },
    { name: '電廠G', value: 25 },
    { name: '電廠H', value: 15 },
    { name: '電廠I', value: 10 }
  ].map(item => ({
    ...item,
    itemStyle: {
      opacity: item.value / 100 * 0.8 + 0.2
    }
  }));

  return (
    <Box sx={{ 
      p: 2,
      display: 'flex',
      flexDirection: 'row-reverse',
      gap: 1,
      height: '95vh',
      overflow: 'hidden',
      backgroundImage: 'url(./backPic.jpg)',  // 使用背景圖片
      backgroundSize: 'cover',               // 覆蓋整個區域
      backgroundPosition: 'center',          // 置中對齊
      backgroundRepeat: 'no-repeat',          // 不重複
      '& .MuiGrid-container': {
        flexWrap: 'nowrap',
        alignItems: 'stretch'
      }
    }}>
      {/* 右侧筛选区域 */}
      <Paper sx={{ 
        width: isSidebarExpanded ? 240 : 56,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        position: 'relative',
        flexShrink: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
      }}>
        {/* 标题区域 */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'primary.main', 
          color: 'white',
          p: 1,
          height: 48,
          position: 'relative'
        }}>
          <IconButton 
            color="inherit"
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            sx={{ 
              position: 'absolute',
              left: 8,
              zIndex: 1
            }}
          >
            {isSidebarExpanded ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
          {isSidebarExpanded && (
            <Typography 
              variant="subtitle1" 
              sx={{ 
                width: '100%',
                textAlign: 'center',
                pl: 4
              }}
            >
              條件設置
            </Typography>
          )}
        </Box>

        {/* 筛选条件内容 */}
        <Box sx={{ 
          height: 'calc(100% - 48px)',
          overflow: 'auto',
          transition: 'opacity 0.2s',
          opacity: isSidebarExpanded ? 1 : 0,
          pointerEvents: isSidebarExpanded ? 'auto' : 'none',
          p: 2
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* 年份选择 */}
            <FormControl fullWidth size="small">
              <InputLabel>年份</InputLabel>
              <Select defaultValue="2023" label="年份">
                <MenuItem value="2023">2023</MenuItem>
                <MenuItem value="2022">2022</MenuItem>
              </Select>
            </FormControl>

            {/* 月份选择 */}
            <FormControl fullWidth size="small">
              <InputLabel>月份</InputLabel>
              <Select defaultValue="all" label="月份">
                <MenuItem value="all">全部</MenuItem>
                {[...Array(12)].map((_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>{i + 1}月</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 优先级 */}
            <FormControl fullWidth size="small">
              <InputLabel>优先级</InputLabel>
              <Select defaultValue="all" label="优先级">
                <MenuItem value="all">全部</MenuItem>
                <MenuItem value="high">高</MenuItem>
                <MenuItem value="medium">中</MenuItem>
                <MenuItem value="low">低</MenuItem>
              </Select>
            </FormControl>

            {/* 严重程度 */}
            <FormControl fullWidth size="small">
              <InputLabel>严重程度</InputLabel>
              <Select defaultValue="all" label="严重程度">
                <MenuItem value="all">全部</MenuItem>
                <MenuItem value="critical">严重</MenuItem>
                <MenuItem value="major">重要</MenuItem>
                <MenuItem value="minor">次要</MenuItem>
              </Select>
            </FormControl>

            {/* 工作类型 */}
            <FormControl fullWidth size="small">
              <InputLabel>工作类型</InputLabel>
              <Select defaultValue="all" label="工作类型">
                <MenuItem value="all">全部</MenuItem>
                <MenuItem value="incident">故障</MenuItem>
                <MenuItem value="request">请求</MenuItem>
              </Select>
            </FormControl>

            {/* 请求类别 */}
            <FormControl fullWidth size="small">
              <InputLabel>请求类别</InputLabel>
              <Select defaultValue="all" label="请求类别">
                <MenuItem value="all">全部</MenuItem>
              </Select>
            </FormControl>

            {/* 重置按钮 */}
            <Button variant="contained" color="primary" fullWidth>
              重置筛选
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 左侧主要内容区域 */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        gap:1,
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        transition: 'margin-right 0.3s ease',
        marginRight: isSidebarExpanded ? 0 :0
      }}>
        {/* 顶部统计卡片 - 占3份 */}
        <Grid container spacing={1} sx={{ 
          flex: '3 1 0%',
          // gap:1,
          overflow: 'auto',
          // mb: 0.25
        }}>
          <Grid item xs={3} sx={{ height: '100%', p: 0.25 }}>
            <Card sx={cardStyle}>
              <CardHeader 
                title="年碳排量"
                bgColor="error.main"
                onExpand={() => console.log('Expand work order')}
              />
              <CardContent sx={{ 
                flexGrow: 1,
                p: 1,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                pb: 3,
                height: '100%',
                overflow: 'visible'
              }}>
                <CarbonEmissionChart 
                  data={carbonData}
                  total={totalCarbon}
                  width="100%"
                  height="95%"
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={3} sx={{ height: '100%', p: 0.25 }}>
            <Card sx={cardStyle}>
              <CardHeader 
                title="月排碳量"
                bgColor="error.main"
                onExpand={() => console.log('Expand closure')}
              />
              <CardContent sx={{ 
                flexGrow: 1,
                p: 1,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                pb: 3,
                height: '100%',
                overflow: 'visible'
              }}>
                <CarbonEmissionChart 
                  data={monthCarbonData}
                  total={monthTotalCarbon}
                  width="100%"
                  height="95%"
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={3} sx={{ height: '100%', p: 0.25 }}>
            <Card sx={cardStyle}>
              <CardHeader 
                title="日排碳量"
                bgColor="error.main"
                onExpand={() => console.log('Expand rate')}
              />
              <CardContent sx={{ 
                flexGrow: 1,
                p: 1,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                pb: 3,
                height: '100%',
                overflow: 'visible'
              }}>
                <CarbonEmissionChart 
                  data={dayCarbonData}
                  total={dayTotalCarbon}
                  width="100%"
                  height="95%"
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={3} sx={{ height: '100%', p: 0.25 }}>
            <Card sx={{ ...cardStyle }}>
              <CardHeader 
                title="發電熱力圖"
                bgColor="error.main"
                onExpand={() => console.log('Expand SLA')}
              />
              <CardContent sx={{ 
                flexGrow: 1,
                mt: 1.5,
                height: 'calc(100% - 35px)',
                backgroundColor: 'transparent'
              }}>
                <HeatMap 
                  data={heatMapData}
                  style={{ height: 200, backgroundColor: 'transparent' }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 中部图表卡片 - 占4份 */}
        <Grid container spacing={1} sx={{ 
          flex: '4 1 0%',
          overflow: 'auto',
          mb: 0.25,
          height: '33%'
        }}>
          <Grid item xs={4} sx={{ height: '100%', p: 0.25 }}>
            <Card sx={cardStyle}>
              <CardHeader 
                title="年電力產出量"
              />
              {/* 圖表區域 */}
              <CardContent sx={{ 
                flexGrow: 1,
                p: 0,
                '&:last-child': { pb: 0 },
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100% - 35px)',
                mb: '1px',
                mt: '30px',
                // backdropFilter: 'blur(px)'
              }}>
                <Box sx={{ 
                  height: '100%',
                  width: '100%',
                  position: 'relative',
                  pt: 5,
                  display: 'flex',          // 添加 flex 佈局
                  flexDirection: 'column', // 垂直排列
                  gap: 1                   // 元素間距
                }}>
                  {/* 效率指標 */}
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 0.5,
                    pr: 2,
                    position: 'absolute',
                    top: 2,
                    right: 10,
                    zIndex: 1,
                    justifyContent: 'flex-end'
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      發電效率
                    </Typography>
                    <Typography variant="h3" sx={{ 
                      fontWeight: 'bold',
                      color: 'red',
                      fontStyle: 'italic'
                    }}>
                      52.3
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      %
                    </Typography>
                  </Box>
                  
                  <BarLine
                    dataScope="all"
                    timeRange="year"
                    width="100%"
                    height="100%"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4} sx={{ height: '100%', p: 0.25 }}>
            <Card sx={cardStyle}>
              <CardHeader 
                title="季電力產出量"
                onExpand={() => console.log('Expand quarterly')}
              />
              <CardContent sx={{ 
                flexGrow: 1,
                p: 0,
                '&:last-child': { pb: 0 },
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100% - 35px)',
                mb: '1px',
                mt: '30px'
              }}>
                {/* 效率显示区块 - 与年度卡片完全一致 */}
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 0.5,
                  pr: 2,
                  position: 'absolute',
                  top: 2,
                  right: 10,
                  zIndex: 1,
                  justifyContent: 'flex-end'
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    發電效率
                  </Typography>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 'bold',
                    color: 'red',
                    fontStyle: 'italic'
                  }}>
                    48.9
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    %
                  </Typography>
                </Box>

                {/* 图表容器 - 与年度卡片相同结构 */}
                <Box sx={{ 
                  height: '100%',
                  width: '100%',
                  position: 'relative',
                  pt: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}>
                  <BarLine
                    dataScope="all"
                    timeRange="quarter"
                    width="100%"
                    height="100%"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4} sx={{ height: '100%', p: 0.25 }}>
            <Card sx={cardStyle}>
              <CardHeader 
                title="月電力產出量"
                onExpand={() => console.log('Expand monthly')}
              />
              <CardContent sx={{ 
                flexGrow: 1,
                p: 0,
                '&:last-child': { pb: 0 },
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100% - 35px)',
                mb: '1px',
                mt: '30px'
              }}>
                {/* 效率显示区块 */}
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 0.5,
                  pr: 2,
                  position: 'absolute',
                  top: 2,
                  right: 10,
                  zIndex: 1,
                  justifyContent: 'flex-end'
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    發電效率
                  </Typography>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 'bold',
                    color: 'red',
                    fontStyle: 'italic'
                  }}>
                    50.1
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    %
                  </Typography>
                </Box>

                {/* 图表容器 */}
                <Box sx={{ 
                  height: '100%',
                  width: '100%',
                  position: 'relative',
                  pt: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}>
                  <BarLine
                    dataScope="all"
                    timeRange="month"
                    year="2024"
                    month="12"
                    width="100%"
                    height="100%"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 底部图表卡片 - 占5份 */}
        <Grid container spacing={1} sx={{ 
          flex: '5 1 0%',
          overflow: 'auto'
        }}>
          <Grid item xs={8} sx={{ height: '100%', p: 0.25 }}>
            <Card sx={cardStyle}>
              <CardHeader 
                title="日發電量統計"
                headerWidth="30%"
                onExpand={() => console.log('Expand daily')}
              />
              <CardContent sx={{ 
                flexGrow: 1,
                p: 0,
                '&:last-child': { pb: 0 },
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100% - 35px)',
                mb: '1px',
                mt: '30px'
              }}>
                {/* 图表容器 */}
                <Box sx={{ 
                  height: '100%',
                  width: '100%',
                  position: 'relative',
                  pt: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}>
                  <DailyPowerChart
                    date="2025-01-31"
                    width="100%"
                    height="100%"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4} sx={{ height: '100%', p: 0.25 }}>
            <Card sx={cardStyle}>
              <CardHeader 
                title="日電力產出比例"
                bgColor="primary.light"
                onExpand={() => console.log('Expand power ratio')}
              />
              <CardContent sx={{ 
                flexGrow: 1,
                pt: 3,
                '&:last-child': { pb: 0 },
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100% - 25px)',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PowerRatioChart
                  date="2025-01-31"
                  width="85%"
                  height="85%"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard; 