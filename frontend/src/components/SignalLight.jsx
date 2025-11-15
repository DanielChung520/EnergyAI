import React from 'react';
import { Box } from '@mui/material';

const SignalLight = ({ color = 'blue', size = 40, active = false }) => {
  // 定義顏色映射
  const colorMap = {
    blue: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      glow: 'rgba(25, 118, 210, 0.5)'
    },
    green: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
      glow: 'rgba(46, 125, 50, 0.5)'
    },
    yellow: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
      glow: 'rgba(237, 108, 2, 0.5)'
    },
    red: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
      glow: 'rgba(211, 47, 47, 0.5)'
    }
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        position: 'relative',
        backgroundColor: active ? selectedColor.main : '#757575',
        boxShadow: active
          ? `
            inset 0 0 ${size * 0.15}px ${selectedColor.light},
            inset 0 0 ${size * 0.3}px ${selectedColor.main},
            0 0 ${size * 0.1}px ${selectedColor.main},
            0 0 ${size * 0.2}px ${selectedColor.glow}
          `
          : `
            inset 0 0 ${size * 0.15}px #9e9e9e,
            inset 0 0 ${size * 0.3}px #757575
          `,
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '10%',
          left: '20%',
          width: '40%',
          height: '40%',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          filter: 'blur(2px)'
        }
      }}
    />
  );
};

export default SignalLight;
