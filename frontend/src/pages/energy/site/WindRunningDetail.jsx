import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardHeader, CardContent, Switch, Button, Grow, Backdrop, Slide, Dialog, IconButton, Badge } from '@mui/material';
import GaugeChart from '../../../components/GaugeChart';
import Compass from '../../../components/Compass';
import IOSSwitch from '../../../components/SwitchIOS';
import SignalLight from '../../../components/SignalLight';
import dayCloudy from '../../../assets/weather/cloudy.svg?url';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import WindRunningDisplay from './WindRunningDisplay';
import WindRunningInverter from './WindRunningInverter';
import PowerGenChart from '../Chart/PowerGenChart';
import SiteEquipAlert from './SiteEquipAlert';
import WebPageViewer from '../../../components/WebPageViewer';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';

// 創建自定義主題
const theme = createTheme({
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#e3f2fd'
        }
      }
    }
  }
});

// 添加一個通用的卡片樣式
const cardStyle = {
  height: '100%',
  bgcolor: '#e3f2fd'  // 設置卡片背景顏色
};

// 添加一個自定義的 Slide 轉場效果
const SlideTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const WindRunningDetail = () => {
  const [windSpeed, setWindSpeed] = useState(0);
  const [power, setPower] = useState(0);
  const [rpm, setRpm] = useState(0);
  const [error, setError] = useState(null);
  const [instantWindSpeed, setInstantWindSpeed] = useState(0);
  const [alarmStatus, setAlarmStatus] = useState('grey');  // grey, yellow, red
  const [comStatus, setComStatus] = useState(false);  // false: grey, true: green
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [webPageOpen, setWebPageOpen] = useState(false);
  const [webPageUrl, setWebPageUrl] = useState('');
  const [webPageTitle, setWebPageTitle] = useState('');
  const titleFontSize = '1rem';
  const gridSpacing = 1;
  const [alertCount, setAlertCount] = useState(3);  // 添加警示數量 state

  // header 樣式配置
  const headerStyle = {
    backgroundColor: theme => alpha(theme.palette.primary.main, 0.75),  // 使用 alpha 函數
    color: 'white',
    height: '32px',
    '& .MuiCardHeader-title': {
      fontSize: titleFontSize,
      fontWeight: 'bold',
    },
    '& .MuiCardHeader-content': {
      margin: 0,
    },
    padding: '4px 16px',
  };

  // 生成隨機風速 (0-30 m/s)
  const getRandomWindSpeed = () => {
    return (Math.random() * 30).toFixed(2);
  };

  // 模擬數據獲取
  const fetchData = async () => {
    try {
      // 使用模擬數據
      setWindSpeed(12.83); // 模擬風速
      setPower(19.45); // 模擬功率
      setRpm(59.53); // 模擬轉速
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('獲取數據失敗');
    }
  };

  useEffect(() => {
    fetchData();
    // 每10秒更新一次風速
    const interval = setInterval(() => {
      setInstantWindSpeed(getRandomWindSpeed());
    }, 10000);

    // 每分鐘切換 Alarm 狀態
    const alarmInterval = setInterval(() => {
      setAlarmStatus(prev => {
        switch(prev) {
          case 'grey': return 'yellow';
          case 'yellow': return 'red';
          case 'red': return 'grey';
          default: return 'grey';
        }
      });
    }, 60000);

    // 每秒切換 Com 狀態
    const comInterval = setInterval(() => {
      setComStatus(prev => !prev);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(alarmInterval);
      clearInterval(comInterval);
    };
  }, []);

  const handleOpenWebPage = (url, title) => {
    setWebPageUrl(url);
    setWebPageTitle(title);
    setWebPageOpen(true);
  };

  const handleOpenWeather = () => {
    handleOpenWebPage(
      'https://www.cwa.gov.tw/V8/C/W/County/County.html?CID=63',
      '天氣預報'
    );
  };

  // 添加處理風速觀測的函數
  const handleOpenWindSpeed = () => {
    handleOpenWebPage(
      'https://www.cwa.gov.tw/V8/C/W/WindSpeed/WindSpeed_All.html?CID=C&StationID=C',
      '風速觀測'
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '96vh', p: 1, backgroundColor: '#b0bec5' }}>
        {/* 上半部分 (60%) */}
        <Box sx={{ flex: 6 }}>
          <Grid container spacing={1} sx={{ height: '100%' }}>
            {/* 左側區域 (70%) */}
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* 左上區塊 (20%) */}
                <Box sx={{ flex: 4, mb: 0 }}>
                  <Grid container spacing={gridSpacing} sx={{ height: '100%' }}>
                    {/* 左側 Power Generator - This Month */}
                    <Grid item xs={12} md={6}>
                      <Card sx={cardStyle}>
                        <CardHeader 
                          title="Power Generator - This Month"
                          sx={headerStyle}
                        />
                        <CardContent sx={{ 
                          height: 'calc(100% - 32px)',
                          p:0,  // 減少內邊距
                          '&:last-child': {
                            pb:0  // 確保底部內邊距也減少
                          }
                        }}>
                          <PowerGenChart 
                            height="100%"  // 使用百分比高度
                            type="month"
                            darkMode={false}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    {/* 右側 Power Generation - Today */}
                    <Grid item xs={12} md={6}>
                      <Card sx={cardStyle}>
                        <CardHeader 
                          title="Power Generation - Today"
                          sx={headerStyle}
                        />
                        <CardContent sx={{ 
                          height: 'calc(100% - 32px)',
                          p: 0,  // 減少內邊距
                          '&:last-child': {
                            pb: 0  // 確保底部內邊距也減少
                          }
                        }}>
                          <PowerGenChart 
                            height="100%"
                            type="day"
                            darkMode={false}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>

                {/* 運行數據區塊 (80%) */}
                <Box sx={{ flex: 6, height: 'calc(100% - 8px)' }}>
                  <Card sx={{ ...cardStyle, height: '100%' }}>
                    <CardHeader 
                      title="運行數據"
                      sx={headerStyle}
                    />
                    <CardContent sx={{  
                      height: 'calc(100% - 32px)',
                      p: 1,
                      '&:last-child': {
                        pb: 1
                      }
                    }}>
                      <Grid 
                        container 
                        spacing={gridSpacing} 
                        justifyContent="space-evenly"
                        alignItems="center"
                        sx={{ height: '100%' }}
                      >
                        <Grid 
                          item 
                          xs={12} 
                          md={4} 
                          sx={{ 
                            display: 'flex',
                            justifyContent: 'center',
                            height: '100%'
                          }}
                        >
                          <GaugeChart
                            title="風速"
                            value={windSpeed}
                            min={0}
                            max={30}
                            unit="m/s"
                            colors={['#91CC75', '#FAC858', '#EE6666']}
                            size="100%"
                          />
                        </Grid>
                        <Grid 
                          item 
                          xs={12} 
                          md={4}
                          sx={{ 
                            display: 'flex',
                            justifyContent: 'center'
                          }}
                        >
                          <GaugeChart
                            title="功率"
                            value={power}
                            min={0}
                            max={1000}
                            unit="kW"
                            colors={['#91CC75', '#FAC858', '#EE6666']}
                            size="300px"
                          />
                        </Grid>
                        <Grid 
                          item 
                          xs={12} 
                          md={4}
                          sx={{ 
                            display: 'flex',
                            justifyContent: 'center'
                          }}
                        >
                          <GaugeChart
                            title="轉速"
                            value={rpm}
                            min={0}
                            max={3000}
                            unit="RPM"
                            colors={['#91CC75', '#FAC858', '#EE6666']}
                            size="300px"
                          />
                        </Grid>
                      </Grid>
                      {error && (
                        <Typography color="error" sx={{ mt: 0 }}>
                          {error}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Grid>
            {/* 右側區域 (30%) */}
            <Grid item xs={12} md={4}>
              <Grid container spacing={gridSpacing} sx={{ height: '100%' }}>
                {/* 右側區域 (70%) */}
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '101%' }}>
                    {/* Weather 區塊 (30%) */}
                    <Box sx={{ flex: 4, mb: 1 }}>
                      <Card sx={cardStyle}>
                        <CardHeader 
                          title="Weather"
                          action={
                            <IconButton 
                              size="small"
                              onClick={handleOpenWeather}
                              sx={{ 
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                                }
                              }}
                            >
                              <OpenInFullIcon sx={{ fontSize: '1.2rem' }} />
                            </IconButton>
                          }
                          sx={headerStyle}
                        />
                        <CardContent sx={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          justifyContent: 'space-between',
                          paddingBottom: '8px'
                        }}>
                          <Box sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: -1
                          }}>
                            <Box>
                              <Typography variant="h1" sx={{ 
                                fontSize: '4rem',
                                fontWeight: 'bold',
                                lineHeight: 0.9
                              }}>
                                23.5
                                <Typography 
                                  component="span" 
                                  variant="h5" 
                                  sx={{ 
                                    verticalAlign: 'top',
                                    fontWeight: 'normal',
                                    lineHeight: 1.2
                                  }}
                                >
                                  °C
                                </Typography>
                              </Typography>
                            </Box>
                            <Box sx={{ 
                              width: 100, 
                              height: 100,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <img 
                                src={dayCloudy} 
                                alt="weather icon" 
                                style={{ 
                                  width: '100%', 
                                  height: '100%',
                                  objectFit: 'contain'  // 確保圖片保持比例
                                }} 
                              />
                            </Box>
                          </Box>
                          <Typography variant="body2" sx={{ 
                            textAlign: 'left',
                            color: 'text.secondary',
                            mb: 1
                          }}>
                            天氣觀測時間：{new Date().toLocaleString('zh-TW')}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>

                    {/* Nacelle 區塊 (70%) */}
                    <Box sx={{ flex: 6, mb: 0 }}>
                      <Card sx={cardStyle}>
                        <CardHeader 
                          title="Nacelle"
                          action={
                            <IconButton 
                              size="small"
                              onClick={handleOpenWindSpeed}
                              sx={{ 
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                                }
                              }}
                            >
                              <OpenInFullIcon sx={{ fontSize: '1.2rem' }} />
                            </IconButton>
                          }
                          sx={headerStyle}
                        />
                        <CardContent sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: 'calc(100% - 50px)',
                          padding: '6px'
                        }}>
                          <Box sx={{ 
                            width: '100%',
                            textAlign: 'left',
                            mb: 1,
                            px: 1
                          }}>
                            <Typography variant="body1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                              Measurement Height:{' '}
                              <Box component="span" sx={{ 
                                color: 'red',
                                fontWeight: 'bold',
                                ml: 1
                              }}>
                                100 meters
                              </Box>
                            </Typography>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                              Wind Speed:{' '}
                              <Box component="span" sx={{ 
                                color: 'red',
                                fontWeight: 'bold',
                                ml: 1
                              }}>
                                {instantWindSpeed} m/s
                              </Box>
                            </Typography>
                          </Box>
                          <Box sx={{ // 圖表區塊
                            width: '80%',
                            height: 'calc(100% - 80px)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 1
                          }}>
                            <Compass direction={40} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  </Box>
                </Grid>

                {/* Operate 區塊 (30%) */}
                <Grid item xs={12} md={4}>
                  <Card sx={cardStyle}>
                    <CardHeader 
                      title="Operate"
                      sx={headerStyle}
                    />
                    <CardContent>
                      <Grid container spacing={1} direction="column" alignItems="center">
                        {['E-Stope', 'Reset', 'Auto', 'Stop', 'CW-YAW', 'CCW-YAW'].map((label) => (
                          <Grid item key={label} sx={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 0.5,
                            mt: 1.5 
                          }}>
                            <IOSSwitch width={90} height={40} />
                            <Typography variant="body2" sx={{ 
                              fontSize: '14px',
                              fontWeight: 'bold'
                            }}>
                              {label}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>

        {/* 下半部分 (40%) */}
        <Box sx={{ flex: 4, mt: 0 }}>
          <Grid container spacing={gridSpacing} sx={{ height: '100%' }}>
            {/* 左側區域 (85%) */}
            <Grid item xs={12} md={10.65}>
              <Grid container spacing={gridSpacing} direction="column" sx={{ height: '100%' }}>
                {/* Data Display 上半部分 */}
                <Grid item xs={6}>
                  <Card sx={cardStyle}>
                    <CardHeader 
                      title="Data Display"
                      sx={headerStyle}
                    />
                    <CardContent sx={{ height: 'calc(100% - 20px)',mt: 0.5, p: 1 }}>
                      <WindRunningDisplay data={
                        {
                          // 這裡可以傳入實際的數據
                        }
                      } />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Inverter Information 下半部分 */}
                <Grid item xs={6}>
                  <Card sx={cardStyle}>
                    <CardHeader 
                      title="Inverter Information"
                      sx={headerStyle}
                    />
                    <CardContent sx={{ height: 'calc(100% - 20px)', mt: 0.5, p: 1 }}>
                      <WindRunningInverter data={
                        {
                          // 這裡可以傳入實際的數據
                        }
                      } />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Light 區域 (15%) */}
            <Grid item xs={12} md={1.35}>
              <Card sx={cardStyle}>
                <CardHeader 
                  title="Light"
                  sx={headerStyle}
                />
                <CardContent sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Box sx={{ width: '100%', position: 'relative' }}>
                    <Badge 
                      badgeContent={3} 
                      color="error"
                      sx={{
                        width: '100%',
                        '& .MuiBadge-badge': {
                          right: -3,
                          top: 3,
                          border: '2px solid #e3f2fd',
                          padding: '0 4px',
                        }
                      }}
                    >
                      <Badge
                        badgeContent={1}
                        sx={{
                          width: '100%',
                          '& .MuiBadge-badge': {
                            backgroundColor: '#ed6c02',
                            color: 'white',
                            border: '2px solid #e3f2fd',
                            padding: '0 4px',
                            right: -3,
                            top: 'auto',
                            bottom: -8
                          }
                        }}
                      >
                        <Button
                          variant="contained"
                          sx={{
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            padding: '4px 12px',
                            backgroundColor: theme => theme.palette.primary.main,
                            color: 'white',
                            '&:hover': {
                              backgroundColor: theme => theme.palette.primary.dark,
                            },
                            width: '100%',
                            mb: 1
                          }}
                          onClick={(event) => {
                            event.stopPropagation();
                            setAlertDialogOpen(true);
                          }}
                        >
                          顯示所有信號
                        </Button>
                      </Badge>
                    </Badge>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 0.5,
                    mb: 0.5
                  }}>
                    <SignalLight color="green" size={50} active={true} />
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      Run
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 0.5 
                  }}>
                    <SignalLight 
                      color={alarmStatus === 'grey' ? 'red' : alarmStatus} 
                      size={50} 
                      active={alarmStatus !== 'grey'} 
                    />
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      Alarm
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 0.5 
                  }}>
                    <SignalLight color="green" size={50} active={comStatus} />
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      Com
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Backdrop
                sx={{ 
                  color: '#fff', 
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.2)'
                }}
                open={alertDialogOpen}
                onClick={() => setAlertDialogOpen(false)}
              >
                <Dialog
                  open={alertDialogOpen}
                  onClose={() => setAlertDialogOpen(false)}
                  maxWidth="md"
                  fullWidth
                  TransitionComponent={SlideTransition}
                  TransitionProps={{
                    timeout: 300
                  }}
                  PaperProps={{
                    sx: {
                      height: '82vh',
                      maxHeight: '82vh',
                      position: 'fixed',  // 改為 fixed 定位
                      right: '2%',        // 距離右側的距離
                      top: '9%',          // 距離頂部的距離
                      m: 0,
                      width: '80%',       // 設置寬度
                      borderRadius: 1
                    }
                  }}
                  sx={{
                    '& .MuiDialog-container': {
                      justifyContent: 'flex-end',  // 將 Dialog 靠右對齊
                      alignItems: 'flex-start',    // 將 Dialog 靠上對齊
                    }
                  }}
                >
                  <SiteEquipAlert onClose={() => setAlertDialogOpen(false)} />
                </Dialog>
              </Backdrop>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Dialog
        open={webPageOpen}
        onClose={() => setWebPageOpen(false)}
        maxWidth={false}
        TransitionComponent={Slide}
        TransitionProps={{
          direction: "left",
          timeout: 300
        }}
        PaperProps={{
          sx: {
            height: '768px',
            width: '1024px',
            position: 'fixed',
            right: '2%',
            top: '9%',
            m: 0,
            borderRadius: 1
          }
        }}
        sx={{
          '& .MuiDialog-container': {
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
          }
        }}
      >
        <WebPageViewer 
          url={webPageUrl}
          title={webPageTitle}
          onClose={() => setWebPageOpen(false)}
        />
      </Dialog>
    </ThemeProvider>
  );
};

export default WindRunningDetail;
