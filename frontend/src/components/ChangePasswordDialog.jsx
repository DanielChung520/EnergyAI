import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

function ChangePasswordDialog({ open, onClose }) {
  const { changePassword } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('新密碼與確認密碼不符');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('新密碼長度至少需要6個字符');
      return;
    }

    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }, 1500);
    } catch (error) {
      setError(error.message || '密碼修改失敗');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>修改密碼</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">密碼修改成功！</Alert>}
            <TextField
              name="currentPassword"
              label="當前密碼"
              type="password"
              fullWidth
              required
              value={formData.currentPassword}
              onChange={handleChange}
            />
            <TextField
              name="newPassword"
              label="新密碼"
              type="password"
              fullWidth
              required
              value={formData.newPassword}
              onChange={handleChange}
            />
            <TextField
              name="confirmPassword"
              label="確認新密碼"
              type="password"
              fullWidth
              required
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>取消</Button>
          <Button type="submit" variant="contained" color="primary">
            確認修改
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ChangePasswordDialog; 