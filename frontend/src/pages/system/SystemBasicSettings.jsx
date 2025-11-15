import { useState, useEffect } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  Slider, 
  TextField, 
  Select, 
  MenuItem,
  InputAdornment,
  Button,
  Stack,
  Alert,
  Snackbar
} from '@mui/material';
import { systemSettingsConfig } from '../../config/systemSettings';
import axios from 'axios';

function SystemBasicSettings() {
  const [selectedCategory, setSelectedCategory] = useState('domainManagement');
  const [settings, setSettings] = useState(null);
  const [modified, setModified] = useState(false);
  const [message, setMessage] = useState({ open: false, text: '', severity: 'success' });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await axios.get('/api/system/settings');
        if (Object.keys(response.data).length === 0) {
          const defaultSettings = {};
          Object.keys(systemSettingsConfig).forEach(category => {
            defaultSettings[category] = {};
            systemSettingsConfig[category].items.forEach(item => {
              defaultSettings[category][item.id] = item.defaultValue;
            });
          });
          setSettings(defaultSettings);
        } else {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('載入設置失敗:', error);
        setMessage({
          open: true,
          text: '載入設置失敗',
          severity: 'error'
        });
      }
    };

    loadSettings();
  }, []);

  const handleSettingChange = (id, value) => {
    if (!systemSettingsConfig[selectedCategory].editable) {
      console.warn('此設置類別不可修改');
      return;
    }

    setSettings(prev => ({
      ...prev,
      [selectedCategory]: {
        ...prev[selectedCategory],
        [id]: value
      }
    }));
    setModified(true);
  };

  const handleSave = async () => {
    try {
      await axios.post(`/api/system/settings/${selectedCategory}`, {
        settings: settings[selectedCategory]
      });
      
      setModified(false);
      setMessage({
        open: true,
        text: '設置已成功保存',
        severity: 'success'
      });
    } catch (error) {
      console.error('保存設置失敗:', error);
      setMessage({
        open: true,
        text: '保存設置失敗',
        severity: 'error'
      });
    }
  };

  const handleReset = () => {
    setSettings(prev => ({
      ...prev,
      [selectedCategory]: Object.fromEntries(
        systemSettingsConfig[selectedCategory].items.map(item => [
          item.id,
          item.defaultValue
        ])
      )
    }));
    setModified(false);
  };

  const renderSettingInput = (item) => {
    if (!settings || !settings[selectedCategory]) {
      return null;
    }

    const isEditable = systemSettingsConfig[selectedCategory].editable;

    switch (item.type) {
      case 'radio':
        return (
          <RadioGroup
            value={settings[selectedCategory][item.id] || item.defaultValue}
            onChange={(e) => handleSettingChange(item.id, e.target.value)}
            disabled={!isEditable}
          >
            {item.options.map(option => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio disabled={!isEditable} />}
                label={option.label}
              />
            ))}
          </RadioGroup>
        );
      
      case 'slider':
        return (
          <Box sx={{ width: '100%', maxWidth: 300 }}>
            <Slider
              value={settings[selectedCategory][item.id] || item.defaultValue}
              onChange={(_, value) => handleSettingChange(item.id, value)}
              min={item.min}
              max={item.max}
              step={item.step}
              disabled={!isEditable}
            />
            <Typography>
              預覽文字大小: {settings[selectedCategory][item.id] || item.defaultValue}px
            </Typography>
            <Typography sx={{ fontSize: settings[selectedCategory][item.id] || item.defaultValue }}>
              範例文字
            </Typography>
          </Box>
        );

      case 'select':
        return (
          <Select
            value={settings[selectedCategory][item.id] || item.defaultValue}
            onChange={(e) => handleSettingChange(item.id, e.target.value)}
            disabled={!isEditable}
            sx={{ minWidth: 200 }}
          >
            {item.options.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        );

      case 'price':
      case 'number':
        return (
          <TextField
            value={settings[selectedCategory][item.id] || item.defaultValue}
            onChange={(e) => handleSettingChange(item.id, e.target.value)}
            type="number"
            disabled={!isEditable}
            InputProps={{
              endAdornment: item.currency ? (
                <InputAdornment position="end">{item.currency}</InputAdornment>
              ) : item.unit ? (
                <InputAdornment position="end">{item.unit}</InputAdornment>
              ) : null
            }}
          />
        );

      default:
        return (
          <TextField
            value={settings[selectedCategory][item.id] || item.defaultValue}
            onChange={(e) => handleSettingChange(item.id, e.target.value)}
            type={item.type}
            disabled={!isEditable}
            fullWidth
          />
        );
    }
  };

  if (!settings) {
    return <Box sx={{ p: 3 }}>載入中...</Box>;
  }

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh'
    }}>
      <Box sx={{
        width: '400px',
        p: 3,
        borderRight: '1px solid #e0e0e0',
        bgcolor: 'background.paper'
      }}>
        <List>
          {Object.entries(systemSettingsConfig).map(([key, category]) => (
            <ListItem 
              key={key}
              button 
              selected={selectedCategory === key}
              onClick={() => setSelectedCategory(key)}
            >
              <ListItemText primary={category.title} />
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{
        flex: 1,
        p: 3,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ 
          mb: 3, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6">
            {systemSettingsConfig[selectedCategory].title}
          </Typography>

          {systemSettingsConfig[selectedCategory].editable && (
            <Stack direction="row" spacing={2}>
              <Button 
                variant="outlined" 
                onClick={handleReset}
                disabled={!modified}
              >
                重置
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSave}
                disabled={!modified}
              >
                確認修改
              </Button>
            </Stack>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {systemSettingsConfig[selectedCategory].items.map(item => (
            <Box key={item.id}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {item.label}
              </Typography>
              {renderSettingInput(item)}
            </Box>
          ))}
        </Box>
      </Box>

      <Snackbar
        open={message.open}
        autoHideDuration={6000}
        onClose={() => setMessage({ ...message, open: false })}
      >
        <Alert severity={message.severity} onClose={() => setMessage({ ...message, open: false })}>
          {message.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SystemBasicSettings; 