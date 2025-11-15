import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  IconButton,
  Avatar,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  LightMode as LightIcon,
  DarkMode as DarkIcon,
  SettingsBrightness as AutoIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import { useNavigate } from 'react-router-dom';

function BasicSettings() {
  const navigate = useNavigate();
  const { settings, updateSettings, updateLogo } = useSystemSettings();
  const [logoPreview, setLogoPreview] = useState(settings.logo);

  const handleChange = (event) => {
    const { name, value } = event.target;
    updateSettings({ [name]: value });
  };

  const handleLogoChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      await updateLogo(file);
      // 更新預覽
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThemeChange = (event, newTheme) => {
    if (newTheme !== null) {
      updateSettings({ theme: newTheme });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // 保存設置後導航到儀表板
    navigate('/');
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        系統基本資料設置
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Stack spacing={4}>
          {/* 系統名稱 */}
          <TextField
            fullWidth
            label="系統名稱"
            name="systemName"
            value={settings.systemName}
            onChange={handleChange}
          />

          {/* Logo上傳 */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              企業Logo
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={logoPreview}
                sx={{ width: 100, height: 100 }}
                variant="rounded"
              />
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadIcon />}
              >
                上傳Logo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </Button>
            </Stack>
          </Box>

          {/* 語言設置 */}
          <FormControl fullWidth>
            <InputLabel>語言設置</InputLabel>
            <Select
              name="language"
              value={settings.language}
              onChange={handleChange}
              label="語言設置"
            >
              <MenuItem value="zh-TW">中文</MenuItem>
              <MenuItem value="en-US">English</MenuItem>
            </Select>
          </FormControl>

          {/* 主題設置 */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              主題設置
            </Typography>
            <ToggleButtonGroup
              value={settings.theme}
              exclusive
              onChange={handleThemeChange}
              aria-label="theme selection"
            >
              <ToggleButton value="light" aria-label="light theme">
                <LightIcon sx={{ mr: 1 }} />
                明亮
              </ToggleButton>
              <ToggleButton value="dark" aria-label="dark theme">
                <DarkIcon sx={{ mr: 1 }} />
                暗黑
              </ToggleButton>
              <ToggleButton value="system" aria-label="system theme">
                <AutoIcon sx={{ mr: 1 }} />
                跟隨系統
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* 提交按鈕 */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
            >
              保存設置
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}

export default BasicSettings; 