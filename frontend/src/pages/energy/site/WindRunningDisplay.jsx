import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableRow, 
  Paper,
  Box
} from '@mui/material';

// 定義統一的樣式常量
const TABLE_STYLES = {
  fontSize: '0.8rem',            // 統一字體大小
  cellHeight: '25px',            // 統一行高
  cellWidth: '10%',              // 統一單元格寬度
  cellPadding: '4px 4px',        // 統一內邊距
  borderColor: '#2196f3',        // 統一邊框顏色
  labelBgColor: '#e3f2fd',       // 統一標籤背景色
  valueColor: '#1976d2',         // 統一數值顏色
  fontWeight: 600                // 統一字體粗細
};

const WindRunningDisplay = ({ data }) => {
  // 定義表格數據結構
  const tableData = [
    {
      label: 'Control/Run Mode',
      value: data?.controlMode || 'Remote/Auto',
      label2: 'WindSpeed_5M',
      value2: data?.windSpeed5m || '6.7m/s',
      label3: 'Dir Yaw/Twist',
      value3: data?.dirYawTwist || 'CCW/--',
      label4: 'Day Yield',
      value4: data?.dayYield || '5.89kWh',
      label5: 'Gen A/B/Load Temp.',
      value5: data?.genTemp || '4.8/4.7/7.2°C'
    },
    {
      label: 'Alarm/Run Status',
      value: data?.alarmStatus || 'OK/Pause',
      label2: 'WindDir_1s',
      value2: data?.windDir1s || '107.5°',
      label3: 'Yaw Aim/Pass',
      value3: data?.yawAimPass || '726.4/350.3°',
      label4: 'Month Yield',
      value4: data?.monthYield || '5.89kWh',
      label5: 'Nace Temp.',
      value5: data?.naceTemp || '6.6°C'
    },
    {
      label: 'Yaw/Pitch',
      value: data?.yawPitch || 'Yawing/--',
      label2: 'WindDir_10M',
      value2: data?.windDir10m || '143.6°',
      label3: 'Twist Angle',
      value3: data?.twistAngle || '376.0°',
      label4: 'Year Yield',
      value4: data?.yearYield || '2416.33kWh',
      label5: 'Power Pitch/Yaw',
      value5: data?.powerPitchYaw || '0.0/0.0kW'
    },
    {
      label: 'N_Heater/DumpLoad',
      value: data?.heaterDumpLoad || '--/Dumpload',
      label2: 'Load Voltage',
      value2: data?.loadVoltage || '0.0V',
      label3: 'Pitch Angle',
      value3: data?.pitchAngle || '0.0°',
      label4: 'Total Yield',
      value4: data?.totalYield || '298071.20kWh',
      label5: 'Time',
      value5: data?.time || '25-02-01 12:09:41'
    }
  ];

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <TableContainer 
        component={Paper} 
        sx={{ 
          height: '100%',
          backgroundColor: '#ffffff',
          '& .MuiTableCell-root': {
            borderColor: TABLE_STYLES.borderColor,
            padding: TABLE_STYLES.cellPadding,
            fontSize: TABLE_STYLES.fontSize,
            lineHeight: 1,
          },
          '& .MuiTable-root': {
            minWidth: 'auto',
          },
          '& .MuiTableRow-root': {
            height: TABLE_STYLES.cellHeight,
          }
        }}
      >
        <Table size="small" sx={{ 
          tableLayout: 'fixed',
          '& td, & th': {
            width: TABLE_STYLES.cellWidth,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }
        }}>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow key={index} sx={{ height: TABLE_STYLES.cellHeight }}>
                {/* 標籤單元格 */}
                {[
                  { label: row.label, value: row.value },
                  { label: row.label2, value: row.value2 },
                  { label: row.label3, value: row.value3 },
                  { label: row.label4, value: row.value4 },
                  { label: row.label5, value: row.value5 }
                ].map((item, cellIndex) => (
                  <React.Fragment key={cellIndex}>
                    <TableCell 
                      component={cellIndex === 0 ? "th" : "td"}
                      scope={cellIndex === 0 ? "row" : undefined}
                      sx={{ 
                        backgroundColor: TABLE_STYLES.labelBgColor,
                        fontWeight: TABLE_STYLES.fontWeight,
                        width: TABLE_STYLES.cellWidth,
                        height: TABLE_STYLES.cellHeight
                      }}
                    >
                      {item.label}
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        width: TABLE_STYLES.cellWidth,
                        color: TABLE_STYLES.valueColor,
                        height: TABLE_STYLES.cellHeight
                      }}
                    >
                      {item.value}
                    </TableCell>
                  </React.Fragment>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default WindRunningDisplay;
