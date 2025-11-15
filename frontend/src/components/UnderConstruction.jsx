import { Box, Typography } from '@mui/material';
import { Construction } from '@mui/icons-material';

function UnderConstruction() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 400,
        gap: 2
      }}
    >
      <Construction sx={{ fontSize: 60, color: 'warning.main' }} />
      <Typography variant="h4" color="text.secondary">
        功能建置中
      </Typography>
      <Typography color="text.secondary">
        此功能正在開發中，敬請期待...
      </Typography>
    </Box>
  );
}

export default UnderConstruction; 