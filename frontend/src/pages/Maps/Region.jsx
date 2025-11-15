import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Divider,
  useTheme,
  Select,
  MenuItem
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Delete, Add } from '@mui/icons-material';
import mapDataService from './mapDataService';

// 添加 DataGrid 的樣式配置
const getDataGridStyles = (theme) => {
  // 添加調試日誌
  console.log('Theme primary color:', theme.palette.primary.main);
  
  return {
    disableSelectionOnClick: true,
    disableColumnMenu: true,
    disableColumnFilter: true,
    hideFooterSelectedRowCount: true,
    pageSize: 100,
    rowsPerPageOptions: [100],
    sortingMode: 'server',
    initialState: {
      sorting: {
        sortModel: [{ field: 'region', sort: 'asc' }]
      }
    },
    sx: {
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 1,
      '& .MuiDataGrid-main': {
        borderRadius: 1,
      },
      '& .MuiDataGrid-columnHeaders': {
        backgroundColor: `${theme.palette.primary.main} !important`,
        color: '#ffffff !important',
        fontSize: '0.875rem',
        fontWeight: 600,
        minHeight: '56px !important',
        '& .MuiDataGrid-columnHeader': {
          backgroundColor: `${theme.palette.primary.main} !important`,
          color: '#ffffff !important',
          '&:focus': {
            outline: 'none',
          },
          '&:hover': {
            backgroundColor: `${theme.palette.primary.dark} !important`,
          },
        },
        '& .MuiDataGrid-columnHeaderTitle': {
          color: '#ffffff !important',
          fontWeight: 600,
        },
        '& .MuiDataGrid-columnSeparator': {
          color: '#ffffff !important',
          visibility: 'visible !important',
        },
        '& .MuiDataGrid-sortIcon': {
          color: '#ffffff !important',
        },
        '& .MuiDataGrid-menuIcon': {
          color: '#ffffff !important',
        }
      },
      '& .MuiDataGrid-cell': {
        borderBottom: `1px solid ${theme.palette.common.white}`,
        color: theme.palette.text.primary,
        '&:focus': {
          outline: 'none'
        }
      },
      '& .MuiDataGrid-row': {
        backgroundColor: theme.palette.background.paper,
        '&:hover': {
          backgroundColor: theme.palette.action.hover
        },
        '&.Mui-selected': {
          backgroundColor: theme.palette.action.selected,
          '&:hover': {
            backgroundColor: theme.palette.action.selected
          }
        }
      },
      '& .MuiDataGrid-footer': {
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper
      },
      '& .MuiDataGrid-toolbar': {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.background.paper
      },
      '& .MuiDataGrid-loadingOverlay': {
        backgroundColor: `${theme.palette.background.paper}dd`
      },
      '& .MuiDataGrid-noRowsOverlay': {
        color: theme.palette.text.secondary
      },
      '& .MuiDataGrid-checkboxInput': {
        color: theme.palette.primary.main
      }
    }
  };
};

