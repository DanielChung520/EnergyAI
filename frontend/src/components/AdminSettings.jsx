import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

function AdminSettings() {
  const [adminData, setAdminData] = useState({
    company: '',
    adminAccount: '',
    employeeId: '',
    email: '',
    phone: '',
    password: 'bioengy',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAdminData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    // 邮箱格式验证
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(adminData.email)) {
      alert('请输入有效的邮箱地址');
      return;
    }

    // 密码验证
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(adminData.password)) {
      alert('密码至少包含8个字符的字母和数字');
      return;
    }

    // 提交逻辑
    console.log('Admin Data:', adminData);
  };

  return (
    <Box sx={{ p: 3, maxWidth: '33%', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        系統管理員設置
      </Typography>
      <TextField
        fullWidth
        label="公司組織"
        name="company"
        value={adminData.company}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="管理員賬號"
        name="adminAccount"
        value={adminData.adminAccount}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="組織員工編號"
        name="employeeId"
        value={adminData.employeeId}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="郵箱"
        name="email"
        value={adminData.email}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="電話"
        name="phone"
        value={adminData.phone}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="密碼"
        name="password"
        type="password"
        value={adminData.password}
        onChange={handleChange}
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
        保存
      </Button>
    </Box>
  );
}

export default AdminSettings; 