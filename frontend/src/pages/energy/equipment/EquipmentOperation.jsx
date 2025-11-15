import { Box, Typography } from '@mui/material';

function EquipmentOperation() {
  return (
    <Box sx={{ 
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh'
    }}>
      <Typography variant="h5" color="text.secondary">
        系統建構中...
      </Typography>
    </Box>
  );
}

export default EquipmentOperation; 