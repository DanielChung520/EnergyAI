import React from 'react';
import PropTypes from 'prop-types';
import WindPowerComp from './WindPowerComp';
import InverterComp from './InverterComp';
import TowerComp from './TowerComp';
import WindTurbine from './WindTurbine';

const BASE_COLOR = 'rgba(6, 43, 98, 0.85)';  // 統一的淡藍色

// 首先添加狀態映射常量
const STATUS_MAPPINGS = {
  IW_SystemCurrentCtrlMode: {
    1: '本地',
    2: '遠程'
  },
  IW_SystemCurrentRunMode: {
    1: '手動停機',
    2: '自動運行',
    3: '維護模式',
    4: '停機模式'
  },
  IW_SystemAlarmStatus: {
    1: '機組正常',
    2: '機組告警',
    3: '機組故障'
  },
  IW_OPSysRunStatus: {
    1: '啟動狀態',
    2: '運行狀態',
    3: '暫停狀態',
    4: '無風停止',
    5: '急停停機',
    6: '限電停機',
    7: '未知'
  },
  IW_SysCurYawAction: {
    1: '偏航啟動',
    2: '小風解纜',
    3: '停機解纜',
    4: '無動作',
    5: '90度熬風'
  },
  IW_SysCurPitchAction: {
    0: '無動作',
    1: '正在變槳'
  },
  IW_SysCurHeatAction: {
    0: '無動作',
    1: '正在加熱'
  },
  IW_SysCurDumploadAction: {
    0: '無動作',
    1: '正在泄荷'
  }
};

