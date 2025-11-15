import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { saveUserState, getUserState } from '../utils/localStorage';
import LogoImage from '../assets/BioEngy1_v1_W.png';
import WindTurbineLeft from '../assets/wind-turbine-left.jpg';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.username, formData.password);
      
      // 檢查是否有之前保存的路徑
      const savedState = getUserState();
      const defaultPath = '/app/Maps/GlobalMaps';
      let targetPath = defaultPath;

      if (savedState && savedState.username === formData.username) {
        targetPath = savedState.lastPath || defaultPath;
      }
      
      // 保存新的登入狀態
      saveUserState(formData.username, targetPath);
      
      // 導航到目標路徑
      navigate(targetPath);
    } catch (err) {
      setError('登入失敗：' + (err.message || '請檢查用戶名和密碼'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        py: 12,
        px: 2
      }}
    >
      {/* 背景圖層 - 添加模糊效果 */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${WindTurbineLeft})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(2px)',
          transform: 'scale(1.1)',
          zIndex: 0,
        }}
      />
      
      {/* 覆蓋層 - 使用半透明藍色 */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(13, 94, 161, 0.5)',
          backdropFilter: 'blur(6px)',
          zIndex: 1,
        }}
      />
      
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <img
            src={LogoImage}
            alt="Logo"
            style={{ height: 60, marginBottom: 16 }}
          />
          <Typography
            variant="h4"
            component="h1"
            sx={{ color: 'white', mb: 2 }}
          >
            Bio-Energy AI Management Platform
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'rgba(245, 237, 213, 0.43)',
            backdropFilter: blur('6px'),
            gap: 2
          }}
        >
          <Typography variant="h5" component="h2" align="center" gutterBottom>
            系統登入
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TextField
              fullWidth
              label="用戶名"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoFocus
            />

            <TextField
              fullWidth
              label="密碼"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? '登入中...' : '登入'}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login; 