import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Paper,
  Stack,
  Avatar,
  Container,
  Grid,
  MenuItem
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { styled } from '@mui/material/styles';
import styles from '../styles/Register.module.css';

// 國家列表（可以根據需要擴展）
const countries = [
  { value: 'TW', label: '台灣' },
  { value: 'CN', label: '中國' },
  { value: 'HK', label: '香港' },
  { value: 'MO', label: '澳門' },
];

// 自定義上傳按鈕樣式
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    organization: '',
    country: 'TW',
    province: '',
    city: '',
    password: '',
    confirmPassword: '',
    avatar: null // 新增頭像字段
  });
  const [previewUrl, setPreviewUrl] = useState(null); // 用於預覽頭像
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  // 處理圖片上傳
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB 限制
        setError('圖片大小不能超過 5MB');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('只支持 JPG、PNG 和 GIF 格式的圖片');
        return;
      }

      setFormData(prev => ({
        ...prev,
        avatar: file
      }));

      // 創建預覽 URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 基本驗證
    if (formData.password !== formData.confirmPassword) {
      setError('密碼不匹配');
      return;
    }

    // 用戶名驗證
    const usernameRegex = /^[A-Za-z0-9]{4,}$/;
    if (!usernameRegex.test(formData.username)) {
      setError('用戶名必須至少4位，只能包含字母和數字');
      return;
    }

    // 手機號碼驗證
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('請輸入有效的手機號碼（10位數字）');
      return;
    }

    // 郵箱驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('請輸入有效的電子郵箱地址');
      return;
    }

    const success = await register(formData);
    if (success) {
      navigate('/');
    } else {
      setError('註冊失敗，請稍後再試');
    }
  };

  return (
    <Box className={styles.registerContainer}>
      <Container 
        maxWidth="md" 
        className={styles.contentContainer}
      >
        <Avatar className={styles.avatar}>
          <PersonAddIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography 
          component="h1" 
          variant="h4" 
          className={styles.title}
        >
          創建新帳號
        </Typography>
        <Paper 
          elevation={6}
          className={styles.formPaper}
        >
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
              {error && <Alert severity="error">{error}</Alert>}
              
              <Box
                className={styles.avatarUpload}
                onClick={() => document.getElementById('avatar-upload').click()}
              >
                {previewUrl ? (
                  <Box className={styles.avatarPreview}>
                    <img 
                      src={previewUrl} 
                      alt="頭像預覽"
                      className={styles.avatarImage}
                    />
                    <Box className={styles.avatarOverlay}>
                      <AddPhotoAlternateIcon />
                      <Typography variant="body2">
                        更換頭像
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box className={styles.avatarPlaceholder}>
                    <AddPhotoAlternateIcon sx={{ fontSize: 40 }} />
                    <Typography variant="body2">
                      點擊上傳頭像
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      支持 JPG、PNG、GIF（最大 5MB）
                    </Typography>
                  </Box>
                )}
                <VisuallyHiddenInput
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="username"
                    label="用戶名稱"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="phone"
                    label="聯繫電話"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="email"
                    label="電子郵箱"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="organization"
                    label="組織"
                    value={formData.organization}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    name="country"
                    label="國家"
                    value={formData.country}
                    onChange={handleChange}
                  >
                    {countries.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    name="province"
                    label="省份"
                    value={formData.province}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    name="city"
                    label="城市"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="密碼"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label="確認密碼"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                className={styles.submitButton}
              >
                註冊
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link 
                  component={RouterLink} 
                  to="/login" 
                  className={styles.link}
                >
                  已有帳號？返回登入
                </Link>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Register;
