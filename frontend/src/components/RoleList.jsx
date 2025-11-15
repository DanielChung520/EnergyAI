import React, { useState } from 'react';
import { Box, Typography, List, ListItem, Checkbox, FormControlLabel } from '@mui/material';
import { menuItems } from '../config/menuConfig';

function RoleList() {
  const roles = [
    '電廠運營管理員',
    '電廠營運操作員',
    '企業永續節能管理員',
    '企業節能成員',
    '碳資產服務管理員'
  ];

  const features = menuItems.flatMap(item => [item.text, ...(item.children?.map(child => child.text) || [])]);

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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        角色清單與功能勾稽
      </Typography>
      {roles.map(role => (
        <Box key={role} sx={{ mb: 3 }}>
          <Typography variant="h6">{role}</Typography>
          <List>
            {features.map(feature => (
              <ListItem key={feature}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={roleFeatureMap[role]?.includes(feature) || false}
                      onChange={() => handleToggle(role, feature)}
                    />
                  }
                  label={feature}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      ))}
    </Box>
  );
}

export default RoleList; 