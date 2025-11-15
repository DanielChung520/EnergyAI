import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  IconButton,
  Avatar,
  Button
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';

function AccountManagement() {
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      account: 'user123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      password: '******',
      avatar: 'https://via.placeholder.com/40'
    },
    {
      id: 2,
      account: 'user456',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '987-654-3210',
      password: '******',
      avatar: 'https://via.placeholder.com/40'
    }
  ]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('account');
  const [filter, setFilter] = useState('');

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);3
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(filter.toLowerCase()) ||
    account.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Box sx={{ p:  2}}>
      <Typography variant="h5" gutterBottom>
        賬號管理
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          fullWidth
          label="搜索"
          value={filter}
          onChange={handleFilterChange}
          margin="normal"
          variant="outlined"
          sx={{
            height: '40px',
            margin: 0,
            '& .MuiOutlinedInput-root': {
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              height: '100%',
              boxSizing: 'border-box'
            }
          }}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{
            height: '40px',
            margin: 0,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            minWidth: 100,
            boxSizing: 'border-box'
          }}
        >
          搜索
        </Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'account'}
                  direction={orderBy === 'account' ? order : 'asc'}
                  onClick={() => handleRequestSort('account')}
                >
                  賬號
                </TableSortLabel>
              </TableCell>
              <TableCell>使用者姓名</TableCell>
              <TableCell>郵箱</TableCell>
              <TableCell>聯繫電話</TableCell>
              <TableCell>密碼</TableCell>
              <TableCell>操作</TableCell>
              <TableCell>大頭像</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAccounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.account}</TableCell>
                <TableCell>{account.name}</TableCell>
                <TableCell>{account.email}</TableCell>
                <TableCell>{account.phone}</TableCell>
                <TableCell>******</TableCell>
                <TableCell>
                  <IconButton><EditIcon /></IconButton>
                  <IconButton><DeleteIcon /></IconButton>
                  <IconButton><RefreshIcon /></IconButton>
                </TableCell>
                <TableCell>
                  <Avatar src={account.avatar} alt={account.name} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default AccountManagement; 