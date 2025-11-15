import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Collapse,
  Box,
  Toolbar,
  Divider,
  CircularProgress,
  Popper,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem as MuiMenuItem,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  Circle as DefaultIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useFunctions } from '../contexts/FunctionContext';
import * as MuiIcons from '@mui/icons-material';

const drawerWidth = 240;

// 創建一個函數來獲取 MUI 圖標組件
const getIconComponent = (iconName) => {
  // 將第一個字母大寫，因為 MUI 的圖標名稱都是大寫開頭
  const formattedIconName = iconName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

  // 從 MUI Icons 中獲取圖標組件
  return MuiIcons[formattedIconName] || DefaultIcon;
};

function MenuItem({ item, level = 0, drawerOpen, handleDrawerToggle }) {
  const [open, setOpen] = useState(false);
  const [popperOpen, setPopperOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const anchorRef = useRef(null);
  const timerRef = useRef(null);

  const handlePopperOpen = () => {
    if (!drawerOpen && item.children?.length > 0) {
      clearTimeout(timerRef.current);
      setPopperOpen(true);
    }
  };

  const handlePopperClose = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPopperOpen(false);
    }, 300);
  };

  const handleMenuMouseEnter = () => {
    clearTimeout(timerRef.current);
    setPopperOpen(true);
  };

  const handleMenuMouseLeave = () => {
    handlePopperClose();
  };

  const handleMenuItemClick = (childItem) => {
    if (childItem.route) {
      navigate(`/app/${childItem.route}`);
      setPopperOpen(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // 添加檢查函數來判斷是否應該顯示該項目
  const shouldShowItem = (menuItem) => {
    // 如果項目有children，檢查是否有任何子項需要顯示
    if (menuItem.children && menuItem.children.length > 0) {
      return menuItem.children.some(child => shouldShowItem(child));
    }
    // 檢查項目的編號是否以A或X開頭
    return menuItem.no && (menuItem.no.startsWith('A') || menuItem.no.startsWith('X'));
  };

  // 如果當前項目不應該顯示，返回null
  if (!shouldShowItem(item)) {
    return null;
  }

  const IconComponent = item.icon ? getIconComponent(item.icon) : DefaultIcon;

  const handleClick = () => {
    if (item.children && item.children.length > 0) {
      setOpen(!open);
    } else if (item.route) {
      const routePath = `/app/${item.route}`;
      console.log('Navigating to:', routePath);
      navigate(routePath);
      setPopperOpen(false);
    }
  };

  // 檢查當前路徑是否匹配時也要保持大小寫一致
  const isSelected = item.route && 
    location.pathname === `/app/${item.route}`;

  return (
    <>
      <ListItem 
        button
        ref={anchorRef}
        onClick={handleClick}
        onMouseEnter={handlePopperOpen}
        onMouseLeave={handlePopperClose}
        sx={{
          pl: level ? 4 : 2,
          pr: 2,
          minHeight: 48,
          justifyContent: drawerOpen ? 'initial' : 'center',
          backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
          '& .MuiListItemIcon-root': {
            color: isSelected ? '#90caf9' : 'white',
            minWidth: drawerOpen ? 36 : 0,
            mr: drawerOpen ? 'auto' : 'initial',
            justifyContent: 'center',
          },
          '& .MuiListItemText-root': {
            opacity: drawerOpen ? 1 : 0,
            transition: 'opacity 0.2s',
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            '& .MuiListItemIcon-root': {
              color: '#90caf9'
            }
          }
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: drawerOpen ? 36 : 0,
            mr: drawerOpen ? 3 : 'auto',
            justifyContent: 'center',
          }}
        >
          <IconComponent />
        </ListItemIcon>
        <ListItemText 
          primary={item.text}
          sx={{
            opacity: drawerOpen ? 1 : 0,
            display: drawerOpen ? 'block' : 'none',
          }} 
        />
        {item.children && item.children.length > 0 && drawerOpen && (
          open ? <ExpandLess /> : <ExpandMore />
        )}
      </ListItem>

      {!drawerOpen && item.children && item.children.length > 0 && (
        <Popper
          open={popperOpen}
          anchorEl={anchorRef.current}
          placement="right-start"
          sx={{ zIndex: 1300 }}
        >
          <Paper
            onMouseEnter={handleMenuMouseEnter}
            onMouseLeave={handleMenuMouseLeave}
            sx={{
              backgroundColor: '#424242',
              color: 'white',
              minWidth: 200,
              maxHeight: 400,
              overflowY: 'auto',
              mt: 0,
              ml: 0.5,
            }}
          >
            <ClickAwayListener onClickAway={() => setPopperOpen(false)}>
              <MenuList>
                {item.children.map((child) => {
                  const ChildIconComponent = child.icon ? getIconComponent(child.icon) : DefaultIcon;
                  
                  return (
                    <MuiMenuItem
                      key={child.id}
                      onClick={() => handleMenuItemClick(child)}
                      sx={{
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        },
                        ...(location.pathname === `/app/${child.route}` && {
                          backgroundColor: 'rgba(255, 255, 255, 0.12)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.16)',
                          }
                        })
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                        <ChildIconComponent />
                      </ListItemIcon>
                      <ListItemText primary={child.text} />
                    </MuiMenuItem>
                  );
                })}
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Popper>
      )}

      {item.children && item.children.length > 0 && drawerOpen && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children.map((child) => (
              <MenuItem 
                key={child.id} 
                item={child} 
                level={level + 1} 
                drawerOpen={drawerOpen}
                handleDrawerToggle={handleDrawerToggle}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

function Sidebar({ open = false, handleDrawerToggle }) {
  const { menuItems, loading, error } = useFunctions();
  const navigate = useNavigate();
  
  // 在組件加載時檢查是否應該展開
  useEffect(() => {
    const shouldBeOpen = localStorage.getItem('sidebarOpen') === 'true';
    if (open !== shouldBeOpen) {
      handleDrawerToggle();
    }
  }, []);

  // 當狀態改變時保存到 localStorage
  useEffect(() => {
    localStorage.setItem('sidebarOpen', open);
  }, [open]);

  const handleHomeClick = () => {
    navigate('/');
  };

  useEffect(() => {
    console.log('Sidebar menuItems:', menuItems);
  }, [menuItems]);

  // 添加過濾函數
  const filterMenuItems = (items) => {
    if (!items) return [];
    
    return items.filter(item => {
      // 如果有子項目，遞迴過濾
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterMenuItems(item.children);
        // 如果過濾後的子項目不為空，保留該組
        if (filteredChildren.length > 0) {
          item.children = filteredChildren;
          return true;
        }
        return false;
      }
      // 檢查項目編號是否以A或X開頭
      return item.no && (item.no.startsWith('A') || item.no.startsWith('X'));
    });
  };

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? 240 : 72,
        flexShrink: 0,
        zIndex: 1200,
        '& .MuiDrawer-paper': {
          width: open ? 240 : 72,
          backgroundColor: '#333b48',
          color: 'white',
          overflowX: 'hidden',
          transition: 'width 0.2s',
          zIndex: 1200
        }
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'center',
          padding: '0 !important',
          minHeight: 64,
        }}
      >
        <IconButton
          color="inherit"
          onClick={handleDrawerToggle}
          sx={{ 
            width: '100%',
            height: '100%',
            borderRadius: 0
          }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
      <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)' }} />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItem
            button
            onClick={handleHomeClick}
            sx={{
              pl: open ? 2 : 0,
              pr: open ? 2 : 0,
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              '& .MuiListItemIcon-root': {
                color: 'white',
                minWidth: open ? 36 : 0,
                mr: open ? 3 : 0,
                justifyContent: 'center',
                width: open ? 'auto' : '100%',
              },
              '& .MuiListItemText-root': {
                opacity: open ? 1 : 0,
                display: open ? 'block' : 'none',
                ml: open ? 2 : 0,
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                '& .MuiListItemIcon-root': {
                  color: '#90caf9'
                }
              }
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: open ? 36 : 0,
                mr: open ? 3 : 0,
                justifyContent: 'center',
                width: open ? 'auto' : '100%',
              }}
            >
              <HomeIcon />
            </ListItemIcon>
            <ListItemText 
              primary="首頁"
              sx={{
                opacity: open ? 1 : 0,
                display: open ? 'block' : 'none',
                ml: open ? 2 : 0,
              }} 
            />
          </ListItem>
          <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)' }} />
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 3, color: 'error.main' }}>
              {error}
            </Box>
          ) : menuItems && menuItems.length > 0 ? (
            filterMenuItems(menuItems).map((item) => (
              <MenuItem 
                key={item.id} 
                item={item} 
                drawerOpen={open}
                handleDrawerToggle={handleDrawerToggle}
              />
            ))
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              No menu items available
            </Box>
          )}
        </List>
      </Box>
    </Drawer>
  );
}

export default Sidebar; 