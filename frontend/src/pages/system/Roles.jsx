import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel, Chip, Button, Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { v4 as uuidv4 } from 'uuid';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('role');
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [roleData, setRoleData] = useState({ id: '', role: '', desc: '', security_level: '', remark: '' });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        redirect: 'manual'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }
      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
      } else {
        console.error('API返回錯誤:', data.error);
      }
    } catch (error) {
      console.error('獲取角色列表失敗:', error);
    }
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleEdit = (roleId) => {
    const roleToEdit = roles.find(role => role.id === roleId);
    setRoleData(roleToEdit);
    setCurrentRole(roleId);
    setDialogOpen(true);
  };

  const handleDelete = async (roleId) => {
    const confirmed = window.confirm('確定要刪除這個角色嗎？');
    if (confirmed) {
      try {
        const response = await fetch(`/api/roles/${roleId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete role');
        }

        // 刪除成功後重新獲取角色列表
        fetchRoles();
      } catch (error) {
        console.error('刪除角色失敗:', error);
      }
    }
  };

  const handleAddRole = () => {
    setRoleData({ id: uuidv4(), role: '', desc: '', security_level: '', remark: '' });
    setCurrentRole(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setCurrentRole(null);
  };

  const handleRoleChange = (e) => {
    const { name, value } = e.target;
    setRoleData({ ...roleData, [name]: value });
  };

  const handleSaveRole = async () => {
    try {
      const method = currentRole ? 'PUT' : 'POST';
      const url = currentRole ? `/api/roles/${currentRole}` : '/api/roles/';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        throw new Error('Failed to save role');
      }

      fetchRoles(); // 重新獲取角色列表
      handleDialogClose();
    } catch (error) {
      console.error('保存角色失敗:', error);
    }
  };

  const sortedRoles = roles.sort((a, b) => {
    if (a[orderBy] < b[orderBy]) {
      return order === 'asc' ? -1 : 1;
    }
    if (a[orderBy] > b[orderBy]) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // 安全級別映射
  const securityLevelMap = {
    "1": "系統管理員最高權限",
    "2": "系統管理一般權限",
    "3": "使用者最高權限",
    "4": "使用者一般權限"
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2 }}>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleIcon />}
          onClick={handleAddRole}
        >
          新增角色
        </Button>
      </Box>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
        <Table stickyHeader aria-label="角色列表">
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: 'primary.main', color: 'white' }}>
                <TableSortLabel
                  active={orderBy === 'role'}
                  direction={orderBy === 'role' ? order : 'asc'}
                  onClick={() => handleSort('role')}
                  sx={{ color: 'inherit' }}
                >
                  角色名稱
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ backgroundColor: 'primary.main', color: 'white' }}>
                <TableSortLabel
                  active={orderBy === 'desc'}
                  direction={orderBy === 'desc' ? order : 'asc'}
                  onClick={() => handleSort('desc')}
                  sx={{ color: 'inherit' }}
                >
                  描述
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ backgroundColor: 'primary.main', color: 'white' }}>
                <TableSortLabel
                  active={orderBy === 'security_level'}
                  direction={orderBy === 'security_level' ? order : 'asc'}
                  onClick={() => handleSort('security_level')}
                  sx={{ color: 'inherit' }}
                >
                  安全級別
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ backgroundColor: 'primary.main', color: 'white' }}>備註</TableCell>
              <TableCell sx={{ backgroundColor: 'primary.main', color: 'white' }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRoles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.role}</TableCell>
                <TableCell>{role.desc}</TableCell>
                <TableCell>{securityLevelMap[role.security_level]}</TableCell>
                <TableCell>{role.remark}</TableCell>
                <TableCell>
                  <Chip
                    label="編輯"
                    onClick={() => handleEdit(role.id)}
                    color="primary"
                    variant="outlined"
                    sx={{ cursor: 'pointer', mr: 1 }}
                  />
                  <Chip
                    label="刪除"
                    onClick={() => handleDelete(role.id)}
                    color="secondary"
                    variant="outlined"
                    sx={{ cursor: 'pointer' }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 新增/編輯角色對話框 */}
      <Dialog open={isDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>{currentRole ? '編輯角色' : '新增角色'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="role"
            label="角色名稱"
            type="text"
            fullWidth
            variant="outlined"
            value={roleData.role}
            onChange={handleRoleChange}
          />
          <TextField
            margin="dense"
            name="desc"
            label="描述"
            type="text"
            fullWidth
            variant="outlined"
            value={roleData.desc}
            onChange={handleRoleChange}
          />
          <RadioGroup
            name="security_level"
            value={roleData.security_level}
            onChange={handleRoleChange}
          >
            <FormControlLabel value="1" control={<Radio />} label="系統管理員最高權限" />
            <FormControlLabel value="2" control={<Radio />} label="系統管理一般權限" />
            <FormControlLabel value="3" control={<Radio />} label="使用者最高權限" />
            <FormControlLabel value="4" control={<Radio />} label="使用者一般權限" />
          </RadioGroup>
          <TextField
            margin="dense"
            name="remark"
            label="備註"
            type="text"
            fullWidth
            variant="outlined"
            value={roleData.remark}
            onChange={handleRoleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            取消
          </Button>
          <Button onClick={handleSaveRole} color="primary">
            {currentRole ? '保存' : '新增'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Roles;
