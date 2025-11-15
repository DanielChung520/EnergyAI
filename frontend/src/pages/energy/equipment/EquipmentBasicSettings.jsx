import { Box, Typography, TextField, Button, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Grid, Checkbox } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 確保 URL 以斜線結尾以避免 308 重定向
const EQUIPMENT_API_URL = '/api/equipments';

// 創建自定義的 axios 實例
const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 添加請求攔截器，用於調試
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Request Config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 添加響應攔截器，用於調試
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', response);
    return response;
  },
  (error) => {
    console.error('Response Error:', error);
    return Promise.reject(error);
  }
);

function EquipmentBasicSettings() {
  const navigate = useNavigate();
  
  // 狀態管理
  const [equipmentData, setEquipmentData] = useState({
    model: '',
    chineseName: '',
    englishName: '',
    type: 'wind',
    power: '',
    outputVoltage: '',
    useful_life: '5',  // 添加使用年限字段，預設值為5
    remark: '',        // 添加備註字段
    iso14064: false,
    iso14001: false,
    // Wind-specific fields
    windEfficiency: '',
    windSpeedRangeFrom: '',
    windSpeedRangeTo: '',
    rpmRangeFrom: '',
    rpmRangeTo: '',
    poleHeight: '',
    baseHeight: '',
    bladeDiameter: '',
    windType: 'HAWT',
    windLocationType: 'OnShore',
    windDurabilityRangeFrom: '',
    windDurabilityRangeTo: '',
    // Solar-specific fields
    solarEfficiency: '',
    solarDimensions: '',
    solarType: 'mono',
    solarDurabilityRangeFrom: '',
    solarDurabilityRangeTo: ''
  });

  // 處理輸入變更
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setEquipmentData(prevData => ({
      ...prevData,
      [name]: newValue
    }));
  };

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 首先創建基本設備信息
      const basicEquipmentData = {
        model_no: equipmentData.model,
        desc_cn: equipmentData.chineseName,
        desc_en: equipmentData.englishName,
        equ_type: equipmentData.type,
        power: equipmentData.power,
        voltage: equipmentData.outputVoltage,
        useful_life: equipmentData.useful_life,
        iso14064: equipmentData.iso14064 ? 'y' : 'n',
        iso14001: equipmentData.iso14001 ? 'y' : 'n',
        remark: equipmentData.remark
      };

      console.log('Sending equipment data:', basicEquipmentData);
      console.log('Request URL:', EQUIPMENT_API_URL);
      
      // 使用修改後的 URL
      const equipmentResponse = await axiosInstance.post(`${EQUIPMENT_API_URL}/`, basicEquipmentData);
      
      if (equipmentResponse.data.success) {
        const equipmentId = equipmentResponse.data.id;
        
        if (equipmentData.type === 'wind') {
          const windDetailData = {
            equipment_id: equipmentId,
            model_no: equipmentData.model,
            efficiency: equipmentData.windEfficiency,
            wind_speed_range_from: equipmentData.windSpeedRangeFrom,
            wind_speed_range_to: equipmentData.windSpeedRangeTo,
            rpm_range_from: equipmentData.rpmRangeFrom,
            rpm_range_to: equipmentData.rpmRangeTo,
            pole_height: equipmentData.poleHeight,
            base_height: equipmentData.baseHeight || '0',  // 添加預設值
            blade_diameter: equipmentData.bladeDiameter,
            type: equipmentData.windType,
            location_type: equipmentData.windLocationType,
            durability_range_from: equipmentData.windDurabilityRangeFrom,
            durability_range_to: equipmentData.windDurabilityRangeTo
          };

          await axiosInstance.post(`${EQUIPMENT_API_URL}/${equipmentId}/wind-details`, windDetailData);
        } else if (equipmentData.type === 'solar') {
          const solarDetailData = {
            equipment_id: equipmentId,
            model_no: equipmentData.model,
            efficiency: equipmentData.solarEfficiency,
            dimensions: equipmentData.solarDimensions,
            type: equipmentData.solarType,
            durability_range_from: equipmentData.solarDurabilityRangeFrom,
            durability_range_to: equipmentData.solarDurabilityRangeTo
          };

          await axiosInstance.post(`${EQUIPMENT_API_URL}/${equipmentId}/solar-details`, solarDetailData);
        }

        // 重置表單
        setEquipmentData({
          model: '',
          chineseName: '',
          englishName: '',
          type: 'wind',
          power: '',
          outputVoltage: '',
          useful_life: '5',
          remark: '',
          iso14064: false,
          iso14001: false,
          // Wind-specific fields
          windEfficiency: '',
          windSpeedRangeFrom: '',
          windSpeedRangeTo: '',
          rpmRangeFrom: '',
          rpmRangeTo: '',
          poleHeight: '',
          baseHeight: '',
          bladeDiameter: '',
          windType: 'HAWT',
          windLocationType: 'OnShore',
          windDurabilityRangeFrom: '',
          windDurabilityRangeTo: '',
          // Solar-specific fields
          solarEfficiency: '',
          solarDimensions: '',
          solarType: 'mono',
          solarDurabilityRangeFrom: '',
          solarDurabilityRangeTo: ''
        });

        alert('設備保存成功！');
        // 保存成功後返回上一頁
        navigate(-1);
      }
    } catch (error) {
      console.error('保存失敗:', error);
      let errorMessage = '保存失敗: ';
      if (error.response) {
        // 服務器回應的錯誤
        errorMessage += error.response.data?.error || error.response.data?.message || '服務器錯誤';
        console.error('Error response:', error.response);
      } else if (error.request) {
        // 請求發送失敗
        errorMessage += '網絡連接錯誤，請檢查網絡連接';
        console.error('Error request:', error.request);
      } else {
        // 其他錯誤
        errorMessage += error.message || '未知錯誤';
      }
      alert(errorMessage);
    }
  };

  return (
    <Box sx={{ 
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      position: 'relative',
      pb: 8  // 增加底部padding以容納按鈕
    }}>
      <Box sx={{ width: '100%', mb: 3 }}>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
          新增設備基本資料
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="型號"
                name="model"
                value={equipmentData.model}
                onChange={handleInputChange}
                fullWidth
                size="small"
                sx={{ mb: 1 }}
              />
              <TextField
                label="中文名稱"
                name="chineseName"
                value={equipmentData.chineseName}
                onChange={handleInputChange}
                fullWidth
                size="small"
                sx={{ mb: 1 }}
              />
              <TextField
                label="英文名稱"
                name="englishName"
                value={equipmentData.englishName}
                onChange={handleInputChange}
                fullWidth
                size="small"
                sx={{ mb: 1 }}
              />
              <FormControl component="fieldset" sx={{ mb: 1 }}>
                <FormLabel component="legend">設備類型</FormLabel>
                <RadioGroup
                  row
                  name="type"
                  value={equipmentData.type}
                  onChange={handleInputChange}
                >
                  <FormControlLabel
                    value="wind"
                    control={<Radio size="small" />}
                    label="風力"
                  />
                  <FormControlLabel
                    value="solar"
                    control={<Radio size="small" />}
                    label="太陽能"
                  />
                  <FormControlLabel
                    value="biomass"
                    control={<Radio size="small" />}
                    label="生質能"
                    disabled
                  />
                  <FormControlLabel
                    value="diesel"
                    control={<Radio size="small" />}
                    label="柴油"
                    disabled
                  />
                  <FormControlLabel
                    value="geothermal"
                    control={<Radio size="small" />}
                    label="地熱"
                    disabled
                  />
                  <FormControlLabel
                    value="others"
                    control={<Radio size="small" />}
                    label="其他"
                    disabled
                  />
                </RadioGroup>
              </FormControl>
              <FormControl component="fieldset" sx={{ mb: 1 }}>
                <FormLabel component="legend">是否取得認證？</FormLabel>
                <Box sx={{ mt: 0}}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={equipmentData.iso14064}
                        onChange={handleInputChange}
                        name="iso14064"
                        size="small"
                      />
                    }
                    label="ISO14064"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={equipmentData.iso14001}
                        onChange={handleInputChange}
                        name="iso14001"
                        size="small"
                      />
                    }
                    label="ISO14001"
                  />
                </Box>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="功率 (kW)"
                name="power"
                value={equipmentData.power}
                onChange={handleInputChange}
                fullWidth
                size="small"
                sx={{ mb: 1 }}
              />
              <TextField
                label="輸出電壓(V)"
                name="outputVoltage"
                value={equipmentData.outputVoltage}
                onChange={handleInputChange}
                fullWidth
                size="small"
                sx={{ mb: 1 }}
              />
              <TextField
                label="使用年限"
                name="useful_life"
                type="number"
                value={equipmentData.useful_life}
                onChange={handleInputChange}
                fullWidth
                size="small"
                sx={{ mb: 1 }}
              />
              <TextField
                label="備註"
                name="remark"
                value={equipmentData.remark}
                onChange={handleInputChange}
                fullWidth
                size="small"
                multiline
                rows={4}
                sx={{ mb: 1 }}
              />
            </Grid>
          </Grid>
        </form>
      </Box>

      <Box sx={{ width: '100%' }}>
        {equipmentData.type === 'wind' && (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
              風力發電機參數設定
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset" sx={{ mb: 0.5 }}>
                  <FormLabel component="legend" sx={{ fontSize: '0.875rem' }}>類型</FormLabel>
                  <RadioGroup
                    row
                    name="windType"
                    value={equipmentData.windType}
                    onChange={handleInputChange}
                  >
                    <FormControlLabel
                      value="HAWT"
                      control={<Radio size="small" />}
                      label="水平軸風力發電機"
                    />
                    <FormControlLabel
                      value="VAWT"
                      control={<Radio size="small" />}
                      label="垂直軸風力發電機"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset" sx={{ mb: 0.5 }}>
                  <FormLabel component="legend" sx={{ fontSize: '0.875rem' }}>陸海類型</FormLabel>
                  <RadioGroup
                    row
                    name="windLocationType"
                    value={equipmentData.windLocationType}
                    onChange={handleInputChange}
                  >
                    <FormControlLabel
                      value="OnShore"
                      control={<Radio size="small" />}
                      label="陸上"
                    />
                    <FormControlLabel
                      value="OffShore"
                      control={<Radio size="small" />}
                      label="海上"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="轉換效能 (%)"
                  name="windEfficiency"
                  type="number"
                  value={equipmentData.windEfficiency}
                  onChange={handleInputChange}
                  size="small"
                  sx={{ mb: 0.5 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="桿高 (m)"
                  name="poleHeight"
                  type="number"
                  value={equipmentData.poleHeight}
                  onChange={handleInputChange}
                  size="small"
                  sx={{ mb: 0.5 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="基座高度 (m)"
                  name="baseHeight"
                  type="number"
                  value={equipmentData.baseHeight}
                  onChange={handleInputChange}
                  size="small"
                  sx={{ mb: 0.5 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="葉片直徑 (m)"
                  name="bladeDiameter"
                  type="number"
                  value={equipmentData.bladeDiameter}
                  onChange={handleInputChange}
                  size="small"
                  sx={{ mb: 0.5 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  風速範圍 (m/s)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                  <TextField
                    fullWidth
                    label="最小風速"
                    name="windSpeedRangeFrom"
                    type="number"
                    value={equipmentData.windSpeedRangeFrom}
                    onChange={handleInputChange}
                    size="small"
                  />
                  <Typography sx={{ lineHeight: '32px' }}>~</Typography>
                  <TextField
                    fullWidth
                    label="最大風速"
                    name="windSpeedRangeTo"
                    type="number"
                    value={equipmentData.windSpeedRangeTo}
                    onChange={handleInputChange}
                    size="small"
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  轉速範圍 (RPM)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                  <TextField
                    fullWidth
                    label="最小轉速"
                    name="rpmRangeFrom"
                    type="number"
                    value={equipmentData.rpmRangeFrom}
                    onChange={handleInputChange}
                    size="small"
                  />
                  <Typography sx={{ lineHeight: '32px' }}>~</Typography>
                  <TextField
                    fullWidth
                    label="最大轉速"
                    name="rpmRangeTo"
                    type="number"
                    value={equipmentData.rpmRangeTo}
                    onChange={handleInputChange}
                    size="small"
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  耐候性範圍 (°C)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                  <TextField
                    fullWidth
                    label="最低溫度"
                    name="windDurabilityRangeFrom"
                    type="number"
                    value={equipmentData.windDurabilityRangeFrom}
                    onChange={handleInputChange}
                    size="small"
                  />
                  <Typography sx={{ lineHeight: '32px' }}>~</Typography>
                  <TextField
                    fullWidth
                    label="最高溫度"
                    name="windDurabilityRangeTo"
                    type="number"
                    value={equipmentData.windDurabilityRangeTo}
                    onChange={handleInputChange}
                    size="small"
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
        {equipmentData.type === 'solar' && (
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>太陽能板參數設定</Typography>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <FormControl component="fieldset" sx={{ mb: 1 }}>
                  <FormLabel component="legend">類型</FormLabel>
                  <RadioGroup
                    row
                    name="solarType"
                    value={equipmentData.solarType}
                    onChange={handleInputChange}
                  >
                    <FormControlLabel
                      value="mono"
                      control={<Radio />}
                      label="單晶硅"
                    />
                    <FormControlLabel
                      value="poly"
                      control={<Radio />}
                      label="多晶硅"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="轉換效能 (%)"
                  name="solarEfficiency"
                  type="number"
                  value={equipmentData.solarEfficiency}
                  onChange={handleInputChange}
                  sx={{ mb: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="尺寸 (mm)"
                  name="solarDimensions"
                  value={equipmentData.solarDimensions}
                  onChange={handleInputChange}
                  sx={{ mb: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ mb: 0.5 }}>
                  耐候性範圍 (°C)
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                  <TextField
                    fullWidth
                    label="最低溫度"
                    name="solarDurabilityRangeFrom"
                    type="number"
                    value={equipmentData.solarDurabilityRangeFrom}
                    onChange={handleInputChange}
                  />
                  <Typography sx={{ lineHeight: '40px' }}>~</Typography>
                  <TextField
                    fullWidth
                    label="最高溫度"
                    name="solarDurabilityRangeTo"
                    type="number"
                    value={equipmentData.solarDurabilityRangeTo}
                    onChange={handleInputChange}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>

      {/* 新增固定在右下角的保存按鈕 */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000
        }}
      >
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{
            minWidth: 120,
            height: 40
          }}
        >
          保存
        </Button>
      </Box>
    </Box>
  );
}

export default EquipmentBasicSettings; 