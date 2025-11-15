import React from 'react';
import { TextField, styled } from '@mui/material';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#ffffff',
    '& input': {
      color: 'rgba(0, 0, 0, 0.87)',
      '&:-webkit-autofill': {
        WebkitBoxShadow: '0 0 0 1000px white inset',
        WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
      },
    },
    '& fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.23)',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-filled fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-error fieldset': {
      borderColor: theme.palette.error.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(0, 0, 0, 0.6)',
    '&.MuiFormLabel-filled': {
      color: theme.palette.primary.main,
    },
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
  '& .MuiFormHelperText-root': {
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
}));

const OutlinedTextField = (props) => {
  const hasValue = props.value !== undefined && props.value !== '';
  
  return (
    <StyledTextField 
      {...props} 
      variant="outlined"
      className={`${props.className || ''} ${hasValue ? 'Mui-filled' : ''}`}
    />
  );
};

export default OutlinedTextField; 