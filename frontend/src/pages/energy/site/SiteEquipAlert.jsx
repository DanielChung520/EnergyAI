import React, { useState, useEffect } from 'react';
import { 
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardHeader,
  CardContent,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SignalLight from '../../../components/SignalLight';

// 統一樣式變數
const STYLES = {
  fontSize: {
    title: '1.1rem',
    content: '0.75rem'
  },
  padding: {
    cell: 0.5,  // TableCell padding
    header: 1    // CardHeader padding
  },
  height: {
    row: '32px',      // TableRow height
    header: '40px',   // Header height
    content: '24px'   // Content box height
  },
  width: {
    table: '600px',   // Table min width
    container: '800px',    // 減小容器寬度
    nameCell: '22%',       // 減小名稱欄位寬度
    statusCell: '28%'      // 增加狀態欄位寬度以容納時間戳
  },
  size: {
    signal: 18        // SignalLight size
  },
  spacing: {
    gap: 1           // Flex items gap
  },
  hover: {
    backgroundColor: '#f5f5f5',  // 懸停時的背景色
    transition: 'background-color 0.2s',  // 添加過渡效果
    cursor: 'pointer'  // 改變鼠標樣式
  }
};

const SiteEquipAlert = ({ onClose }) => {
  const [alarmData, setAlarmData] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);  // 添加懸停狀態

  // 修改模擬數據部分
  useEffect(() => {
    const mockAlarmData = [
      { id: 1, name: 'Over rotor speed', status: 'grey', lastAlarmTime: '' },
      { id: 2, name: 'Over DC voltage', status: 'red', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 3, name: 'Yaw VFD fault', status: 'yellow', lastAlarmTime: '2024/03/20 14:32:15' }, // 添加黃色警戒狀態
      { id: 4, name: 'Generator cut out', status: 'red', lastAlarmTime: '2024/03/20 14:35:12' },
      { id: 5, name: 'Load cut out', status: 'grey', lastAlarmTime: '' },
      { id: 6, name: 'Over wind speed', status: 'red', lastAlarmTime: '2024/03/20 14:40:18' },
      { id: 7, name: 'Anemometer fault', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 8, name: 'Wind vane fault', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 9, name: 'Over temperature in nacelle', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 10, name: 'Over temperature of power module', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 11, name: 'Safety chain alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 12, name: 'On-grid inverter alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 13, name: 'Dump load alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 14, name: 'Controller power off', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 15, name: 'Over safety rotor speed', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 16, name: 'Yaw system alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 17, name: 'Stop PCS alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 18, name: 'Over temperature of Dump load', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 19, name: 'Sys Para Missing', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 20, name: 'DP Load Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 21, name: 'Manual Shorted CutIn', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 22, name: 'Unloading Resistance Break Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 23, name: 'Mechanical Brakes Action Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 24, name: 'Mechanical Brakes Release Action Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 25, name: 'Mechanical Brakes System Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 26, name: 'Mechanical Brake Energy Low Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 27, name: 'Over Max DC Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 28, name: 'Over Max DC Power Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 29, name: 'Short Circuit Contactor Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 30, name: 'Manual CW Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 31, name: 'Stoping Short Circuit Contactor Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 32, name: 'Nacelle Communication Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 33, name: 'Yaw Contactor Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 34, name: 'Yaw Angle Twist Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 35, name: 'Yaw QASth Twist Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 36, name: 'Starting Contactor Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 37, name: 'Generator RMP Error Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 38, name: 'Lightning Protection Switch Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 39, name: 'Stop Mechanical Brake Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 40, name: 'Brake CapCharging Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 41, name: 'Noise RedTempH Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' },
      { id: 42, name: 'Brake CapCharging Alarm', status: 'grey', lastAlarmTime: '2024/03/20 14:30:25' }
    ];

    setAlarmData(mockAlarmData);
  }, []);

  // 修改 SignalLight 的顏色邏輯
  const getSignalColor = (status) => {
    switch (status) {
      case 'red':
        return 'red';
      case 'yellow':
        return 'yellow';
      case 'grey':
      default:
        return 'green';
    }
  };

  return (
    <Box sx={{ p: 1, minWidth: STYLES.width.container }}>
      <Card>
        <CardHeader 
          title="警報狀態"
          action={
            <IconButton 
              onClick={onClose}
              size="small"
              sx={{ 
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          }
          sx={{
            backgroundColor: theme => theme.palette.primary.main,
            color: 'white',
            py: STYLES.padding.header,
            '& .MuiCardHeader-title': {
              fontSize: STYLES.fontSize.title,
              fontWeight: 'bold'
            },
            '& .MuiCardHeader-action': {
              margin: 0,
              alignSelf: 'center'
            }
          }}
        />
        <CardContent sx={{ p: 1 }}>
          <TableContainer component={Paper}>
            <Table size="small" sx={{ minWidth: STYLES.width.table }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell width={STYLES.width.nameCell} align="center">Alert Item</TableCell>
                  <TableCell width={STYLES.width.statusCell} align="center">Alert Time</TableCell>
                  <TableCell width={STYLES.width.nameCell} align="center">Alert Item</TableCell>
                  <TableCell width={STYLES.width.statusCell} align="center">Alert Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: Math.ceil(alarmData.length / 2) }).map((_, index) => (
                  <TableRow 
                    key={index}
                    sx={{ 
                      height: STYLES.height.row,
                      ...(hoveredRow === index && STYLES.hover),  // 應用懸停樣式
                      '&:hover': STYLES.hover  // 直接在行上應用懸停樣式
                    }}
                    onMouseEnter={() => setHoveredRow(index)}  // 設置懸停狀態
                    onMouseLeave={() => setHoveredRow(null)}   // 清除懸停狀態
                  >
                    {/* 左側警報項目 */}
                    <TableCell 
                      sx={{ 
                        py: STYLES.padding.cell,
                        borderRight: '1px solid rgba(224, 224, 224, 1)'  // 添加垂直分隔線
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: STYLES.spacing.gap,
                        height: STYLES.height.content
                      }}>
                        <SignalLight 
                          color={getSignalColor(alarmData[index * 2]?.status)}
                          size={STYLES.size.signal}
                          active={alarmData[index * 2]?.status !== 'grey'}
                        />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: STYLES.fontSize.content,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {alarmData[index * 2]?.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        py: STYLES.padding.cell,
                        borderRight: '1px solid rgba(224, 224, 224, 1)'  // 添加垂直分隔線
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: STYLES.fontSize.content }}
                      >
                        {alarmData[index * 2]?.status !== 'grey' ? alarmData[index * 2]?.lastAlarmTime : ''}
                      </Typography>
                    </TableCell>

                    {/* 右側警報項目 */}
                    <TableCell 
                      sx={{ 
                        py: STYLES.padding.cell,
                        borderRight: '1px solid rgba(224, 224, 224, 1)'  // 添加垂直分隔線
                      }}
                    >
                      {alarmData[index * 2 + 1] && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: STYLES.spacing.gap,
                          height: STYLES.height.content
                        }}>
                          <SignalLight 
                            color={getSignalColor(alarmData[index * 2 + 1]?.status)}
                            size={STYLES.size.signal}
                            active={alarmData[index * 2 + 1]?.status !== 'grey'}
                          />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: STYLES.fontSize.content,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {alarmData[index * 2 + 1].name}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        py: STYLES.padding.cell,
                        borderRight: '1px solid rgba(224, 224, 224, 1)'  // 添加垂直分隔線
                      }}
                    >
                      {alarmData[index * 2 + 1] && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: STYLES.fontSize.content }}
                        >
                          {alarmData[index * 2 + 1]?.status !== 'grey' ? alarmData[index * 2 + 1]?.lastAlarmTime : ''}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SiteEquipAlert;
