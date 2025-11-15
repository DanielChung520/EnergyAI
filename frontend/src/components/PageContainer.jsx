import { Box } from '@mui/material';

function PageContainer({ children }) {
  return (
    <Box sx={{
      flexGrow: 1,
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      p: 0
    }}>
      {children}
    </Box>
  );
}

export default PageContainer; 