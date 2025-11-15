import React, { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Checkbox, FormControlLabel } from '@mui/material';

function FeatureRoleMapping() {
  const features = [
    '功能A',
    '功能B',
    '功能C',
    '功能D',
    '功能E'
  ];

  const roles = [
    '電廠運營管理員',
    '電廠營運操作員',
    '企業永續節能管理員',
    '企業節能成員',
    '碳資產服務管理員'
  ];

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
        系統功能清單與角色勾稽
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

export default FeatureRoleMapping; 