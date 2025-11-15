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
  Modal,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
} from '@mui/material';
import mapDataService from './mapDataService';
import { useDynamicRoute } from '../../components/DynamicRoute';
import Region from './Region';
import CompMap from './CompMap';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BusinessIcon from '@mui/icons-material/Business';
import MemoryIcon from '@mui/icons-material/Memory';

const REGION_OPTIONS = {
  ALL: "所有地區",
  EAST_ASIA: "東亞",
  SOUTHEAST_ASIA: "東南亞",
  SOUTH_ASIA: "南亞",
  WEST_ASIA: "西亞",
  EUROPE: "歐洲",
  EASTERN_EUROPE: "東歐",
  WESTERN_EUROPE: "西歐",
  NORTH_AFRICA: "北非",
  AFRICA: "非洲",
  SOUTHERN_AFRICA: "南非",
  NORTH_AMERICA: "北美",
  CENTRAL_AMERICA: "中美",
  CARIBBEAN: "加勒比",
  SOUTH_AMERICA: "南美",
  OCEANIA: "大洋洲"
};

const GlobalMaps = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [mapRegions, setMapRegions] = useState([]);
  const [selectedPathId, setSelectedPathId] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [regionOptions, setRegionOptions] = useState([]);
  const [MapComponent, setMapComponent] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [mapComponentLoaded, setMapComponentLoaded] = useState(false);
  const [regionData, setRegionData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [siteEquipments, setSiteEquipments] = useState([]);
  const [loadingEquipments, setLoadingEquipments] = useState(false);
  const baseUrl = import.meta.env.VITE_API_URL;

  // 添加一個新的狀態來控制是否展開所有節點
  const [expandAll, setExpandAll] = useState(false);
  
  // 在 GlobalMaps 組件中添加這個狀態來跟踪展開的節點
  const [expandedItems, setExpandedItems] = useState([]);

  // 修改處理展開開關的函數
  const handleExpandChange = (event) => {
    const isExpanded = event.target.checked;
    setExpandAll(isExpanded);
    
    if (isExpanded) {
      // 如果開關打開，展開所有站點
      const allSiteIds = processEquipmentData(siteEquipments)
        .map(site => [site.nodeId, ...site.children.map(child => child.nodeId)])
        .flat();
      console.log('Expanding all items:', allSiteIds);
      setExpandedItems(allSiteIds);
    } else {
      // 如果開關關閉，收起所有節點
      setExpandedItems([]);
    }
  };

  // 添加新的點擊處理函數，手動切換節點展開狀態
  const handleNodeToggle = (nodeId) => {
    console.log('Toggling node:', nodeId);
    setExpandedItems(prevExpanded => {
      if (prevExpanded.includes(nodeId)) {
        return prevExpanded.filter(id => id !== nodeId);
      } else {
        return [...prevExpanded, nodeId];
      }
    });
  };

  // 添加导航函数
  const { navigateTo: navigateToWindPowerGenerator } = useDynamicRoute('A.1.5');
  
  // 添加设备项点击处理函数
  const handleEquipmentClick = (equip) => {
    
    // 从 nodeId 中提取设备ID (格式为 "equip-123")
    const equipId = equip.nodeId.replace('equip-', '');
    
    // 使用与 SiteManagement 相同的导航方式和参数传递
    navigateToWindPowerGenerator({ 
      state: { 
        deviceId: equipId  // 确保使用 deviceId 作为键名
      },
      search: `deviceId=${equipId}`  // 使用 search 而非 query
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 獲取地圖區域數據
        const data = await mapDataService.getMapRegions();
        setMapRegions(data);

        // 更新 localStorage 中的 region_data
        const regions = await mapDataService.getRegions();
        if (regions.length > 0) {
          localStorage.setItem('region_data', JSON.stringify({ regions }));
        }

        // 從 localStorage 獲取區域數據
        const regionData = JSON.parse(localStorage.getItem('region_data') || '{"regions": []}');
        setRegionData(regionData.regions);
        
        // 設置區域選項，包含"全部"選項
        const regionOptions = ['ALL', ...regionData.regions.map(region => region.name)];
        setRegionOptions(regionOptions);
        setSelectedRegion('ALL');

        // 從 localStorage 獲取國家數據
        const countryData = JSON.parse(localStorage.getItem('country_data') || '{"countries": []}');
        setCountries(countryData.countries || []);
        setFilteredCountries(countryData.countries || []);
      } catch (error) {
        console.error('加載數據失敗:', error);
        setNotification({
          open: true,
          message: '加載數據失敗',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadMapComponent = async () => {
      try {
        const { default: Component } = await import('./CompMap');
        setMapComponent(() => Component);
      } catch (error) {
        console.error('加載地圖組件失敗:', error);
      }
    };
    
    loadMapComponent();
  }, []);

  useEffect(() => {
    if (MapComponent) {
      setMapComponentLoaded(true);
    }
  }, [MapComponent]);

  const handleRegionEdit = (regionData) => {
    console.log('Opening edit dialog with:', regionData);
    if (regionData) {
      setEditingRegion(regionData);
      setEditDialogOpen(true);
    }
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

        await mapDataService.updateMapRegion(editingRegion.pathId, updatedRegionData);

        const currentData = JSON.parse(localStorage.getItem('map_region_data') || '{"regions": []}');
        const updatedRegions = currentData.regions.map(region => 
          region.path_id === editingRegion.pathId 
            ? { 
                ...region,
                ...updatedRegionData,
                created_at: region.created_at || new Date().toISOString()
              } 
            : region
        );
        localStorage.setItem('map_region_data', JSON.stringify({ regions: updatedRegions }));

        setMapRegions(updatedRegions);
        window.dispatchEvent(new Event('mapDataUpdated'));

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

  const handleRegionSelectChange = (pathId, selectedRegion) => {
    console.log(`Selected region for ${pathId}: ${selectedRegion}`);
  };

  const handleCountryClick = (country) => {
    setSelectedCountry(country);
  };

  const handleRegionChange = (event) => {
    const selectedRegionName = event.target.value;
    setSelectedRegion(selectedRegionName);
    
    console.log('Selected Region:', selectedRegionName);
    console.log('Available Countries:', countries);
    
    if (selectedRegionName === 'ALL') {
      setFilteredCountries(countries);
      console.log('Showing all countries:', countries.length);
    } else {
      // 根據選擇的區域名稱精確篩選國家
      const filtered = countries.filter(country => {
        // 處理特殊情況：非洲地區的命名差異
        let regionToMatch = selectedRegionName;
        if (selectedRegionName.endsWith('非')) {
          regionToMatch = selectedRegionName.replace('非', '部非洲');
        }
        
        const match = country.region === regionToMatch;
        if (match) {
          console.log('Matched country:', country.name_cn, 'Region:', country.region);
        }
        return match;
      });
      
      console.log(`Filtered countries for region ${selectedRegionName}:`, filtered);
      setFilteredCountries(filtered);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // 修改獲取設備列表的函數
  const fetchSiteEquipments = async () => {
    try {
      setLoadingEquipments(true);
      console.log('Fetching all equipments');
      
      const response = await fetch(`${baseUrl}/api/sites/equipments/list/all`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch equipments: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Received equipment data:', data);
      setSiteEquipments(data);
    } catch (error) {
      console.error('Error fetching equipments:', error);
      setNotification({
        open: true,
        message: `加載設備列表失敗: ${error.message}`,
        severity: 'error'
      });
      setSiteEquipments([]); // 清空設備列表
    } finally {
      setLoadingEquipments(false);
    }
  };

  // 修改 useEffect，在組件加載時獲取所有設備
  useEffect(() => {
    fetchSiteEquipments();
  }, []); // 只在組件加載時執行一次

  // 修改 processEquipmentData 函數
  const processEquipmentData = (equipments) => {
    console.log('Processing equipment data:', equipments);
    
    // 按站點 ID 分組
    const siteGroups = {};
    equipments.forEach(equip => {
      if (!siteGroups[equip.site_id]) {
        siteGroups[equip.site_id] = {
          nodeId: `site-${equip.site_id}`, // 添加明確的 nodeId
          name: equip.site_name,
          children: []
        };
      }
      siteGroups[equip.site_id].children.push({
        nodeId: `equip-${equip.equip_id}`, // 添加明確的 nodeId
        name: equip.asset_no,
        modelNo: equip.model_no,
        status: equip.status
      });
    });

    return Object.values(siteGroups);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      gap: 1, 
      padding: 1,
      backgroundColor: '#78909c',
      position: 'relative'
    }}>
      {/* 左側列表 */}
      {/* 右側地圖容器 */}
      <Box sx={{ 
        flexGrow: 1, 
        position: 'relative',
        backgroundColor: '#f0f8ff',
        borderRadius: '8px',
        overflow: 'hidden',
        height: 'calc(100vh - 60px)'  // 減去 padding
      }}>
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <CompMap 
            selectedCountry={selectedCountry?.name}
            mapRegion="SEA"
            sx={{
              width: '100%',
              height: '100%',
              '& svg': {
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }
            }}
            center={[112, 35]}
            zoom={5}
            siteEquipments={siteEquipments}
            onEquipmentClick={handleEquipmentClick}
          />
        </Box>
      </Box>

      {/* 修改浮動設備列表卡片的內容顯示 */}
      <Card sx={{
        position: 'absolute',
        bottom: 100,
        right: 16,
        width: 250,
        maxHeight: 400,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        boxShadow: 3,
        zIndex: 1000,
      }}>
        <CardHeader 
          title={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ color: 'white' }}>案場設備列表</Typography>
              <FormControlLabel
                control={
                  <Switch 
                    size="small" 
                    checked={expandAll}
                    onChange={handleExpandChange}
                    sx={{ 
                      '& .MuiSwitch-switchBase.Mui-checked': { color: 'white' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'white' }
                    }}
                  />
                }
                label={<Typography variant="caption" sx={{ color: 'white' }}>展開</Typography>}
                labelPlacement="start"
                sx={{ m: 0 }}
              />
            </Box>
          }
          sx={{
            backgroundColor: '#1976d2',
            color: 'white',
            p: 1,
            '& .MuiCardHeader-title': {
              fontSize: '1rem',
              width: '100%'
            }
          }}
        />
        <CardContent 
          sx={{ 
            p: 1, 
            maxHeight: 320, 
            overflowY: 'auto',
            '&:last-child': { pb: 1 } 
          }}
        >
          {loadingEquipments ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : siteEquipments && siteEquipments.length > 0 ? (
            <SimpleTreeView
              aria-label="設備列表"
              expandedItems={expandedItems}
              onItemsExpansionChange={(event, itemIds) => {
                console.log('Items expansion changed:', itemIds);
                setExpandedItems(itemIds);
              }}
              sx={{ 
                // 隱藏最左側的展開/收合圖標，但保留空間
                '& .MuiTreeItem-iconContainer': {
                  visibility: 'hidden', // 隱藏但保留空間
                  width: '0', // 減少佔用空間
                  marginRight: '0', // 去除右側間距
                },
                '& .MuiTreeItem-content': {
                  padding: '2px 0',
                },
                '& .MuiTreeItem-root': {
                  cursor: 'pointer',
                },
                // 移除子項目的過多縮進
                '& .MuiTreeItem-group': {
                  marginLeft: '1px !important', // 保留適當的縮進
                  borderLeft: '1px dashed rgba(0,0,0,0.1)', // 添加一條虛線來區分層級
                  paddingLeft: '8px',
                }
              }}
            >
              {processEquipmentData(siteEquipments).map(site => (
                <TreeItem
                  key={site.nodeId}
                  itemId={site.nodeId}
                  label={
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        py: 0.5,
                        width: '100%',
                        '&::before': expandedItems.includes(site.nodeId) ? {
                          content: '"▼"',
                          fontSize: '10px',
                          color: '#1976d2',
                          marginRight: '4px',
                        } : {
                          content: '"▶"',
                          fontSize: '10px',
                          color: '#1976d2',
                          marginRight: '4px',
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleNodeToggle(site.nodeId);
                      }}
                    >
                      <BusinessIcon fontSize="small" sx={{ color: '#1976d2' }} />
                      <Typography variant="body2">
                        {site.name} ({site.children?.length || 0})
                      </Typography>
                    </Box>
                  }
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)'
                    },
                  }}
                >
                  {site.children.map(equip => (
                    <TreeItem
                      key={equip.nodeId}
              
                      itemId={equip.nodeId}
                      label={
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            py: 0.5,
                            cursor: 'pointer',
                            '&:hover': {
                              textDecoration: 'underline',
                            }
                          }}
                          onClick={(e) => {
                            console.log('Navigating to equipment:', equip);
                            e.stopPropagation(); // 阻止事件冒泡
                            handleEquipmentClick(equip);
                          }}
                        >
                          <MemoryIcon fontSize="small" sx={{ 
                            color: equip.status === 'running' ? 'success.main' : 'warning.main'
                          }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: equip.status === 'running' ? 'success.main' : 'warning.main',
                            }}
                          >
                            {equip.modelNo || equip.name} - {equip.status}
                          </Typography>
                        </Box>
                      }
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.08)'
                        }
                      }}
                    />
                  ))}
                </TreeItem>
              ))}
            </SimpleTreeView>
          ) : (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="body2" color="textSecondary">
                無設備數據
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 修改編輯對話框 */}
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
            <FormControl fullWidth margin="normal">
              <InputLabel>區域</InputLabel>
              <Select
                value={editingRegion?.region || ''}
                onChange={(e) => setEditingRegion(prev => ({
                  ...prev,
                  region: e.target.value
                }))}
                label="區域"
              >
                {regionData.map((region) => (
                  <MenuItem key={region.id} value={region.name}>
                    {region.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

export default GlobalMaps; 