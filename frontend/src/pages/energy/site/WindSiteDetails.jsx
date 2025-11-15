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
  Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import { DIRECTIONS } from '../../../constants/siteDirections';

function WindSiteDetails({ siteId, details, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [windData, setWindData] = useState({
    turbine_model: '',
    height: '',
    air_density: '',
    avg_wind_speed: '',
    spring_wind_direction: '',
    summer_wind_direction: '',
    autumn_wind_direction: '',
    winter_wind_direction: '',
    spring_avg_wind_speed: '',
    summer_avg_wind_speed: '',
    autumn_avg_wind_speed: '',
    winter_avg_wind_speed: '',
    remark: ''
  });

  // 獲取風能詳細數據
  useEffect(() => {
    const fetchWindDetails = async (siteId) => {
      try {
        setLoading(true);
        const baseUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${baseUrl}/api/sites/${siteId}/wind-details`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`獲取數據失敗: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        if (data && !data.error) {
          setWindData(data);
        }
      } catch (error) {
        console.error('Error fetching wind details:', error);
        setWindData({
          turbine_model: '',
          height: '',
          air_density: '',
          avg_wind_speed: '',
          spring_wind_direction: '',
          summer_wind_direction: '',
          autumn_wind_direction: '',
          winter_wind_direction: '',
          spring_avg_wind_speed: '',
          summer_avg_wind_speed: '',
          autumn_avg_wind_speed: '',
          winter_avg_wind_speed: '',
          remark: ''
        });
      } finally {
        setLoading(false);
      }
    };

    if (siteId) {
      fetchWindDetails(siteId);
    }
  }, [siteId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setWindData(prev => ({
      ...prev,
      [name]: value || ''  // 確保 value 不為 null
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const method = windData.id ? 'PUT' : 'POST';  // 根据是否有 id 来判断是更新还是创建
      
      // 验证必填字段
      const requiredFields = ['turbine_model', 'height', 'air_density', 'avg_wind_speed'];
      const missingFields = requiredFields.filter(field => !windData[field]);
      if (missingFields.length > 0) {
        throw new Error(`請填寫必要欄位: ${missingFields.join(', ')}`);
      }

      // 准备要发送的数据
      const submitData = {
        ...windData,
        site_id: siteId,
        // 确保数值类型字段为数字
        height: windData.height ? parseFloat(windData.height) : null,
        air_density: windData.air_density ? parseFloat(windData.air_density) : null,
        avg_wind_speed: windData.avg_wind_speed ? parseFloat(windData.avg_wind_speed) : null,
        spring_avg_wind_speed: windData.spring_avg_wind_speed ? parseFloat(windData.spring_avg_wind_speed) : null,
        summer_avg_wind_speed: windData.summer_avg_wind_speed ? parseFloat(windData.summer_avg_wind_speed) : null,
        autumn_avg_wind_speed: windData.autumn_avg_wind_speed ? parseFloat(windData.autumn_avg_wind_speed) : null,
        winter_avg_wind_speed: windData.winter_avg_wind_speed ? parseFloat(windData.winter_avg_wind_speed) : null
      };

      console.log('Submitting wind details:', submitData);
      
      const response = await fetch(`${baseUrl}/api/sites/${siteId}/wind-details`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(submitData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`保存失敗: ${response.status} ${responseData.error || JSON.stringify(responseData)}`);
      }

      // 保存成功后刷新数据
      setWindData(responseData);
      setIsEditing(false);
      
      // 重新获取数据以确保显示最新状态
      const refreshResponse = await fetch(`${baseUrl}/api/sites/${siteId}/wind-details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (refreshData && !refreshData.error) {
          setWindData(refreshData);
        }
      }

      alert('保存成功！');
    } catch (error) {
      console.error('Error saving wind details:', error);
      alert(error.message);
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
        display: 'flex', 
        justifyContent: 'space-between', 
        mb: 1
      }}>
        <Typography variant="h6">風能案場詳細資料</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={isEditing ? <CheckIcon /> : <EditIcon />}
          onClick={isEditing ? handleSubmit : () => setIsEditing(true)}
          disabled={saving}
        >
          {saving ? '儲存中...' : isEditing ? '儲存' : '編輯'}
        </Button>
      </Box>

      {(!windData || Object.keys(windData).length === 0) && !isEditing ? (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          暫無詳細信息，點擊編輯按鈕新增資料
        </Typography>
      ) : (
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="適用標準機型"
              name="turbine_model"
              value={windData.turbine_model || ''}
              onChange={handleChange}
              disabled={!isEditing}
              sx={{ '& .MuiInputBase-input': { py: 1 } }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="風能場域高度 (m)"
              name="height"
              type="number"
              value={windData.height || ''}
              onChange={handleChange}
              disabled={!isEditing}
              sx={{ '& .MuiInputBase-input': { py: 1 } }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="場域空氣密度 (kg/m³)"
              name="air_density"
              type="number"
              value={windData.air_density || ''}
              onChange={handleChange}
              disabled={!isEditing}
              sx={{ '& .MuiInputBase-input': { py: 1 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="全年平均風速 (m/s)"
              name="avg_wind_speed"
              type="number"
              value={windData.avg_wind_speed || ''}
              onChange={handleChange}
              disabled={!isEditing}
              sx={{ '& .MuiInputBase-input': { py: 1 } }}
            />
          </Grid>


          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>平均風速 (m/s)</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="春季"
                      name="spring_avg_wind_speed"
                      type="number"
                      value={windData.spring_avg_wind_speed || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      sx={{ 
                        '& .MuiInputBase-input': { py: 1 },
                        '& .MuiInputLabel-root': { whiteSpace: 'nowrap' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="夏季"
                      name="summer_avg_wind_speed"
                      type="number"
                      value={windData.summer_avg_wind_speed || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      sx={{ 
                        '& .MuiInputBase-input': { py: 1 },
                        '& .MuiInputLabel-root': { whiteSpace: 'nowrap' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="秋季"
                      name="autumn_avg_wind_speed"
                      type="number"
                      value={windData.autumn_avg_wind_speed || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      sx={{ 
                        '& .MuiInputBase-input': { py: 1 },
                        '& .MuiInputLabel-root': { whiteSpace: 'nowrap' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="冬季"
                      name="winter_avg_wind_speed"
                      type="number"
                      value={windData.winter_avg_wind_speed || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      sx={{ 
                        '& .MuiInputBase-input': { py: 1 },
                        '& .MuiInputLabel-root': { whiteSpace: 'nowrap' }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>主要風向</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <FormControl 
                      fullWidth 
                      size="small"
                      disabled={!isEditing}
                    >
                      <InputLabel>春季</InputLabel>
                      <Select
                        name="spring_wind_direction"
                        value={windData.spring_wind_direction || ''}
                        onChange={handleChange}
                        label="春季"
                      >
                        {DIRECTIONS.map((direction) => (
                          <MenuItem key={direction.value} value={direction.value}>
                            {direction.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl 
                      fullWidth 
                      size="small"
                      disabled={!isEditing}
                    >
                      <InputLabel>夏季</InputLabel>
                      <Select
                        name="summer_wind_direction"
                        value={windData.summer_wind_direction || ''}
                        onChange={handleChange}
                        label="夏季"
                      >
                        {DIRECTIONS.map((direction) => (
                          <MenuItem key={direction.value} value={direction.value}>
                            {direction.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl 
                      fullWidth 
                      size="small"
                      disabled={!isEditing}
                    >
                      <InputLabel>秋季</InputLabel>
                      <Select
                        name="autumn_wind_direction"
                        value={windData.autumn_wind_direction || ''}
                        onChange={handleChange}
                        label="秋季"
                      >
                        {DIRECTIONS.map((direction) => (
                          <MenuItem key={direction.value} value={direction.value}>
                            {direction.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl 
                      fullWidth 
                      size="small"
                      disabled={!isEditing}
                    >
                      <InputLabel>冬季</InputLabel>
                      <Select
                        name="winter_wind_direction"
                        value={windData.winter_wind_direction || ''}
                        onChange={handleChange}
                        label="冬季"
                      >
                        {DIRECTIONS.map((direction) => (
                          <MenuItem key={direction.value} value={direction.value}>
                            {direction.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="備註"
              name="remark"
              value={windData.remark || ''}
              onChange={handleChange}
              disabled={!isEditing}
              multiline
              rows={3}
              sx={{ 
                '& .MuiInputBase-input': { py: 1 },
                '& .MuiInputLabel-root': { 
                  whiteSpace: 'nowrap',
                  background: '#fff',
                  px: 0.5,
                },
                '& .MuiInputLabel-shrink': {
                  transform: 'translate(14px, -9px) scale(0.75)',
                  backgroundColor: '#fff'
                }
              }}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default WindSiteDetails; 