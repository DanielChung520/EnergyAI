import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardHeader,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useTheme } from '../../contexts/ThemeProvider';
import CustomAlert from '../../components/CustomAlert';

const RoleFunctions = () => {
  const { theme } = useTheme();
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [checked, setChecked] = useState([]);
  const [left, setLeft] = useState([]);
  const [right, setRight] = useState([]);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [selectAll, setSelectAll] = useState(false);
  const [modules, setModules] = useState([]);
  const [allReadOnly, setAllReadOnly] = useState(false);
  const [allReadWrite, setAllReadWrite] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('info');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchFunctions();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles/');
      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchFunctions = async () => {
    try {
      const response = await fetch('/api/system/function');
      if (!response.ok) {
        throw new Error('Failed to fetch functions');
      }
      const data = await response.json();
      const formattedData = Array.isArray(data) ? data.map(func => ({
        id: func.uid,
        no: func.no,
        function: func.item_cn,
        desc: func.item_en,
        module: func.module,
        type: func.type,
        route: func.route,
        level: func.level,
        icon: func.icon
      })) : [];

      const uniqueModules = [...new Set(formattedData.map(func => func.module))];
      setModules(uniqueModules);
      setLeft(formattedData);
    } catch (error) {
      console.error('Error fetching functions:', error);
      setLeft([]);
    }
  };

  const handleRoleChange = async (event) => {
    const roleId = event.target.value;
    setSelectedRole(roleId);

    try {
      const response = await fetch(`/api/roles/function/${roleId}`);
      const data = await response.json();
      
      if (data.success) {
        setRight(data.data.map(func => ({
          ...func,
          permission: func.permission || 'r'
        })));
        setLeft(prev => prev.filter(item =>
          !data.data.find(func => func.id === item.id)
        ));
      } else {
        setRight([]);
        fetchFunctions();
      }
    } catch (error) {
      console.error('Error fetching role functions:', error);
      setRight([]);
      fetchFunctions();
    }
  };

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleAllRight = () => {
    setRight(right.concat(left));
    setLeft([]);
  };

  const handleCheckedRight = () => {
    setRight(right.concat(checked));
    setLeft(left.filter((value) => !checked.includes(value)));
    setChecked([]);
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(checked));
    setRight(right.filter((value) => !checked.includes(value)));
    setChecked([]);
  };

  const handleAllLeft = () => {
    setLeft(left.concat(right));
    setRight([]);
  };

  const handlePermissionChange = (func) => (event) => {
    const newRight = right.map((item) =>
      item.id === func.id ? { ...item, permission: event.target.checked ? 'w' : 'r' } : item
    );
    setRight(newRight);
  };

  const handleModuleFilterChange = (event) => {
    setModuleFilter(event.target.value);
    setSelectAll(false);
    setChecked([]);
  };

  const handleSelectAllChange = (event) => {
    setSelectAll(event.target.checked);
    if (event.target.checked) {
      const filteredItems = left.filter(item =>
        moduleFilter === 'all' || item.module === moduleFilter
      );
      setChecked(filteredItems);
    } else {
      setChecked([]);
    }
  };

  const handleAllReadOnly = (event) => {
    setAllReadOnly(event.target.checked);
    setAllReadWrite(false);
    if (event.target.checked) {
      const newRight = right.map(item => ({
        ...item,
        permission: 'r'
      }));
      setRight(newRight);
    }
  };

  const handleAllReadWrite = (event) => {
    setAllReadWrite(event.target.checked);
    setAllReadOnly(false);
    if (event.target.checked) {
      const newRight = right.map(item => ({
        ...item,
        permission: 'w'
      }));
      setRight(newRight);
    }
  };

  const handleSaveRoleFunctions = async () => {
    if (!selectedRole) {
      setAlertType('warning');
      setAlertMessage('請選擇角色');
      setAlertOpen(true);
      return;
    }

    document.activeElement?.blur();
    
    setAlertType('confirm');
    setAlertMessage('是否確定分配角色功能權限？');
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    try {
      const response = await fetch(`/api/roles/function`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: selectedRole,
          functions: right.map(func => ({
            function: func.id,
            permission: func.permission
          }))
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAlertType('success');
        setAlertMessage('角色功能分配成功');
        setAlertOpen(true);
        handleRoleChange({ target: { value: selectedRole } });
      } else {
        setAlertType('error');
        setAlertMessage(data.error?.message || '保存失敗');
        setAlertOpen(true);
      }
    } catch (error) {
      console.error('Error saving role functions:', error);
      setAlertType('error');
      setAlertMessage('保存失敗：' + error.message);
      setAlertOpen(true);
    }
  };

  const filteredItems = left.filter(item =>
    moduleFilter === 'all' || item.module === moduleFilter
  );

  const customList = (items, side) => (
    <Card sx={{
      mb: 4,
      maxHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
      borderRadius: 2,
    }}>
      <CardHeader
        title={side === 'left' ? '可用功能列表' : '已分配功能'}
        action={
          side === 'right' && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={allReadOnly}
                    onChange={handleAllReadOnly}
                  />
                }
                label="全部唯讀"
                sx={{ mr: 1 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={allReadWrite}
                    onChange={handleAllReadWrite}
                  />
                }
                label="全部讀寫"
              />
            </Box>
          )
        }
        sx={{
          px: 2,
          py: 1,
          backgroundColor: 'primary.main',
          color: 'white',
          '& .MuiCardHeader-title': {
            fontSize: '1rem',
            fontWeight: 500
          },
          '& .MuiCardHeader-action': {
            color: 'white',
            m: 0,
            alignSelf: 'center'
          },
          '& .MuiFormControlLabel-label': {
            color: 'white',
            fontSize: '0.875rem'
          }
        }}
      />
      <Divider />
      <List dense component="div" role="list" sx={{
        padding: 1,
        width: '100%',
        height: '75vh',
        flexGrow: 1,
        overflow: 'auto',
        backgroundColor: 'white',
      }}>
        {(side === 'left' ? items : items).map((func) => (
          <ListItem 
            key={func.id} 
            role="listitem" 
            button
            onClick={() => handleToggle(func)()}
            sx={{
              backgroundColor: side === 'left' && checked.includes(func) ? 'rgba(25, 118, 210, 0.2)' : 
                side === 'right' && checked.includes(func) ? 'rgba(25, 118, 210, 0.2)' : 'transparent',
              '&:hover': {
                backgroundColor: side === 'left' 
                  ? checked.includes(func) 
                    ? 'rgba(25, 118, 210, 0.3)'
                    : 'rgba(0, 0, 0, 0.06)'
                  : side === 'right' && checked.includes(func) 
                    ? 'rgba(25, 118, 210, 0.3)' 
                    : 'rgba(0, 0, 0, 0.06)'
              }
            }}
          >
            <ListItemText 
              primary={
                <Typography>
                  {func.no} {func.function}
                </Typography>
              }
              secondary={
                side === 'left' ? (
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                    {func.module}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    {func.desc}
                  </Typography>
                )
              }
            />
            {side === 'right' && (
              <ListItemSecondaryAction>
                <FormControlLabel
                  control={
                    <Switch
                      checked={func.permission === 'w'}
                      onChange={handlePermissionChange(func)}
                    />
                  }
                  label={func.permission === 'w' ? '讀寫' : '唯讀'}
                />
              </ListItemSecondaryAction>
            )}
          </ListItem>
        ))}
      </List>
    </Card>
  );

  return (
    <Box sx={{ 
      padding: theme.spacing(2, 30),
      height: 'calc(100vh - 20px)',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#e3f2fd',

    }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h5" gutterBottom>
          Role Functions Management
        </Typography>
      </Box>

      <Box 
        sx={{ 
          mb: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          flexGrow: 1,
          border: '1px solid #ddd',
          borderRadius: 2,
          boxShadow: 4,
          padding: 2,
          backgroundColor: 'white',
          opacity: 0.9
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>模組篩選</InputLabel>
              <Select
                value={moduleFilter}
                onChange={handleModuleFilterChange}
                label="模組篩選"
              >
                <MenuItem value="all">全部</MenuItem>
                {modules.map((module) => (
                  <MenuItem key={module} value={module}>
                    {module}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200, mr: 3 }}>
              <InputLabel 
                id="role-select-label"
              >
                選擇角色
              </InputLabel>
              <Select
                labelId="role-select-label"
                value={selectedRole}
                onChange={handleRoleChange}
                label="選擇角色"
              >
                <MenuItem value="" disabled>
                  請選擇角色
                </MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.desc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button 
              variant="contained" 
              size="small"
              disabled={!selectedRole}
              onClick={handleSaveRoleFunctions}
              sx={{ 
                height: 40,
                minWidth: 140,
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark'
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(0, 0, 0, 0.12)',
                  color: 'rgba(0, 0, 0, 0.26)'
                }
              }}
            >
              確定分配角色功能
            </Button>
          </Box>
        </Box>

        <Grid
          container 
          spacing={2} 
          sx={{ 
            flexGrow: 1,
            minHeight: 400 
          }}
        > 
          <Grid item xs={5}> 
            {customList(left, 'left')} 
          </Grid>
          <Grid item xs={2} sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%'
          }}>
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              padding: 2,
              border: '1px solid #ddd',
              borderRadius: 1,
              backgroundColor: 'background.paper'
            }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleAllRight}
                disabled={left.length === 0}
              >
                ≫
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCheckedRight}
                disabled={checked.length === 0}
              >
                &gt;
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCheckedLeft}
                disabled={checked.length === 0}
              >
                &lt;
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleAllLeft}
                disabled={right.length === 0}
              >
                ≪
              </Button>
            </Box>
          </Grid>
          <Grid item xs={5}> 
            {customList(right, 'right')} 
          </Grid>
        </Grid>
      </Box>

      <CustomAlert 
        open={alertOpen} 
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertOpen(false)} 
      />

      <CustomAlert 
        open={confirmOpen}
        message={alertMessage}
        type="confirm"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
      />
    </Box>
  );
};

export default RoleFunctions;
