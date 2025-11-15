import React from 'react';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import '../styles/switchIOS.css';

const IOSSwitch = styled(({ width = 51, height = 31, ...props }) => (
  <Switch 
    focusVisibleClassName=".Mui-focusVisible" 
    disableRipple 
    className="ios-switch1"
    {...props} 
  />
))(({ theme, width, height }) => {
  // iOS 風格的比例關係
  const thumbDiameter = height - 2;  // 圓形按鈕直徑，留1px邊距
  const thumbMargin = 1;  // 邊距
  const translateX = width - thumbDiameter - (thumbMargin * 2);  // 移動距離

  return {
    width,
    height,
    padding: 0,
    '& .MuiSwitch-switchBase': {
      padding: 0,
      margin: thumbMargin,
      transitionDuration: '200ms',
      '&.Mui-checked': {
        transform: `translateX(${translateX}px)`,
      }
    },
    '& .MuiSwitch-thumb': {
      width: thumbDiameter,
      height: thumbDiameter,
    },
    '& .MuiSwitch-track': {
      borderRadius: height / 2,
    }
  };
});

export default IOSSwitch;
