import { useState, useEffect, lazy, Suspense } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import CompTwMap from './CompTwMap';
import SiteCompTable from '../energy/site/SiteCompTable';

const TwMap = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [mapRegions, setMapRegions] = useState([]);
  const [selectedPathId, setSelectedPathId] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleRegionEdit = (regionData) => {
    setEditingRegion(regionData);
    setEditDialogOpen(true);
  };

  const handleCloseEdit = () => {
    setEditDialogOpen(false);
    setEditingRegion(null);
  };

  const handleSaveEdit = async () => {
    if (editingRegion) {
      try {
        const updatedRegionData = {
          path_id: editingRegion.pathId,
          region_id: editingRegion.region || '',
          country: editingRegion.country || '',
          responsable: '',
          contact: '',
          coordinates: editingRegion.coordinates || [],
          updated_at: new Date().toISOString()
        };

        // 更新本地數據
        const updatedRegions = mapRegions.map(region => 
          region.path_id === editingRegion.pathId 
            ? { ...region, ...updatedRegionData } 
            : region
        );
        setMapRegions(updatedRegions);
        
        setNotification({
          open: true,
          message: '區域更新成功',
          severity: 'success'
        });
        
        handleCloseEdit();
      } catch (error) {
        console.error('更新失敗:', error);
        setNotification({
          open: true,
          message: '更新失敗: ' + error.message,
          severity: 'error'
        });
      }
    }
  };

  useEffect(() => {
    const fetchSites = async (retryCount = 0) => {
      try {
        const response = await fetch('/api/sites/', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.status === 308) {
          if (retryCount < 3) {
            console.log('Received 308, retrying...', retryCount + 1);
            return fetchSites(retryCount + 1);
          }
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const sites = await response.json();
        console.log('Received sites data:', sites);
        localStorage.setItem('sites', JSON.stringify(sites));
        setMapRegions(sites);
      } catch (error) {
        console.error('Error fetching sites:', error);
        if (error.name === 'TypeError' && retryCount < 3) {
          console.log('Network error, retrying...', retryCount + 1);
          return fetchSites(retryCount + 1);
        }
        setNotification({
          open: true,
          message: `获取站点数据失败: ${error.message}`,
          severity: 'error'
        });
      }
    };

    fetchSites();
  }, []);

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '82%',
      gap: 0.5,
      p: 1,
      position: 'relative',
      backgroundColor: '#78909c'
    }}>
      {/* 主要地圖區域 */}
      <Paper sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* 標題欄 */}
        <Box sx={{ 
          p: 1, 
          bgcolor: theme.palette.primary.main,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6">台灣地圖</Typography>
        </Box>
        
        <Divider />

        {/* SiteCompTable 组件放在标题下方 */}
        <SiteCompTable />

        {/* 地圖顯示區域 */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <CompTwMap
            onRegionEdit={handleRegionEdit}
            focusPathId={selectedPathId}
            regions={mapRegions}
          />
        </Box>
      </Paper>

      {/* 編輯對話框 */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEdit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>編輯區域</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Path ID"
              value={editingRegion?.pathId || ''}
              disabled
              margin="normal"
            />
            <TextField
              fullWidth
              label="區域"
              value={editingRegion?.region || ''}
              onChange={(e) => setEditingRegion(prev => ({
                ...prev,
                region: e.target.value
              }))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="國家"
              value={editingRegion?.country || ''}
              onChange={(e) => setEditingRegion(prev => ({
                ...prev,
                country: e.target.value
              }))}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>取消</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 通知提示 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TwMap;
