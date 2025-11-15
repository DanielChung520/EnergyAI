import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import { DIRECTIONS, INVERTER_OUTPUT_TYPES } from '../../../constants/siteDirections';

function SolarDetails({ siteId, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 定義初始空值狀態
  const initialSolarData = {
    module_type: '',
    bracket_height: '',
    annual_sunlight: '',
    output_voltage: '',
    inverter_output: 'AC',
    ground_direction: '',
    sunlight_direction: '',
    avg_temperature: '',
    avg_rainfall: '',
    avg_wind_speed: '',
    remark: ''
  };

  const [solarData, setSolarData] = useState(initialSolarData);

  // 獲取太陽能詳細數據
  useEffect(() => {
    const fetchSolarDetails = async () => {
      try {
        setLoading(true);  // 開始加載時設置 loading
        setSolarData(initialSolarData);  // 重置數據
        const response = await fetch(`${import.meta.env.VITE_SITE_API_URL}/sites/${siteId}/solar-details`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error('獲取數據失敗');
        }
        const data = await response.json();
        if (data) {
          setSolarData(data);  // 設置新數據
        }
      } catch (error) {
        console.error('Error fetching solar details:', error);
        // 發生錯誤時重置數據
        setSolarData(initialSolarData);
      } finally {
        setLoading(false);
      }
    };

    if (siteId) {
      fetchSolarDetails();
    }
  }, [siteId]);  // 確保依賴項包含 siteId

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSolarData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SITE_API_URL}/sites/${siteId}/solar-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(solarData)
      });

      if (!response.ok) {
        throw new Error('保存失敗');
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving solar details:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Box sx={{
        my: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">太陽能案場詳細資料</Typography>
        <Button
          startIcon={isEditing ? <CheckIcon /> : <EditIcon />}
          onClick={() => isEditing ? handleSubmit() : setIsEditing(true)}
          variant="contained"
          disabled={saving}
          size="small"
        >
          {saving ? '保存中...' : (isEditing ? '保存' : '編輯')}
        </Button>
      </Box>

      <Box sx={{
        maxHeight: '70vh',
        overflowY: 'auto',
        p: 1 ,
        my: 1
      }}>
        <Grid container spacing={1.8}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="光伏模組類型"
              name="module_type"
              value={solarData.module_type}
              onChange={handleChange}
              disabled={!isEditing}
              sx={{ '& .MuiInputBase-input': { py: 1 } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              pl:4,
              gap: 2  // 添加間距
            }}>
              <Typography variant="subtitle2" sx={{
                fontSize: '0.875rem',
                minWidth: 'fit-content'  // 確保標籤不會換行
              }}>
                逆變器輸出形式：
              </Typography>
              <RadioGroup
                name="inverter_output"
                value={solarData.inverter_output}
                onChange={handleChange}
                row
                sx={{
                  '& .MuiFormControlLabel-root': {
                    mr: 2,
                    minWidth: 'auto'
                  }
                }}
              >
                {INVERTER_OUTPUT_TYPES.map((type) => (
                  <FormControlLabel
                    key={type.value}
                    value={type.value}
                    control={<Radio size="small" />}
                    label={type.label}
                    disabled={!isEditing}
                  />
                ))}
              </RadioGroup>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="年平均光照 (hrs)"
              name="annual_sunlight"
              type="number"
              value={solarData.annual_sunlight}
              onChange={handleChange}
              disabled={!isEditing}
              sx={{ '& .MuiInputBase-input': { py: 1 } }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="年平均溫度 (°C)"
              name="avg_temperature"
              type="number"
              value={solarData.avg_temperature}
              onChange={handleChange}
              disabled={!isEditing}
              sx={{ '& .MuiInputBase-input': { py: 1 } }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="平均風速 (m/s)"
              name="avg_wind_speed"
              type="number"
              value={solarData.avg_wind_speed}
              onChange={handleChange}
              disabled={!isEditing}
              sx={{ '& .MuiInputBase-input': { py: 1 } }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="年平均降雨量 (mm)"
              name="avg_rainfall"
              type="number"
              value={solarData.avg_rainfall}
              onChange={handleChange}
              disabled={!isEditing}
              sx={{ '& .MuiInputBase-input': { py: 1 } }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="標準輸出電壓 (V)"
              name="output_voltage"
              type="number"
              value={solarData.output_voltage}
              onChange={handleChange}
              disabled={!isEditing}
              sx={{ '& .MuiInputBase-input': { py: 1 } }}
            />
          </Grid>



          <Grid item xs={12} md={3}>
            <FormControl
              fullWidth
              size="small"
              disabled={!isEditing}
              sx={{ '& .MuiSelect-select': { py: 1 } }}
            >
              <InputLabel>場地坡面方向</InputLabel>
              <Select
                name="ground_direction"
                value={solarData.ground_direction}
                onChange={handleChange}
                label="場地坡面方向"
              >
                {DIRECTIONS.map((direction) => (
                  <MenuItem key={direction.value} value={direction.value}>
                    {direction.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl
              fullWidth
              size="small"
              disabled={!isEditing}
              sx={{ '& .MuiSelect-select': { py: 1 } }}
            >
              <InputLabel>光照方向</InputLabel>
              <Select
                name="sunlight_direction"
                value={solarData.sunlight_direction}
                onChange={handleChange}
                label="光照方向"
              >
                {DIRECTIONS.map((direction) => (
                  <MenuItem key={direction.value} value={direction.value}>
                    {direction.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>



          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="支架高度 (m)"
              name="bracket_height"
              type="number"
              value={solarData.bracket_height}
              onChange={handleChange}
              disabled={!isEditing}
              sx={{ '& .MuiInputBase-input': { py: 1 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="備註"
              name="remark"
              value={solarData.remark}
              onChange={handleChange}
              disabled={!isEditing}
              multiline
              rows={3}
              sx={{ 
                '& .MuiInputBase-input': { py: 1 },
                '& .MuiInputLabel-root': { 
                  whiteSpace: 'nowrap',
                  background: '#fff',  // 添加白色背景
                  px: 0.5,            // 添加左右內邊距
                },
                '& .MuiInputLabel-shrink': {
                  transform: 'translate(14px, -9px) scale(0.75)',  // 調整標籤位置
                  backgroundColor: '#fff'
                }
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default SolarDetails; 