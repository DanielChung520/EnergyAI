import React from 'react';
import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    CircularProgress,
    Collapse,
    TableSortLabel,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useNavigate } from 'react-router-dom';
import { useDynamicRoute } from '../../../components/DynamicRoute';
import { visuallyHidden } from '@mui/utils';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import HistoryIcon from '@mui/icons-material/History';
import CommentIcon from '@mui/icons-material/Comment';
import DeleteIcon from '@mui/icons-material/Delete';
import EquipmentSolarDetail from './EquipmentSolarDetail';
import EquipmentWindDetail from './EquipmentWindDetail';

function EquipmentManagement() {
    const navigate = useNavigate();
    const { navigateTo: navigateToSolarDetail } = useDynamicRoute('A.2.3.1');
    const { navigateTo: navigateToWindDetail } = useDynamicRoute('A.2.3.2');
    const { navigateTo: navigateToBasicSettings } = useDynamicRoute('A.2.3.0');
    const [equipments, setEquipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [openDetailId, setOpenDetailId] = useState(null);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('model_no');
    const [anchorEl, setAnchorEl] = useState(null);
    const [remarkDialogOpen, setRemarkDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteInProgress, setDeleteInProgress] = useState(false);

    useEffect(() => {
        fetchEquipments();
    }, []);

    const fetchEquipments = async () => {
        try {
            console.log('Fetching equipments from:', '/api/equipments/');
            const response = await fetch('/api/equipments/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            // 檢查響應類型
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('API 返回了非 JSON 格式的數據');
            }

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('未授權訪問');
                }
                throw new Error(`API 請求失敗: ${response.status}`);
            }

            const data = await response.json();
            
            // 檢查數據格式
            if (!Array.isArray(data) && !Array.isArray(data.data)) {
                throw new Error('返回的數據格式不正確');
            }

            // 設置設備數據
            setEquipments(Array.isArray(data) ? data : data.data);
            
        } catch (err) {
            console.error('Error details:', {
                message: err.message,
                name: err.name,
                stack: err.stack
            });
            setError(err.message || '獲取設備列表失敗');
            setEquipments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        navigateToBasicSettings();
    };

    const handleMenuOpen = (event, equipment) => {
        event.stopPropagation();
        console.log('选中的设备:', equipment);
        setAnchorEl(event.currentTarget);
        setSelectedEquipment(equipment);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = (equipment) => {
        handleMenuClose();
        const queryParams = new URLSearchParams({
            id: equipment.id,
            model_no: equipment.model_no,
            desc_cn: equipment.desc_cn,
            desc_en: equipment.desc_en,
            equ_type: equipment.equ_type,
            power: equipment.power,
            voltage: equipment.voltage,
            useful_life: equipment.useful_life,
            iso14064: equipment.iso14064,
            iso14001: equipment.iso14001,
            remark: equipment.remark || ''
        }).toString();

        navigate(`/dashboard/equipment-management/settings?${queryParams}`);
    };

    const handleShowRemark = () => {
        setRemarkDialogOpen(true);
        handleMenuClose();
    };

    const handleRowClick = (equipment) => {
        if (openDetailId === equipment.id) {
            setOpenDetailId(null);
            setSelectedEquipment(null);
        } else {
            setOpenDetailId(equipment.id);
            setSelectedEquipment(equipment);
        }
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

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

    const headCells = [
        { id: 'model_no', label: '型號', width: 140 },
        { id: 'desc_cn', label: '中文說明', width: 200 },
        { id: 'desc_en', label: '英文說明', width: 200 },
        { id: 'equ_type', label: '設備類型', width: 120 },
        { id: 'power', label: '功率(W)', width: 80 },
        { id: 'voltage', label: '電壓(V)', width: 80 },
        { id: 'useful_life', label: '使用年限', width: 70 },
        { id: 'iso14064', label: 'ISO14064', width: 70 },
        { id: 'iso14001', label: 'ISO14001', width: 70 },
        { id: 'actions', label: '', width: 50, sortable: false },
    ];

    const handleDeleteClick = () => {
        console.log('点击删除按钮，选中的设备:', selectedEquipment);
        setDeleteDialogOpen(true);
        setAnchorEl(null);
    };

    const handleDelete = async () => {
        if (!selectedEquipment) {
            console.error('没有选中的设备');
            return;
        }
        
        console.log('开始删除设备:', selectedEquipment);
        setDeleteInProgress(true);
        
        try {
            // 先删除设备明细
            if (selectedEquipment.equ_type === 'pv') {
                console.log('删除太阳能设备明细...');
                const detailResponse = await fetch(`/api/equipments/${selectedEquipment.id}/solar-details`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    credentials: 'include'
                });
                
                console.log('太阳能设备明细删除响应:', detailResponse);
                
                if (!detailResponse.ok) {
                    throw new Error(`删除太阳能设备明细失败: ${detailResponse.status}`);
                }
                
            } else if (selectedEquipment.equ_type === 'wind') {
                console.log('删除风机设备明细...');
                const detailResponse = await fetch(`/api/equipments/${selectedEquipment.id}/wind-details`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    credentials: 'include'
                });
                
                console.log('风机设备明细删除响应:', detailResponse);
                
                if (!detailResponse.ok) {
                    throw new Error(`删除风机设备明细失败: ${detailResponse.status}`);
                }
            }

            // 删除设备主表数据
            console.log('删除设备主表数据...');
            const response = await fetch(`/api/equipments/${selectedEquipment.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });

            console.log('设备主表删除响应:', response);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`删除设备失败: ${errorData.error || response.status}`);
            }

            // 刷新设备列表
            await fetchEquipments();
            setDeleteDialogOpen(false);
            handleMenuClose();

        } catch (error) {
            console.error('删除设备时发生错误:', error);
            alert(`删除失败: ${error.message}`);
        } finally {
            setDeleteInProgress(false);
        }
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedEquipment(null);
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2 
            }}>
                <Typography variant="h6">設備管理</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddNew}
                >
                    新增設備
                </Button>
            </Box>

            <TableContainer
                component={Paper}
                sx={{
                    maxHeight: 'calc(100vh - 180px)',
                    '& .MuiTableCell-root': {
                        whiteSpace: 'nowrap',
                        padding: '16px',
                    },
                    '& .MuiTableCell-head': {
                        padding: '16px',
                        backgroundColor: '#1976d2',
                        color: '#fff',
                        fontWeight: 'bold',
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
                    },
                    '& .MuiTableCell-body': {
                        padding: '12px 16px',
                    },
                    borderRadius: 1,
                    boxShadow: 1
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox" sx={{ width: 50 }} />
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
                                                    {order === 'desc' ? '降序排列' : '升序排列'}
                                                </Box>
                                            ) : null}
                                        </TableSortLabel>
                                    ) : (
                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <MoreVertIcon fontSize="small" />
                                        </Box>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {equipments
                            .slice()
                            .sort(getComparator(order, orderBy))
                            .map((equipment) => (
                                <React.Fragment key={equipment.id}>
                                    <TableRow
                                        hover
                                        onClick={() => handleRowClick(equipment)}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell padding="checkbox">
                                            <IconButton size="small">
                                                {openDetailId === equipment.id ?
                                                    <KeyboardArrowUpIcon /> :
                                                    <KeyboardArrowDownIcon />
                                                }
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>{equipment.model_no}</TableCell>
                                        <TableCell>{equipment.desc_cn}</TableCell>
                                        <TableCell>{equipment.desc_en}</TableCell>
                                        <TableCell>
                                            {equipment.equ_type === 'pv' ? '太陽能' : '風力'}
                                        </TableCell>
                                        <TableCell>{equipment.power}</TableCell>
                                        <TableCell>{equipment.voltage}</TableCell>
                                        <TableCell>{equipment.useful_life}</TableCell>
                                        <TableCell>{equipment.iso14064 === 'y' ? '是' : '否'}</TableCell>
                                        <TableCell>{equipment.iso14001 === 'y' ? '是' : '否'}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={(e) => handleMenuOpen(e, equipment)}
                                            >
                                                <MoreVertIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
                                            <Collapse in={openDetailId === equipment.id} timeout="auto" unmountOnExit>
                                                <Box sx={{ margin: 2 }}>
                                                    {equipment.equ_type === 'pv' ? (
                                                        <EquipmentSolarDetail
                                                            equipmentId={equipment.id}
                                                            modelNo={equipment.model_no}
                                                        />
                                                    ) : (
                                                        <EquipmentWindDetail
                                                            equipmentId={equipment.id}
                                                            modelNo={equipment.model_no}
                                                        />
                                                    )}
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => selectedEquipment && handleEdit(selectedEquipment)}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>編輯</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon>
                        <HistoryIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>設備履歷</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleShowRemark}>
                    <ListItemIcon>
                        <CommentIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>顯示備註</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDeleteClick}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText sx={{ color: 'error.main' }}>刪除本設備</ListItemText>
                </MenuItem>
            </Menu>

            <Dialog
                open={remarkDialogOpen}
                onClose={() => setRemarkDialogOpen(false)}
            >
                <DialogTitle>設備備註</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {selectedEquipment?.remark || '無備註'}
                    </DialogContentText>
                </DialogContent>
            </Dialog>

            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
            >
                <DialogTitle>確認刪除</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        您確定要刪除設備 {selectedEquipment?.model_no} 嗎？此操作無法撤銷。
                    </DialogContentText>
                </DialogContent>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, gap: 1 }}>
                    <Button 
                        onClick={handleCloseDeleteDialog}
                        disabled={deleteInProgress}
                    >
                        取消
                    </Button>
                    <Button 
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={deleteInProgress}
                    >
                        {deleteInProgress ? '刪除中...' : '確認刪除'}
                    </Button>
                </Box>
            </Dialog>
        </Box>
    );
}

export default EquipmentManagement; 