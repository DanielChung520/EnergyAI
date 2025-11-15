import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox } from '@mui/material';
import { menuItems } from '../config/menuConfig';

function RoleFeatureMatrix() {
  const roles = [
    '電廠運營管理員',
    '電廠營運操作員',
    '企業永續節能管理員',
    '企業節能成員',
    '碳資產服務管理員'
  ];

  const features = menuItems.flatMap(item => [
    { text: item.text, level: 0 },
    ...(item.children?.map(child => ({ text: child.text, level: 1 })) || [])
  ]);

  const [roleFeatureMap, setRoleFeatureMap] = useState({});

  const handleToggle = (role, feature) => {
    setRoleFeatureMap(prevMap => {
      const roleFeatures = prevMap[role] || [];
      const updatedFeatures = roleFeatures.includes(feature)
        ? roleFeatures.filter(f => f !== feature)
        : [...roleFeatures, feature];
      return { ...prevMap, [role]: updatedFeatures };
    });
  };

  return (
    <Box sx={{ p: 3, height: '100vh' }}>
      <Typography variant="h4" gutterBottom>
        角色與功能矩陣
      </Typography>
      <TableContainer sx={{ height: 'calc(100% - 64px)' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>功能</TableCell>
              {roles.map(role => (
                <TableCell key={role}>{role}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {features.map(({ text, level }) => (
              <TableRow key={text}>
                <TableCell sx={{ pl: level * 2, fontWeight: level === 0 ? 'bold' : 'normal' }}>{text}</TableCell>
                {roles.map(role => (
                  <TableCell key={role} align="center">
                    <Checkbox
                      checked={roleFeatureMap[role]?.includes(text) || false}
                      onChange={() => handleToggle(role, text)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default RoleFeatureMatrix; 