const Region = ({ selectedInfo }) => {
  console.log('Region component rendered with selectedInfo:', selectedInfo);
  
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingRegion, setEditingRegion] = useState({
    sort_no: '',
    region: '',
    division: '',
    responsable: '',
    contact: ''
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [regionToDelete, setRegionToDelete] = useState(null);
  const [mapRegions, setMapRegions] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [divisions, setDivisions] = useState([]);

  const mapRegionColumns = [
    {
      field: 'path_id',
      headerName: 'ID',
      width: 120,
      sortable: true,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'region_id',
      headerName: '區域ID',
      width: 120,
      sortable: true,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'country',
      headerName: '國家',
      width: 120,
      sortable: true,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'responsable',
      headerName: '負責人',
      width: 120,
      sortable: true,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'contact',
      headerName: '聯繫方式',
      flex: 1,
      sortable: false,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'actions',
      headerName: '操作',
      width: 120,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleEditMapRegion(params.row)}>
            <Edit />
          </IconButton>
          <IconButton size="small" onClick={() => handleDeleteMapRegion(params.row)}>
            <Delete />
          </IconButton>
        </Box>
      )
    }
  ];

  const regionColumns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 120,
      sortable: true,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'name',
      headerName: '區域名稱',
      flex: 1,
      sortable: true,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'division',
      headerName: '部門代號',
      width: 120,
      sortable: true,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'sort_no',
      headerName: '排序號',
      width: 120,
      sortable: true,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'actions',
      headerName: '操作',
      width: 120,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleEditRegion(params.row)}>
            <Edit />
          </IconButton>
          <IconButton size="small" onClick={() => handleDeleteRegion(params.row)}>
            <Delete />
          </IconButton>
        </Box>
      )
    }
  ];

  const filteredMapRegions = useMemo(() => {
    if (!selectedRegion) {
      return mapRegions;
    }
    return mapRegions.filter(mapRegion => 
      mapRegion.region_id === selectedRegion.id
    );
  }, [selectedRegion, mapRegions]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [mapRegionsData, regionsData] = await Promise.all([
          mapDataService.getMapRegions(),
          mapDataService.getRegions()
        ]);
        
        setMapRegions(mapRegionsData);
        setRegions(regionsData);
      } catch (error) {
        console.error('加載數據失敗:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadDivisions = () => {
      try {
        const data = localStorage.getItem('region_data');
        if (data) {
          const jsonData = JSON.parse(data);
          console.log('Loaded divisions:', jsonData.regions);
          if (Array.isArray(jsonData.regions)) {
            setDivisions(jsonData.regions);
          }
        }
      } catch (error) {
        console.error('加載區域數據失敗:', error);
      }
    };

    loadDivisions();
  }, []);

  // 添加調試日誌
  useEffect(() => {
    console.log('Current theme:', theme);
    console.log('Primary color:', theme.palette.primary.main);
  }, [theme]);

  // 在編輯對話框打開時檢查數據
  useEffect(() => {
    if (openDialog) {
      console.log('Dialog opened with editingRegion:', editingRegion); // 調試日誌
    }
  }, [openDialog, editingRegion]);

  useEffect(() => {
    if (selectedInfo) {
      setEditingRegion({
        id: selectedInfo.id,
        name: selectedInfo.name,
        division: selectedInfo.division,
        sort_no: selectedInfo.sort_no,
        country: selectedInfo.country
      });
    }
  }, [selectedInfo]);

  const handleEditMapRegion = (mapRegion) => {
    setEditMode(true);
    setEditingRegion(mapRegion);
    setOpenDialog(true);
  };

  const handleDeleteMapRegion = (mapRegion) => {
    setRegionToDelete(mapRegion);
    setDeleteConfirmOpen(true);
  };

  const handleEditRegion = (region) => {
    setEditMode(true);
    setEditingRegion(region);
    setOpenDialog(true);
  };

  const handleDeleteRegion = (region) => {
    setRegionToDelete(region);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (regionToDelete) {
      try {
        if (regionToDelete.path_id) {
          await mapDataService.deleteRegion(regionToDelete.path_id);
          setMapRegions(await mapDataService.getMapRegions());
        } else {
          await mapDataService.deleteRegion(regionToDelete.id);
          setRegions(await mapDataService.getRegions());
        }
      } catch (error) {
        console.error('刪除失敗:', error);
      }
    }
    setDeleteConfirmOpen(false);
    setRegionToDelete(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setEditingRegion({
      sort_no: '',
      region: '',
      division: '',
      responsable: '',
      contact: ''
    });
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        if (regionToDelete && regionToDelete.path_id) {
          await mapDataService.updateRegion(regionToDelete.path_id, editingRegion);
        } else {
          await mapDataService.createRegion(editingRegion);
        }
        const updatedData = await mapDataService.getRegions();
        setRegions(updatedData || []);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('保存區域失敗:', error);
    }
  };

  const handleRegionRowClick = (params) => {
    setSelectedRegion(params.row);
  };

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={2} sx={{ flex: 1, mb: 2, backgroundColor: theme.palette.background.paper }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="primary">
            區域管理
            {selectedRegion && (
              <Typography component="span" variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                (已選擇: {selectedRegion.name})
              </Typography>
            )}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => {
              setEditMode(false);
              setEditingRegion({});
              setOpenDialog(true);
            }}
          >
            新增區域
          </Button>
        </Box>
        <Box sx={{ height: 'calc(50vh - 140px)', width: '100%', p: 2 }}>
          <DataGrid
            rows={regions}
            columns={regionColumns}
            getRowId={(row) => row.id}
            loading={loading}
            {...getDataGridStyles(theme)}
            onRowClick={handleRegionRowClick}
            sx={{
              ...getDataGridStyles(theme).sx,
              '& .MuiDataGrid-row.Mui-selected': {
                backgroundColor: `${theme.palette.primary.light}20 !important`,
              },
            }}
            selectionModel={selectedRegion ? [selectedRegion.id] : []}
          />
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ flex: 1, backgroundColor: theme.palette.background.paper }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="primary">
            地圖區域管理
            {selectedRegion && (
              <Typography component="span" variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                (顯示 {selectedRegion.name} 的地圖區域)
              </Typography>
            )}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => {
              setEditMode(false);
              setEditingRegion({
                region_id: selectedRegion?.id || '',
                ...{}
              });
              setOpenDialog(true);
            }}
            disabled={!selectedRegion}
          >
            新增地圖區域
          </Button>
        </Box>
        <Box sx={{ height: 'calc(50vh - 140px)', width: '100%', p: 2 }}>
          <DataGrid
            rows={filteredMapRegions}
            columns={mapRegionColumns}
            getRowId={(row) => row.path_id}
            loading={loading}
            {...getDataGridStyles(theme)}
          />
        </Box>
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editMode ? '編輯區域' : '新增區域'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="排序代號"
              value={editingRegion.sort_no || ''}
              onChange={(e) => setEditingRegion({ ...editingRegion, sort_no: e.target.value })}
            />
            <Select
              fullWidth
              label="部門"
              value={editingRegion.division || ''}
              onChange={(e) => {
                console.log('Selected division:', e.target.value);
                setEditingRegion({ ...editingRegion, division: e.target.value });
              }}
              displayEmpty
            >
              <MenuItem value="" disabled>
                請選擇部門
              </MenuItem>
              {divisions.map((division) => (
                <MenuItem 
                  key={division.id} 
                  value={division.division}
                >
                  {`${division.name} (${division.division})`}
                </MenuItem>
              ))}
            </Select>
            <TextField
              fullWidth
              label="區域名稱"
              value={editingRegion.name || ''}
              onChange={(e) => setEditingRegion({ ...editingRegion, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="負責人"
              value={editingRegion.responsable || ''}
              onChange={(e) => setEditingRegion({ ...editingRegion, responsable: e.target.value })}
            />
            <TextField
              fullWidth
              label="聯繫方式"
              value={editingRegion.contact || ''}
              onChange={(e) => setEditingRegion({ ...editingRegion, contact: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSave} variant="contained">
            {editMode ? '更新' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>確認刪除</DialogTitle>
        <DialogContent>
          <Typography>
            確定要刪除「{regionToDelete?.region}」嗎？
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            取消
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            確認刪除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Region; 