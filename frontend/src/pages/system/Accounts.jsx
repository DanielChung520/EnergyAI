import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel, Chip, Button, Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ClearIcon from '@mui/icons-material/Clear';
import { useTheme } from '../../contexts/ThemeProvider';
import OutlinedTextField from '../../components/OutlinedTextField';
import CustomAlert from '../../components/CustomAlert'; // 確保路徑正確

const securityLevelMap = {
  "1": "系統管理員最高權限",
  "2": "系統管理一般權限",
  "3": "使用者最高權限",
  "4": "使用者一般權限"
};

const Accounts = () => {
  const { theme, isDarkMode } = useTheme(); // 引入主題相關設置
  const [users, setUsers] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('userid'); // 假設用戶名字段為 userid
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState({ id: '', userid: '', nickname: '', org: '', empno: '', email: '', phone: '', remark: '', password: '', confirmPassword: '', role: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        console.error('API返回錯誤:', data.error);
      }
    } catch (error) {
      console.error('獲取用戶列表失敗:', error);
    }
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleEdit = (userId) => {
    const userToEdit = users.find(user => user.userid === userId);
    setUserData(userToEdit);
    setCurrentUser(userId);
    setDialogOpen(true);
  };

  const handleDelete = async (userId) => {
    const confirmed = window.confirm('確定要刪除這個用戶嗎？');
    if (confirmed) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete user');
        }

        // 刪除成功後重新獲取用戶列表
        fetchUsers();
      } catch (error) {
        console.error('刪除用戶失敗:', error);
      }
    }
  };

  const handleAddUser = () => {
    setUserData({ 
      id: '', 
      userid: '', 
      nickname: '', 
      org: '', 
      empno: '', 
      email: '', 
      phone: '', 
      remark: '', 
      password: '', 
      confirmPassword: '',
      role: '4' // 設置默認角色為 "使用者一般權限"
    });
    setCurrentUser(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentUser(null);
    setPasswordError(''); // 重置密碼錯誤
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSaveUser = async () => {
    if (userData.password !== userData.confirmPassword) {
      alert('密碼不一致！');
      return;
    }

    try {
      const method = currentUser ? 'PUT' : 'POST';
      const url = currentUser ? `/api/users/${currentUser}` : '/api/users/';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userid: userData.userid,
          nickname: userData.nickname,
          org: userData.org,
          empno: userData.empno,
          email: userData.email,
          phone: userData.phone,
          remark: userData.remark,
          password: userData.password,
          role: userData.role // 添加角色
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save user');
      }

      fetchUsers();
      handleDialogClose();
    } catch (error) {
      console.error('保存用戶失敗:', error);
    }
  };

  const handleConfirmPasswordBlur = () => {
    if (userData.password !== userData.confirmPassword) {
      setPasswordError('密碼不一致！');
    } else {
      setPasswordError('');
    }
  };

  const handleClearConfirmPassword = () => {
    setUserData({ ...userData, confirmPassword: '' }); // 清空確認密碼欄位
    setPasswordError(''); // 清除錯誤提示
  };

  const handleResetPassword = (userId) => {
    setPendingUserId(userId);
    setAlertTitle('密碼初始化確認');
    setAlertMessage('確定要初始化密碼為 "bioengy" 嗎？');
    setConfirmOpen(true);
  };

  const handleConfirmReset = async () => {
    setConfirmOpen(false);
    try {
      const response = await fetch(`/api/users/reset-password/${pendingUserId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword: 'bioengy' }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      setAlertTitle('密碼初始化成功');
      setAlertMessage('密碼已成功初始化為 "bioengy"');
      setAlertOpen(true);
      fetchUsers();
    } catch (error) {
      console.error('初始化密碼失敗:', error);
      setAlertTitle('初始化密碼失敗');
      setAlertMessage('初始化密碼失敗，請重試。');
      setAlertOpen(true);
    }
  };

  const handleCancelReset = () => {
    setConfirmOpen(false);
    setPendingUserId(null);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  const sortedUsers = users.sort((a, b) => {
    if (a[orderBy] < b[orderBy]) {
      return order === 'asc' ? -1 : 1;
    }
    if (a[orderBy] > b[orderBy]) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // 表格標題列的樣式
  const headerCellStyle = {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  };

  // 表格內容的樣式
  const tableContainerStyle = {
    maxHeight: 'calc(100vh - 200px)',
    backgroundColor: theme.palette.background.paper,
  };

  // Dialog 的樣式
  const dialogStyle = {
    '& .MuiDialog-paper': {
      backgroundColor: theme.palette.background.paper,
    },
  };

  const checkUserIdUnique = async (userid) => {
    try {
      const response = await fetch(`/api/users/${userid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.error ? false : true; // 如果返回錯誤，則用戶名已存在
      } else {
        throw new Error('Failed to check user ID uniqueness');
      }
    } catch (error) {
      console.error('檢查用戶名唯一性失敗:', error);
      return false; // 默認返回 false
    }
  };

  const handleUserIdBlur = async () => {
    // 只有在新增用戶時才檢查唯一性
    if (!currentUser && userData.userid) { // 確保 userid 有值
      const isUnique = await checkUserIdUnique(userData.userid);
      if (!isUnique) {
        alert('用戶名已存在，請選擇其他用戶名。');
        setUserData({ ...userData, userid: '' }); // 清空用戶名欄位
      }
    }
  };

  const handleUserIdKeyDown = async (e) => {
    if (e.key === 'Enter') {
      await handleUserIdBlur();
    }
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', backgroundColor: theme.palette.background.paper }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2 }}>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleIcon />}
          onClick={handleAddUser}
        >
          新增用戶
        </Button>
      </Box>
      <TableContainer sx={tableContainerStyle}>
        <Table stickyHeader aria-label="用戶列表">
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellStyle}>
                <TableSortLabel
                  active={orderBy === 'userid'}
                  direction={orderBy === 'userid' ? order : 'asc'}
                  onClick={() => handleSort('userid')}
                  sx={{ 
                    color: 'inherit',
                    '&.MuiTableSortLabel-active': {
                      color: theme.palette.primary.contrastText,
                    },
                  }}
                >
                  用戶名
                </TableSortLabel>
              </TableCell>
              <TableCell sx={headerCellStyle}>
                <TableSortLabel
                  active={orderBy === 'nickname'}
                  direction={orderBy === 'nickname' ? order : 'asc'}
                  onClick={() => handleSort('nickname')}
                  sx={{ 
                    color: 'inherit',
                    '&.MuiTableSortLabel-active': {
                      color: theme.palette.primary.contrastText,
                    },
                  }}
                >
                  暱稱
                </TableSortLabel>
              </TableCell>
              <TableCell sx={headerCellStyle}>
                <TableSortLabel
                  active={orderBy === 'org'}
                  direction={orderBy === 'org' ? order : 'asc'}
                  onClick={() => handleSort('org')}
                  sx={{ 
                    color: 'inherit',
                    '&.MuiTableSortLabel-active': {
                      color: theme.palette.primary.contrastText,
                    },
                  }}
                >
                  公司組織
                </TableSortLabel>
              </TableCell>
              <TableCell sx={headerCellStyle}>
                <TableSortLabel
                  active={orderBy === 'empno'}
                  direction={orderBy === 'empno' ? order : 'asc'}
                  onClick={() => handleSort('empno')}
                  sx={{ 
                    color: 'inherit',
                    '&.MuiTableSortLabel-active': {
                      color: theme.palette.primary.contrastText,
                    },
                  }}
                >
                  工號
                </TableSortLabel>
              </TableCell>
              <TableCell sx={headerCellStyle}>
                <TableSortLabel
                  active={orderBy === 'role'}
                  direction={orderBy === 'role' ? order : 'asc'}
                  onClick={() => handleSort('role')}
                  sx={{ 
                    color: 'inherit',
                    '&.MuiTableSortLabel-active': {
                      color: theme.palette.primary.contrastText,
                    },
                  }}
                >
                  角色
                </TableSortLabel>
              </TableCell>
              <TableCell sx={headerCellStyle}>
                <TableSortLabel
                  active={orderBy === 'email'}
                  direction={orderBy === 'email' ? order : 'asc'}
                  onClick={() => handleSort('email')}
                  sx={{ 
                    color: 'inherit',
                    '&.MuiTableSortLabel-active': {
                      color: theme.palette.primary.contrastText,
                    },
                  }}
                >
                  郵件
                </TableSortLabel>
              </TableCell>
              <TableCell sx={headerCellStyle}>
                <TableSortLabel
                  active={orderBy === 'phone'}
                  direction={orderBy === 'phone' ? order : 'asc'}
                  onClick={() => handleSort('phone')}
                  sx={{ 
                    color: 'inherit',
                    '&.MuiTableSortLabel-active': {
                      color: theme.palette.primary.contrastText,
                    },
                  }}
                >
                  聯繫電話
                </TableSortLabel>
              </TableCell>
              <TableCell sx={headerCellStyle}>
                <TableSortLabel
                  active={orderBy === 'remark'}
                  direction={orderBy === 'remark' ? order : 'asc'}
                  onClick={() => handleSort('remark')}
                  sx={{ 
                    color: 'inherit',
                    '&.MuiTableSortLabel-active': {
                      color: theme.palette.primary.contrastText,
                    },
                  }}
                >
                  備註
                </TableSortLabel>
              </TableCell>
              <TableCell sx={headerCellStyle}>
                <TableSortLabel
                  active={orderBy === 'created_at'}
                  direction={orderBy === 'created_at' ? order : 'asc'}
                  onClick={() => handleSort('created_at')}
                  sx={{ 
                    color: 'inherit',
                    '&.MuiTableSortLabel-active': {
                      color: theme.palette.primary.contrastText,
                    },
                  }}
                >
                  創建日期
                </TableSortLabel>
              </TableCell>
              <TableCell sx={headerCellStyle}>
                <TableSortLabel
                  active={orderBy === 'updated_at'}
                  direction={orderBy === 'updated_at' ? order : 'asc'}
                  onClick={() => handleSort('updated_at')}
                  sx={{ 
                    color: 'inherit',
                    '&.MuiTableSortLabel-active': {
                      color: theme.palette.primary.contrastText,
                    },
                  }}
                >
                  更新日期
                </TableSortLabel>
              </TableCell>
              <TableCell sx={headerCellStyle}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedUsers.map((user) => (
              <TableRow key={user.uuid}>
                <TableCell>{user.userid}</TableCell>
                <TableCell>{user.nickname}</TableCell>
                <TableCell>{user.org}</TableCell>
                <TableCell>{user.empno}</TableCell>
                <TableCell>{securityLevelMap[user.role] || user.role}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.remark}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                <TableCell>{new Date(user.updated_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    label="編輯"
                    onClick={() => handleEdit(user.userid)}
                    color="primary"
                    variant="outlined"
                    sx={{ cursor: 'pointer', mr: 1 }}
                  />
                  <Chip
                    label="刪除"
                    onClick={() => handleDelete(user.userid)}
                    color="secondary"
                    variant="outlined"
                    sx={{ cursor: 'pointer', mr: 1 }}
                  />
                  <Chip
                    label="密碼初始化"
                    onClick={() => handleResetPassword(user.userid)}
                    color="default"
                    variant="outlined"
                    sx={{ cursor: 'pointer' }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 新增/編輯用戶對話框 */}
      <Dialog 
        open={isDialogOpen} 
        onClose={handleDialogClose}
        sx={dialogStyle}
      >
        {/* 添加這個隱藏的表單來禁用自動填充 */}
        <form autoComplete="off" style={{ display: 'none' }}>
          <input type="text" />
          <input type="password" />
        </form>
        
        <DialogTitle>{currentUser ? '編輯用戶' : '新增用戶'}</DialogTitle>
        <DialogContent>
          <OutlinedTextField
            autoFocus
            margin="dense"
            name="userid"
            label="用戶名"
            type="text"
            fullWidth
            value={userData.userid}
            onChange={handleUserChange}
            onBlur={handleUserIdBlur}
            onKeyDown={handleUserIdKeyDown}
          />
          <OutlinedTextField
            margin="dense"
            name="nickname"
            label="暱稱"
            type="text"
            fullWidth
            value={userData.nickname}
            onChange={handleUserChange}
          />
          <OutlinedTextField
            margin="dense"
            name="org"
            label="公司組織"
            type="text"
            fullWidth
            value={userData.org}
            onChange={handleUserChange}
          />
          <OutlinedTextField
            margin="dense"
            name="empno"
            label="工號"
            type="text"
            fullWidth
            value={userData.empno}
            onChange={handleUserChange}
          />
          <RadioGroup
            name="role"
            value={userData.role || ''}
            onChange={handleUserChange}
          >
            <FormControlLabel value="1" control={<Radio />} label="系統管理員最高權限" />
            <FormControlLabel value="2" control={<Radio />} label="系統管理一般權限" />
            <FormControlLabel value="3" control={<Radio />} label="使用者最高權限" />
            <FormControlLabel value="4" control={<Radio />} label="使用者一般權限" />
          </RadioGroup>
          <OutlinedTextField
            margin="dense"
            name="email"
            label="電子郵件"
            type="email"
            fullWidth
            value={userData.email}
            onChange={handleUserChange}
          />
          <OutlinedTextField
            margin="dense"
            name="phone"
            label="聯繫電話"
            type="text"
            fullWidth
            value={userData.phone}
            onChange={handleUserChange}
          />
          <OutlinedTextField
            margin="dense"
            name="remark"
            label="備註"
            type="text"
            fullWidth
            value={userData.remark}
            onChange={handleUserChange}
            autoComplete="off"
          />
          
          {/* 只有在新增用戶時顯示密碼和確認密碼欄位 */}
          {!currentUser && (
            <>
              <OutlinedTextField
                margin="dense"
                name="password"
                label="密碼"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={userData.password}
                onChange={handleUserChange}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <IconButton 
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
              <OutlinedTextField
                margin="dense"
                name="confirmPassword"
                label="確認密碼"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={userData.confirmPassword}
                onChange={handleUserChange}
                autoComplete="new-password"
                onBlur={handleConfirmPasswordBlur}
                error={!!passwordError}
                helperText={passwordError}
                InputProps={{
                  endAdornment: (
                    <>
                      <IconButton 
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                      {passwordError && (
                        <IconButton 
                          onClick={handleClearConfirmPassword}
                          edge="end"
                        >
                          <ClearIcon />
                        </IconButton>
                      )}
                    </>
                  ),
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            取消
          </Button>
          <Button onClick={handleSaveUser} color="primary">
            {currentUser ? '保存' : '新增'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 確認對話框 */}
      <CustomAlert 
        open={confirmOpen}
        title={alertTitle}
        message={alertMessage}
        onConfirm={handleConfirmReset}
        onCancel={handleCancelReset}
        showCancelButton={true}
      />

      {/* 結果提示對話框 */}
      <CustomAlert 
        open={alertOpen}
        title={alertTitle}
        message={alertMessage}
        onClose={handleCloseAlert}
        showCancelButton={false}
      />
    </Paper>
  );
};

export default Accounts;