const WindPowerStation = ({
  data = {
    // 只保留四個主要狀態的默認值
    IW_SystemCurrentCtrlMode: 1,
    IW_SystemCurrentRunMode: 2,
    IW_SystemAlarmStatus: 1,
    IW_OPSysRunStatus: 2,
    // ... 其他原有的默認值 ...
    Time: new Date().toLocaleString(), // 添加時間默認值
  },
  name = '',
  onShowTurbine = () => {}
}) => {
  // 從 data 對象中提取所需的數據
  const {
    FD_WindStatus: windStatus = 'N',
    FD_InverterStatus: inverterStatus = 'N',
    FD_TowerStatus: towerStatus = 'N',
    FD_RotorSpeed: rotationSpeed = 3,
    FD_WindSpeed_3s: WindSpeed = 5,
    FD_OutputPower = 100,  // 修改后的字段
    PowerPac = 50,         // 新增字段
    FD_Voltage1: vot1 = Math.round(data.UgAB) || 220,  // 修改為 UgAB 並取整數
    FD_Voltage2: vot2 = Math.round(data.UgBC) || 380,  // 修改為 UgBC 並取整數
    FD_Voltage3: vot3 = Math.round(data.UgCA) || 440,  // 修改為 UgCA 並取整數
    FD_WGrpm: WGrpm = 0,  // 新增 FD_WGrpm 數據
    IW_OPSysRunStatus: runStatus = 7  // 新增 IW_OPSysRunStatus 數據
  } = data;

  // 計算每秒轉數
  const rotationsPerSecond = WGrpm / 60;  // 將 rpm 轉換為每秒轉數
  const rotationDuration = WGrpm > 0 ? 60 / WGrpm : 0; // 計算每轉所需秒數，0表示停止

  // 根據 IW_OPSysRunStatus 設置 WindPowerComp 的狀態
  let windPowerStatus;
  switch (runStatus) {
    case 2:
      windPowerStatus = 'N';
      break;
    case 1:
    case 3:
      windPowerStatus = 'G';
      break;
    case 4:
    case 6:
      windPowerStatus = 'A';
      break;
    case 5:
      windPowerStatus = 'E';
      break;
    default:
      windPowerStatus = 'A';  // 包含7和其他未知狀態
  }

  // 根據 vot1、vot2、vot3 的電壓數據設置 TowerComp 的狀態
  const towerCompStatus = [vot1, vot2, vot3].reduce((status, voltage) => {
    if (voltage >= 390 && voltage < 400 || voltage > 410 && voltage <= 420) {
      return status === 'N' ? 'A' : status;
    } else if (voltage < 390 || voltage > 420) {
      return 'E';
    }
    return status;
  }, 'N');

  // 修改點擊處理函數
  const handleClick = () => {
    onShowTurbine({
      rpm: data.FD_WGrpm || 0,
      status: data.IW_OPSysRunStatus === 5 ? 'error' : 
              data.IW_OPSysRunStatus === 4 || data.IW_OPSysRunStatus === 6 ? 'alert' : 'normal'
    });
  };

  // 修改狀態項目定義，移除 desc
  const statusItems = [
    { label: '控制模式', param: 'IW_SystemCurrentCtrlMode' },
    { label: '運行模式', param: 'IW_SystemCurrentRunMode' },
    { label: '報警狀態', param: 'IW_SystemAlarmStatus' },
    { label: '運行狀態', param: 'IW_OPSysRunStatus' }
  ];

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%',
      height: '400px',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      padding: '10px'
    }} 
    onClick={handleClick}>
      {/* Grid 容器 - 修改為4列布局 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr 1fr 1fr',
        gap: '5px',
        height: '100%', // 修改為 100%，因為不再需要減去標題的高度
        alignItems: 'end',
        justifyItems: 'center'
      }}>
        {/* 狀態表格容器 */}
        <div style={{
          gridColumn: '1',
          gridRow: '1 / span 2',
          width: '80%',  // 改為 100% 以填充整個網格列
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          padding: '4px',
          border: '1px solid rgba(6, 43, 98, 0.2)',
          alignSelf: 'center',
          position: 'relative'
        }}>
          {/* 時間顯示 */}
          <div style={{
            position: 'absolute',
            top: '4px',
            right: '8px',
            fontSize: '11px',  // 稍微縮小字體
            color: BASE_COLOR,
            fontWeight: 'bold'
          }}>
            {data.Time || new Date().toLocaleString()}
          </div>

          {/* 表格樣式調整 */}
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12px',  // 稍微縮小字體
            marginTop: '20px'
          }}>
            <thead>
              <tr>
                <th style={{ 
                  padding: '6px',  // 減少內邊距
                  borderBottom: '2px solid rgba(6, 43, 98, 0.2)', 
                  textAlign: 'left',
                  color: BASE_COLOR,
                  fontWeight: 'bold',
                  width: '45%'  // 調整寬度比例
                }}>狀態名稱</th>
                <th style={{ 
                  padding: '6px',  // 減少內邊距
                  borderBottom: '2px solid rgba(6, 43, 98, 0.2)', 
                  textAlign: 'left',
                  color: BASE_COLOR,
                  fontWeight: 'bold',
                  width: '55%'  // 調整寬度比例
                }}>當前狀態</th>
              </tr>
            </thead>
            <tbody>
              {statusItems.map((item, index) => (
                <tr key={index} style={{ 
                  backgroundColor: index % 2 === 0 ? 'rgba(6, 43, 98, 0.03)' : 'transparent'
                }}>
                  <td style={{ 
                    padding: '6px',  // 減少內邊距
                    borderBottom: '1px solid rgba(6, 43, 98, 0.1)',
                    color: BASE_COLOR
                  }}>{item.label}</td>
                  <td style={{ 
                    padding: '6px',  // 減少內邊距
                    borderBottom: '1px solid rgba(6, 43, 98, 0.1)',
                    color: BASE_COLOR,
                    fontWeight: 'bold'
                  }}>
                    {STATUS_MAPPINGS[item.param]?.[data[item.param]] || '未知'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 風力發電機 */}
        <div style={{
          gridColumn: '2',
          gridRow: '1',
          width: '250px',
          height: '350px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          marginBottom: '-80px'
        }}>
          <WindPowerComp 
            scale={100}
            status={windPowerStatus}
            rotationDuration={rotationDuration}
            fill={BASE_COLOR}
          />
        </div>

        {/* 逆變器 */}
        <div style={{
          gridColumn: '3',
          gridRow: '1',
          width: '200px',
          height: '200px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center'
        }}>
          <InverterComp 
            width="100%"
            height="100%"
            status={inverterStatus}
            fill={BASE_COLOR}
          />
        </div>

        {/* 電桿 */}
        <div style={{
          gridColumn: '4',
          gridRow: '1',
          width: '200px',
          height: '300px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          marginBottom: '-40px'
        }}>
          <TowerComp 
            width="100%"
            height="100%"
            status={towerCompStatus}
            scale={1}
            fill={BASE_COLOR}
          />
        </div>

        {/* 數值顯示區域 */}
        <div style={{
          gridColumn: '2',
          gridRow: '2',
          textAlign: 'center',
          color: BASE_COLOR
        }}>
          <span style={{ fontSize: '30px' ,fontWeight:'bold'}}>{Math.round(WGrpm)}</span>
          <span style={{ fontSize: '20px' }}> rpm</span>
        </div>

        <div style={{
          gridColumn: '3',
          gridRow: '2',
          textAlign: 'center',
          color: BASE_COLOR
        }}>
          <span style={{ fontSize: '30px',fontWeight:'bold' }}>{FD_OutputPower?.toFixed(1) || '0.0'}</span>
          <span style={{ fontSize: '20px' }}> kW</span>
        </div>

        <div style={{
          gridColumn: '4',
          gridRow: '2',
          textAlign: 'center',
          color: BASE_COLOR
        }}>
          <span style={{ fontSize: '30px',fontWeight:'bold' }}>{vot1}/{vot2}/{vot3}</span>
          <span style={{ fontSize: '20px' }}> V</span>
        </div>
      </div>
    </div>
  );
};

WindPowerStation.propTypes = {
  data: PropTypes.shape({
    FD_OutputPower: PropTypes.number,
    PowerPac: PropTypes.number,
    FD_WindStatus: PropTypes.string,
    FD_InverterStatus: PropTypes.string,
    FD_TowerStatus: PropTypes.string,
    FD_RotorSpeed: PropTypes.number,
    FD_WindSpeed_3s: PropTypes.number,
    FD_Voltage1: PropTypes.number,
    FD_Voltage2: PropTypes.number,
    FD_Voltage3: PropTypes.number,
    FD_WGrpm: PropTypes.number,
    IW_OPSysRunStatus: PropTypes.number,
    IW_SystemCurrentCtrlMode: PropTypes.number,
    IW_SystemCurrentRunMode: PropTypes.number,
    IW_SystemAlarmStatus: PropTypes.number,
    IW_SysCurYawAction: PropTypes.number,
    IW_SysCurPitchAction: PropTypes.number,
    IW_SysCurHeatAction: PropTypes.number,
    IW_SysCurDumploadAction: PropTypes.number,
    Time: PropTypes.string, // 添加時間的 PropType
  }),
  name: PropTypes.string,
  onShowTurbine: PropTypes.func // 添加新的 prop 類型
};

export default WindPowerStation; 