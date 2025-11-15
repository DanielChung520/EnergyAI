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
import { SOLAR_PANEL_TYPES } from '../../../constants/equipmentTypes';

function EquipmentSolarDetail({ equipmentId, modelNo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [solarData, setSolarData] = useState({
    model_no: modelNo || '',
    efficiency: '',
    dimensions: '',
    type: 'mono',
    durability_range_from: '',
    durability_range_to: ''
  });

  useEffect(() => {
    const fetchSolarDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/equipments/${equipmentId}/solar-details`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        });
        if (!response.ok) throw new Error('獲取數據失敗');
        const data = await response.json();
        if (data) {
          // 確保所有欄位都有定義值
          setSolarData({
            model_no: data.model_no || modelNo || '',
            efficiency: data.efficiency || '',
            dimensions: data.dimensions || '',
            type: data.type || 'mono',
            durability_range_from: data.durability_range_from || '',
            durability_range_to: data.durability_range_to || ''
          });
        }
      } catch (error) {
        console.error('Error fetching solar details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (equipmentId) fetchSolarDetails();
  }, [equipmentId, modelNo]);

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
      const response = await fetch(
        `/api/equipments/${equipmentId}/solar-details`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(solarData)
        }
      );
      if (!response.ok) throw new Error('保存失敗');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving solar details:', error);
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
        <Typography variant="h6">太陽能板參數設定</Typography>
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
            value={solarData.model_no}
            disabled
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="轉換效能 (%)"
            name="efficiency"
            type="number"
            value={solarData.efficiency}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="尺寸 (mm)"
            name="dimensions"
            value={solarData.dimensions}
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
              value={solarData.type}
              onChange={handleChange}
            >
              {SOLAR_PANEL_TYPES.map((type) => (
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
              value={solarData.durability_range_from}
              onChange={handleChange}
              disabled={!isEditing}
            />
            <Typography sx={{ lineHeight: '40px' }}>~</Typography>
            <TextField
              fullWidth
              label="最高溫度"
              name="durability_range_to"
              type="number"
              value={solarData.durability_range_to}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default EquipmentSolarDetail; 