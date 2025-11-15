import { Box, Card, Typography } from '@mui/material';

const AllSitePerformance = () => {
  return (
    <Card
      sx={{

        // transform: 'translateX(-50%)',
        minWidth: 200,
        padding: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        boxShadow: 5,
        zIndex: 1000
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          textAlign: 'left',
          mb: 1,
          color: 'text.secondary'
        }}
      >
        本月全區累計電力產出
      </Typography>
      
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center'
        }}
      >
        <Typography
          variant="h3"
          component="span"
          sx={{
            fontWeight: 'bold',
            mr: 1
          }}
        >
          23.6
        </Typography>
        <Typography
          variant="subtitle1"
          component="span"
          sx={{
            color: 'text.secondary'
          }}
        >
          Mkh
        </Typography>
      </Box>
    </Card>
  );
};

export default AllSitePerformance;
