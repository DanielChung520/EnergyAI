import React, { useState, useEffect } from 'react';
import { Box, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper, Button, Chip } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FunctionOperator from './FunctionOperator'; // 引入 FunctionOperator

const FunctionList = () => {
  const [functions, setFunctions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [sortBy, setSortBy] = useState('no');
  const [isOperatorOpen, setOperatorOpen] = useState(false);
  const [currentFunction, setCurrentFunction] = useState(null);

  // 將 fetchFunctions 移到 useEffect 外部
  const fetchFunctions = async () => {
    try {
      const response = await fetch('/api/system/function');
      if (!response.ok) {
        throw new Error('Failed to fetch functions');
      }
      const data = await response.json();
      setFunctions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching functions:', error);
      setFunctions([]);
    }
  };

  useEffect(() => {
    fetchFunctions();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortRequest = (property) => {
    const isAsc = sortBy === property && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  const filteredFunctions = functions.filter((func) => {
    const searchTermLower = searchTerm.toLowerCase();
    
    return (
      (func.no?.toString() || '').includes(searchTerm) || // 編號
      (func.module?.toLowerCase() || '').includes(searchTermLower) || // 模組
      (func.item_cn?.toLowerCase() || '').includes(searchTermLower) || // 中文名稱
      (func.item_en?.toLowerCase() || '').includes(searchTermLower) || // 英文名稱
      (func.route?.toLowerCase() || '').includes(searchTermLower) || // 路由
      (func.icon?.toLowerCase() || '').includes(searchTermLower) // 圖標
    );
  });

  const sortedFunctions = filteredFunctions.sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortBy] < b[sortBy] ? -1 : 1;
    } else {
      return a[sortBy] > b[sortBy] ? -1 : 1;
    }
  });

  const handleEdit = (uid) => {
    const functionToEdit = functions.find(func => func.uid === uid);
    setCurrentFunction(functionToEdit);
    setOperatorOpen(true); // 打開編輯對話框
  };

  const handleDelete = async (uid) => {
    // 刪除功能的邏輯
    const confirmed = window.confirm('確定要刪除這個功能嗎？');
    if (confirmed) {
      try {
        const response = await fetch(`/api/functions/${uid}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setFunctions(functions.filter(func => func.uid !== uid));
          console.log('Function deleted successfully');
        } else {
          console.error('Failed to delete function');
        }
      } catch (error) {
        console.error('Error deleting function:', error);
      }
    }
  };

  const handleAddFunction = () => {
    setCurrentFunction(null); // 清空當前功能資料以便新增
    setOperatorOpen(true); // 打開新增對話框
  };

  const handleOpenOperator = (functionData) => {
    setCurrentFunction(functionData);
    setOperatorOpen(true);
  };

  const handleCloseOperator = () => {
    setCurrentFunction(null);
    setOperatorOpen(false);
  };

  const handleSaveFunction = (functionData) => {
    fetchFunctions(); // 現在可以訪問到 fetchFunctions
    handleCloseOperator();
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'f':
        return '功能';
      case 'sf':
        return '附屬功能';
      default:
        return type;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
        <TextField
          label="搜索"
          variant="outlined"
          fullWidth
          onChange={handleSearchChange}
          sx={{
            width: '50%',
            '& .MuiInputBase-input': {
              color: 'white',
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'white',
              },
              '&:hover fieldset': {
                borderColor: 'white',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'white',
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'gray',
            },
          }}
          placeholder="搜索"
        />
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleIcon />}
          onClick={handleAddFunction}
          sx={{ ml: 2 }}
        >
          新增功能
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 180px)', overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'secondary.main',
                    color: 'white',
                  },
                }}
              >
                <TableSortLabel
                  active={sortBy === 'no'}
                  direction={sortBy === 'no' ? sortDirection : 'asc'}
                  onClick={() => handleSortRequest('no')}
                  sx={{ color: 'inherit' }}
                >
                  編號
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'secondary.main',
                    color: 'white',
                  },
                }}
              >
                <TableSortLabel
                  active={sortBy === 'module'}
                  direction={sortBy === 'module' ? sortDirection : 'asc'}
                  onClick={() => handleSortRequest('module')}
                  sx={{ color: 'inherit' }}
                >
                  模組
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'secondary.main',
                    color: 'white',
                  },
                }}
              >
                <TableSortLabel
                  active={sortBy === 'item_cn'}
                  direction={sortBy === 'item_cn' ? sortDirection : 'asc'}
                  onClick={() => handleSortRequest('item_cn')}
                  sx={{ color: 'inherit' }}
                >
                  名稱-中文
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'secondary.main',
                    color: 'white',
                  },
                }}
              >
                <TableSortLabel
                  active={sortBy === 'item_en'}
                  direction={sortBy === 'item_en' ? sortDirection : 'asc'}
                  onClick={() => handleSortRequest('item_en')}
                  sx={{ color: 'inherit' }}
                >
                  名稱-英文
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'secondary.main',
                    color: 'white',
                  },
                }}
              >
                <TableSortLabel
                  active={sortBy === 'type'}
                  direction={sortBy === 'type' ? sortDirection : 'asc'}
                  onClick={() => handleSortRequest('type')}
                  sx={{ color: 'inherit' }}
                >
                  類型
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'secondary.main',
                    color: 'white',
                  },
                }}
              >
                <TableSortLabel
                  active={sortBy === 'route'}
                  direction={sortBy === 'route' ? sortDirection : 'asc'}
                  onClick={() => handleSortRequest('route')}
                  sx={{ color: 'inherit' }}
                >
                  路由
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ backgroundColor: 'primary.main', color: 'white' }}>功能層級</TableCell>
              <TableCell sx={{ backgroundColor: 'primary.main', color: 'white' }}>圖標</TableCell>
              <TableCell sx={{ backgroundColor: 'primary.main', color: 'white' }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedFunctions.map((func) => (
              <TableRow
                key={func.uid}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(200, 200, 200, 0.2)', // 懸停時的背景顏色為淺灰色
                    color: 'black', // 懸停時的文本顏色為黑色
                  },
                }}
              >
                <TableCell sx={{ color: 'black' }}>{func.no}</TableCell>
                <TableCell>{func.module}</TableCell>
                <TableCell>{func.item_cn}</TableCell>
                <TableCell>{func.item_en}</TableCell>
                <TableCell>{getTypeLabel(func.type)}</TableCell>
                <TableCell>{func.route}</TableCell>
                <TableCell>{func.level}</TableCell>
                <TableCell>{func.icon}</TableCell>
                <TableCell>
                  <Chip
                    label="編輯"
                    onClick={() => handleEdit(func.uid)}
                    color="primary"
                    variant="outlined"
                    sx={{ cursor: 'pointer', mr: 1 }}
                  />
                  <Chip
                    label="刪除"
                    onClick={() => handleDelete(func.uid)}
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
      <FunctionOperator
        open={isOperatorOpen}
        onClose={handleCloseOperator}
        functionData={currentFunction}
        onSave={handleSaveFunction}
        existingFunctions={functions}
      />
    </Box>
  );
};

export default FunctionList;
