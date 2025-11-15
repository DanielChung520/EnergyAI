import { Box, Typography } from '@mui/material';
import CardComp from '@/components/CardComp';

function EquipmentList() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>設備清單</Typography>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 3,
        width: '100%'
      }}>
        <CardComp 
          theme="light" 
          title="明亮卡片展示" 
          width={400} 
          height={300} 
        />
        <CardComp 
          theme="dark" 
          title="深色卡片" 
          width={400} 
          height={300} 
        />
      </Box>
    </Box>
  );
}

export default EquipmentList; 