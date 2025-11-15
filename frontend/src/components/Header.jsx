import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, Menu, MenuItem, ListItemIcon, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Person as PersonIcon, Settings as SettingsIcon, Logout as LogoutIcon, Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/BioEngy1_v1_W.png';
import LanguageSelector from './LanguageSelector';

const drawerWidth = 240;

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

function Header({ drawerOpen, currentPath }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // 獲取當前語言設置
  const currentLanguage = localStorage.getItem('language') || 'cn';
  
  // 從localStorage獲取functionList並解析
  const functionList = JSON.parse(localStorage.getItem('functionList') || '[]');
  
  // 添加調試日誌
  console.log('Current Path:', currentPath);
  console.log('Function List:', functionList);
  
  // 根據路徑查找當前功能
  const getCurrentFunction = () => {
    // 添加調試日誌
    console.log('Searching for path:', currentPath);
    
    return functionList.find(func => {
      try {
        // 確保所有必要的值都存在
        if (!func || !func.route || !currentPath) {
          console.log('Invalid function or path:', func);
          return false;
        }
        
        console.log('Comparing route:', func.route, 'with currentPath:', currentPath);
        const normalizedPath = currentPath.startsWith('/') ? currentPath.slice(1) : currentPath;
        const normalizedRoute = func.route.startsWith('/') ? func.route.slice(1) : func.route;
        
        return normalizedPath.includes(normalizedRoute) || normalizedRoute.includes(normalizedPath);
      } catch (error) {
        console.error('Error comparing routes:', error);
        return false;
      }
    });
  };

  const currentFunction = getCurrentFunction();
  console.log('Current Function:', currentFunction);
  
  // 獲取本地化的標題
  const getLocalizedTitle = () => {
    if (!currentFunction) {
      console.log('No matching function found');
      return currentLanguage === 'cn' ? '未定義功能名稱' : 'Undefined Function Name';
    }
    const title = currentLanguage === 'cn' ? currentFunction.item_cn : currentFunction.item_en;
    console.log('Title:', title);
    return title;
  };

  // 判斷是否為頂層或二級功能
  const shouldShowHome = currentFunction ? (currentFunction.level === 1 || currentFunction.level === 2) : true;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleBackClick = () => {
    // 修改为返回上一页
    navigate(-1);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: 1100,
        backgroundColor: '#1976d2',
        color: 'white',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: 1,
        width: { sm: `calc(100% - ${drawerOpen ? 240 : 72}px)` },
        ml: { sm: `${drawerOpen ? 240 : 72}px` },
        transition: theme => theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <Toolbar>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 2,
          }}
        >
          <img 
            src={logo} 
            alt="BioEngy Logo" 
            style={{
              height: '50px',
              width: 'auto'
            }}
          />
          <Typography 
            variant="h5" 
            sx={{
              color: 'inherit',
              fontWeight: 'bold',
              fontFamily: 'Lato',
              mb: 0.5,
              lineHeight: 1,
            }}
          >
            {getLocalizedTitle()}
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 2
        }}>
          <IconButton 
            color="inherit" 
            onClick={handleBackClick}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <LanguageSelector />
          <IconButton 
            color="inherit" 
            onClick={handleMenuOpen}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              }
            }}
          >
            <Avatar sx={{ bgcolor: 'primary.dark' }}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            handleMenuClose();
            setProfileOpen(true);
          }}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            個人資料
          </MenuItem>
          <MenuItem onClick={() => {
            handleMenuClose();
            setChangePasswordOpen(true);
          }}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            變更密碼
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            登出
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Header; 