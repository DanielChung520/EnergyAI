import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { useFunctions } from '../contexts/FunctionContext';
import { saveUserState } from '../utils/localStorage';

function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { selectedModule } = useFunctions();

  // 根據選擇的功能設置pageTitle
  const getPageTitle = () => {
    if (selectedModule) {
      return selectedModule.item_cn || selectedModule.item_en || '';
    }
    return '';
  };

  const isTopLevel = location.pathname === '/'; // 判斷是否為頂層頁面

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // 監聽路由變化
  useEffect(() => {
    if (user && user.username) {
      saveUserState(user.username, location.pathname);
    }
    // 添加調試日誌
    console.log('Current pathname:', location.pathname);
  }, [location.pathname, user]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar 
        open={drawerOpen} 
        handleDrawerToggle={handleDrawerToggle} 
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0.2,
          width: { sm: `calc(100% - ${drawerOpen ? 240 : 72}px)` },
          marginTop: '60px',
          transition: theme => theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Header 
          drawerOpen={drawerOpen} 
          currentPath={location.pathname}
          pageTitle={getPageTitle()} 
          isTopLevel={isTopLevel} 
        />
        <Outlet />
      </Box>
    </Box>
  );
}

export default MainLayout; 