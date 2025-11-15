import React from 'react';
import { Slider } from '@mui/material';

const ChartSlider = ({ value, onChange }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '80%',
      maxWidth: '1200px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Slider
        value={value}
        onChange={onChange}
        min={1}
        max={24}
        marks={[
          { value: 1, label: '1小時' },
          { value: 6, label: '6小時' },
          { value: 12, label: '12小時' },
          { value: 24, label: '24小時' }
        ]}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => `${value}小時`}
        sx={{
          width: '100%',
          '& .MuiSlider-mark': {
            backgroundColor: '#bfbfbf',
          },
          '& .MuiSlider-track': {
            backgroundColor: '#91cc75',
          },
          '& .MuiSlider-thumb': {
            backgroundColor: '#91cc75',
          }
        }}
      />
    </div>
  );
};

export default ChartSlider; 