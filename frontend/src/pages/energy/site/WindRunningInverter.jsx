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

const WindRunningInverter = ({ data }) => {
  // 定義表格數據結構
  const tableData = [
    {
      label: 'Run State',
      value: data?.runState || 'Stop',
      label2: '3-Phase Voltage',
      value2: data?.voltage || '207.7/207.9/208.2V',
      label3: 'Grid Fre.',
      value3: data?.gridFre || '50.06Hz',
      label4: 'Turbine Fre.',
      value4: data?.turbineFre || '0.00Hz',
      label5: 'Board Temp.',
      value5: data?.boardTemp || '15.8°C'
    },
    {
      label: 'Pro.State',
      value: data?.proState || 'Normal',
      label2: '3-Phase Current',
      value2: data?.current || '0.0/0.0/0.0A',
      label3: 'Power Factor',
      value3: data?.powerFactor || '1.00',
      label4: 'Panel Temp.',
      value4: data?.panelTemp || '10.4°C',
      label5: 'IGBT_TA Temp.',
      value5: data?.igbtTemp || '13.7°C'
    },
    {
      label: 'Grid State',
      value: data?.gridState || 'P.S',
      label2: 'Output Power',
      value2: data?.outputPower || '0.0/0.0kW/0.0kVar',
      label3: 'Fan Current',
      value3: data?.fanCurrent || '0.00A',
      label4: 'Torque',
      value4: data?.torque || '0.0Nm',
      label5: 'Transformer Temp.',
      value5: data?.transformerTemp || '15.7°C'
    },
    {
      label: 'Ctrl.Mode',
      value: data?.ctrlMode || 'OffLine',
      label2: 'Zero Sequence',
      value2: data?.zeroSequence || '0.1V/0.0A',
      label3: 'Negative Sequence',
      value3: data?.negativeSequence || '0.0V/0.0A',
      label4: 'Running',
      value4: data?.running || '47 days 22:12:43',
      label5: 'Time',
      value5: data?.time || '25-02-01 12:27:08'
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

export default WindRunningInverter;
