import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import { WIND_TURBINE_TYPES, WIND_LOCATION_TYPES } from '../../../constants/equipmentTypes';

function EquipmentWindDetail({ equipmentId, modelNo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [windData, setWindData] = useState({
    model_no: modelNo || '',
    efficiency: '',
    wind_speed_range_from: '',
    wind_speed_range_to: '',
    rpm_range_from: '',
    rpm_range_to: '',
    pole_height: '',
    base_height: '',
    blade_diameter: '',
    type: 'HAWT',
    location_type: 'OnShore',
    durability_range_from: '',
    durability_range_to: ''
  });

  useEffect(() => {
    const fetchWindDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/equipments/${equipmentId}/wind-details`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        });
        if (!response.ok) throw new Error('獲取數據失敗');
        const data = await response.json();
        if (data) {
          setWindData({
            model_no: data.model_no || modelNo || '',
            efficiency: data.efficiency || '',
            wind_speed_range_from: data.wind_speed_range_from || '',
            wind_speed_range_to: data.wind_speed_range_to || '',
            rpm_range_from: data.rpm_range_from || '',
            rpm_range_to: data.rpm_range_to || '',
            pole_height: data.pole_height || '',
            base_height: data.base_height || '',
            blade_diameter: data.blade_diameter || '',
            type: data.type || 'HAWT',
            location_type: data.location_type || 'OnShore',
            durability_range_from: data.durability_range_from || '',
            durability_range_to: data.durability_range_to || ''
          });
        }
      } catch (error) {
        console.error('Error fetching wind details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (equipmentId) fetchWindDetails();
  }, [equipmentId, modelNo]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setWindData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `/api/equipments/${equipmentId}/wind-details`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(windData)
        }
      );
      if (!response.ok) throw new Error('保存失敗');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving wind details:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h6">風力發電機參數設定</Typography>
        <Button
          startIcon={isEditing ? <CheckIcon /> : <EditIcon />}
          onClick={() => isEditing ? handleSubmit() : setIsEditing(true)}
          variant="contained"
          disabled={saving}
        >
          {saving ? '儲存中...' : (isEditing ? '儲存' : '編輯')}
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="型號"
            name="model_no"
            value={windData.model_no}
            disabled
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="轉換效能 (%)"
            name="efficiency"
            type="number"
            value={windData.efficiency}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            風速範圍 (m/s)
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="最小風速"
              name="wind_speed_range_from"
              type="number"
              value={windData.wind_speed_range_from}
              onChange={handleChange}
              disabled={!isEditing}
            />
            <Typography sx={{ lineHeight: '40px' }}>~</Typography>
            <TextField
              fullWidth
              label="最大風速"
              name="wind_speed_range_to"
              type="number"
              value={windData.wind_speed_range_to}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            轉速範圍 (RPM)
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="最小轉速"
              name="rpm_range_from"
              type="number"
              value={windData.rpm_range_from}
              onChange={handleChange}
              disabled={!isEditing}
            />
            <Typography sx={{ lineHeight: '40px' }}>~</Typography>
            <TextField
              fullWidth
              label="最大轉速"
              name="rpm_range_to"
              type="number"
              value={windData.rpm_range_to}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="桿高 (m)"
            name="pole_height"
            type="number"
            value={windData.pole_height}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="基座高度 (m)"
            name="base_height"
            type="number"
            value={windData.base_height}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="葉片直徑 (m)"
            name="blade_diameter"
            type="number"
            value={windData.blade_diameter}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">類型</FormLabel>
            <RadioGroup
              row
              name="type"
              value={windData.type}
              onChange={handleChange}
            >
              {WIND_TURBINE_TYPES.map((type) => (
                <FormControlLabel
                  key={type.value}
                  value={type.value}
                  control={<Radio />}
                  label={type.label}
                  disabled={!isEditing}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">陸海類型</FormLabel>
            <RadioGroup
              row
              name="location_type"
              value={windData.location_type}
              onChange={handleChange}
            >
              {WIND_LOCATION_TYPES.map((type) => (
                <FormControlLabel
                  key={type.value}
                  value={type.value}
                  control={<Radio />}
                  label={type.label}
                  disabled={!isEditing}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            耐候性範圍 (°C)
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="最低溫度"
              name="durability_range_from"
              type="number"
              value={windData.durability_range_from}
              onChange={handleChange}
              disabled={!isEditing}
            />
            <Typography sx={{ lineHeight: '40px' }}>~</Typography>
            <TextField
              fullWidth
              label="最高溫度"
              name="durability_range_to"
              type="number"
              value={windData.durability_range_to}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default EquipmentWindDetail; 