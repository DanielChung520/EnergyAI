import React, { useState } from 'react';
import { Box, Typography, FormControl, FormControlLabel, RadioGroup, Radio, TextField, Button } from '@mui/material';

function SystemSettings() {
  const [appearance, setAppearance] = useState('system');
  const [fontSize, setFontSize] = useState('medium');
  const [rememberLogin, setRememberLogin] = useState(false);
  const [loginDays, setLoginDays] = useState(0);

  const handleAppearanceChange = (event) => {
    setAppearance(event.target.value);
  };

  const handleFontSizeChange = (event) => {
    setFontSize(event.target.value);
  };

  const handleRememberLoginChange = (event) => {
    setRememberLogin(event.target.checked);
  };

  const handleLoginDaysChange = (event) => {
    setLoginDays(event.target.value);
  };

  const handleSubmit = () => {
    // 提交逻辑
    console.log('System Settings:', { appearance, fontSize, rememberLogin, loginDays });
  };

  return (
    <Box sx={{ p: 3, maxWidth: '50%', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        系統基本設置
      </Typography>

      {/* 系統外觀 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">系統外觀</Typography>
        <FormControl component="fieldset">
          <RadioGroup row value={appearance} onChange={handleAppearanceChange}>
            <FormControlLabel value="light" control={<Radio />} label="明亮" />
            <FormControlLabel value="dark" control={<Radio />} label="黑暗" />
            <FormControlLabel value="system" control={<Radio />} label="跟隨系統" />
          </RadioGroup>
        </FormControl>
        <TextField
          fullWidth
          label="內容字體大小"
          name="fontSize"
          value={fontSize}
          onChange={handleFontSizeChange}
          margin="normal"
        />
      </Box>

      {/* 賬號管理 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">賬號管理</Typography>
        <FormControlLabel
          control={<Radio checked={rememberLogin} onChange={handleRememberLoginChange} />}
          label="是否記住賬號自動登錄"
        />
        <TextField
          fullWidth
          label="保持免登錄天數"
          name="loginDays"
          type="number"
          value={loginDays}
          onChange={handleLoginDaysChange}
          margin="normal"
          inputProps={{ min: 0, max: 30 }}
        />
      </Box>

      <Button variant="contained" color="primary" onClick={handleSubmit}>
        保存
      </Button>
    </Box>
  );
}

export default SystemSettings; 