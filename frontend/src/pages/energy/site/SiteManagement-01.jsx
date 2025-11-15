import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TableSortLabel,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import PageContainer from '../../../components/PageContainer';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WindSiteDetails from './WindSiteDetails';
import SolarDetails from './SolarDetails';
import SitePerformanceChart from './SitePerformanceChart';
import { visuallyHidden } from '@mui/utils';
import { useDynamicRoute } from '../../../components/DynamicRoute';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function SiteManagement() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const { navigateTo: navigateToEquipmentList } = useDynamicRoute('A.1.2.1'); // SiteEquipmentList
  const { navigateTo: navigateToBasicSettings } = useDynamicRoute('A.1.2.2'); // SiteBasicSettings
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState(null);

  useEffect(() => {
    console.log('=== Translation Debug ===');
    console.log('Current language:', i18n.language);
    console.log('Translation test:', {
      title: t('site.management.list.title', '案場管理'),
      addButton: t('site.management.actions.add', '新增案場'),
      name: t('site.basic.fields.name', '名稱'),
      province: t('site.basic.fields.location.province', '省份'),
      type: t('site.basic.fields.type.label', '案場類型'),
      company: t('site.basic.fields.company', '公司組織'),
      capacity: t('site.basic.fields.capacity.total', '總裝機容量'),
      actions: t('common.actions', '操作')
    });
    console.log('Translation resources:', i18n.options.resources);
    console.log('=====================');
  }, [i18n.language]);

  // 將 fetchSites 函數移到 useEffect 外部
  const fetchSites = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL;
      console.log('Attempting to fetch from URL:', `${baseUrl}/api/sites`);
      
      const response = await fetch(`${baseUrl}/api/sites`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Fetched sites:', data);
      setSites(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sites:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 在 useEffect 中調用 fetchSites
  useEffect(() => {
    fetchSites();
  }, []);

  // 修改獲取站點詳情的函數
  const fetchSiteDetails = async (siteId, siteType) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      console.log('Fetching site details:', `${baseUrl}/api/sites/${siteId}/${siteType}-details`);
      
      const response = await fetch(`${baseUrl}/api/sites/${siteId}/${siteType}-details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`Error fetching ${siteType} details:`, err);
      return null;
    }
  };

  // 修改選擇站點的處理函數
  const handleSiteSelect = async (site) => {
    try {
      setSelectedSite(site); // 先設置基本信息
      console.log('Selected site:', site);

      // 只有當站點類型是 wind 或 solar 時才獲取詳細信息
      if (site && (site.site_type === 'wind' || site.site_type === 'solar')) {
        console.log(`Fetching ${site.site_type} details for site:`, site.site_id || site.id);
        const details = await fetchSiteDetails(site.site_id || site.id, site.site_type);
        if (details) {
          console.log(`${site.site_type} details received:`, details);
          setSelectedSite(prev => ({
            ...prev,
            details: details
          }));
        } else {
          console.warn(`No ${site.site_type} details found for site:`, site.site_id || site.id);
        }
      } else {
        console.log('Site type not supported for details:', site.site_type);
      }
    } catch (err) {
      console.error('Error handling site selection:', err);
      // 不要讓錯誤影響基本信息的顯示
      setError(`Error loading site details: ${err.message}`);
    }
  };

  // 處理選單開關
  const handleMenuClick = (event, siteId) => {
    setAnchorEl(event.currentTarget);
    setSelectedSiteId(siteId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSiteId(null);
  };

  // 處理編輯
  const handleEdit = (site) => {
    handleMenuClose();
    console.log('Editing site:', site);
    navigateToBasicSettings({ 
      state: { 
        siteId: site.site_id || site.id
      } 
    });
  };

  // 處理設備清單
  const handleEquipmentList = (site) => {
    handleMenuClose();
    navigateToEquipmentList({ 
      state: { 
        siteId: site.site_id || site.id
      } 
    });
  };

  // 處理刪除按鈕點擊
  const handleDeleteClick = (site) => {
    handleMenuClose();
    setSiteToDelete(site);
    setDeleteDialogOpen(true);
  };

  // 處理確認刪除
  const handleDeleteConfirm = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL;
      const apiPath = import.meta.env.VITE_SITE_API_URL;
      const response = await fetch(`${baseUrl}${apiPath}/${siteToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 現在可以直接調用 fetchSites
      await fetchSites();
      setDeleteDialogOpen(false);
      setSiteToDelete(null);
    } catch (error) {
      console.error('Error deleting site:', error);
      alert('刪除案場失敗');
    }
  };

  // 添加排序處理函數
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // 排序邏輯
  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  // 定義表頭
  const headCells = [
    { 
      id: 'name', 
      label: t('site.basic.fields.name', '名稱'), 
      width: 200 
    },
    { 
      id: 'province', 
      label: t('site.basic.fields.location.province', '省份'), 
      width: 150 
    },
    { 
      id: 'site_type', 
      label: t('site.basic.fields.type.label', '案場類型'), 
      width: 150 
    },
    { 
      id: 'company', 
      label: t('site.basic.fields.company', '公司組織'), 
      width: 200 
    },
    { 
      id: 'capacity', 
      label: t('site.basic.fields.capacity.total', '總裝機容量'), 
      width: 150 
    },
    { 
      id: 'actions', 
      label: t('common.actions', '操作'), 
      width: 100, 
      sortable: false 
    }
  ];

  return (
    <PageContainer>
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        backgroundColor: '#bbdefb',
        p: 2,
        minHeight: '100vh'
      }}>
        {/* 左側區域 - 占70%寬度 */}
        <Box sx={{ 
          flex: 7, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2, 
          minWidth: 0,
          height: '100%'
        }}>
          {/* 上部分 - 占50%高度 */}
          <Box sx={{ 
            flex: 5, 
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2,
              px: 1
            }}>
              <Typography variant="h6">{t('site.management.list.title', '案場管理')}</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => navigateToBasicSettings()}
              >
                {t('site.management.actions.add', '新增案場')}
              </Button>
            </Box>
            
            <TableContainer sx={{ 
              flex: 1, 
              overflow: 'auto',
              '& .MuiTableCell-root': {
                whiteSpace: 'nowrap',
                padding: '12px 16px',
              },
              '& .MuiTableCell-head': {
                backgroundColor: '#1976d2',
                color: '#fff',
                fontWeight: 'bold',
                position: 'sticky',
                top: 0,
                zIndex: 1,
                '& .MuiTableSortLabel-root': {
                  color: '#fff',
                  '&:hover': {
                    color: '#e3f2fd',
                  },
                  '&.Mui-active': {
                    color: '#fff',
                    '& .MuiTableSortLabel-icon': {
                      color: '#fff',
                    }
                  }
                }
              }
            }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {headCells.map((headCell) => (
                      <TableCell
                        key={headCell.id}
                        sx={{ width: headCell.width }}
                        sortDirection={orderBy === headCell.id ? order : false}
                      >
                        {headCell.sortable !== false ? (
                          <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={() => handleRequestSort(headCell.id)}
                          >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                              <Box component="span" sx={visuallyHidden}>
                                {order === 'desc' ? t('site.management.list.sort.desc') : t('site.management.list.sort.asc')}
                              </Box>
                            ) : null}
                          </TableSortLabel>
                        ) : (
                          headCell.label
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ color: 'error.main' }}>
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : sites.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        {t('site.management.list.noData')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sites
                      .slice()
                      .sort(getComparator(order, orderBy))
                      .map((site) => (
                        <TableRow 
                          key={site.site_id || site.id}
                          hover
                          selected={selectedSite?.site_id === site.site_id || selectedSite?.id === site.id}
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleSiteSelect(site)}
                        >
                          <TableCell>{site.site_name || site.name}</TableCell>
                          <TableCell>{site.province}</TableCell>
                          <TableCell>
                            {t(`site.basic.fields.type.${site.site_type}`, site.site_type)}
                          </TableCell>
                          <TableCell>{site.company_name || site.company}</TableCell>
                          <TableCell>
                            {`${site.total_capacity || site.capacity || 0} ${t('site.basic.fields.capacity.unit', 'MW')}`}
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title={t('site.management.actions.edit')}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(site);
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t('site.management.actions.equipment')}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEquipmentList(site);
                                  }}
                                >
                                  <BuildIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t('site.management.actions.delete')}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(site);
                                  }}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          
          {/* 下部分 - 占50%高度 */}
          <Box sx={{ 
            flex: 5,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1,
            p: 2,
            overflow: 'auto'
          }}>
            {selectedSite ? (
              selectedSite.site_type === 'wind' ? (
                <WindSiteDetails 
                  siteId={selectedSite.site_id || selectedSite.id}
                  details={selectedSite.details}
                  onClose={() => setSelectedSite(null)}
                />
              ) : selectedSite.site_type === 'solar' ? (
                <SolarDetails
                  siteId={selectedSite.site_id || selectedSite.id}
                  details={selectedSite.details}
                  onClose={() => setSelectedSite(null)}
                />
              ) : (
                <Typography>
                  {t('site.management.details.typeNotImplemented', { type: selectedSite.site_type })}
                </Typography>
              )
            ) : (
              <Typography>{t('site.management.details.selectPrompt')}</Typography>
            )}
          </Box>
        </Box>
        
        {/* 右側區域 - 占30%寬度 */}
        <Box sx={{ 
          flex: 3,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 1,
          p: 2,
          minWidth: 300,
          maxWidth: 400,
          overflow: 'auto'
        }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
            {t('site.management.overview.title', '案場概況')}
          </Typography>
          {selectedSite && (
            <>
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Typography sx={{ minWidth: 120, color: 'text.secondary' }}>
                    {t('site.basic.fields.name', '名稱')}：
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>{selectedSite.name}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Typography sx={{ minWidth: 120, color: 'text.secondary' }}>
                    {t('site.basic.fields.type.label', '案場類型')}：
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {t(`site.basic.fields.type.${selectedSite.site_type}`, selectedSite.site_type)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Typography sx={{ minWidth: 120, color: 'text.secondary' }}>
                    {t('site.basic.fields.location.label', '坐落位置')}：
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>{`${selectedSite.province}${selectedSite.address || ''}`}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Typography sx={{ minWidth: 120, color: 'text.secondary' }}>
                    {t('site.basic.fields.approvalNumber', '能源備案編號')}：
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>{selectedSite.approval_number || '－'}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Typography sx={{ minWidth: 120, color: 'text.secondary' }}>
                    {t('site.basic.fields.approvalDate', '核准日期')}：
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>{selectedSite.approval_date || '－'}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Typography sx={{ minWidth: 120, color: 'text.secondary' }}>
                    {t('site.basic.fields.constructionDate', '建設日期')}：
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>{selectedSite.construction_date || '－'}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Typography sx={{ minWidth: 120, color: 'text.secondary' }}>
                    {t('site.basic.fields.operationDate', '商轉日期')}：
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>{selectedSite.operation_date || '－'}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Typography sx={{ minWidth: 120, color: 'text.secondary' }}>
                    {t('site.basic.fields.capacity.total', '總裝機容量')}：
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {selectedSite.capacity ? `${selectedSite.capacity} ${t('site.basic.fields.capacity.unit', 'MW')}` : '－'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Typography sx={{ minWidth: 120, color: 'text.secondary' }}>
                    {t('site.basic.fields.area.label', '總佔地面積')}：
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {selectedSite.area ? `${selectedSite.area} ${t('site.basic.fields.area.unit', '公頃')}` : '－'}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <SitePerformanceChart siteId={selectedSite.site_id || selectedSite.id} />
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* 選單 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEdit(selectedSiteId)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('site.management.actions.edit')} />
        </MenuItem>
        <MenuItem onClick={() => handleEquipmentList(selectedSiteId)}>
          <ListItemIcon>
            <BuildIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('site.management.actions.equipment')} />
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(selectedSiteId)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary={t('site.management.actions.delete')} />
        </MenuItem>
      </Menu>

      {/* 添加刪除確認對話框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>確認刪除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            確定要刪除案場 "{siteToDelete?.name}" 嗎？此操作無法撤銷。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            確認刪除
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

export default SiteManagement; 