import { Box, Card, Typography, Stack } from '@mui/material';
import Co2Icon from '@mui/icons-material/Co2';

const CoIndicator = () => {
  return (
    <Card
      sx={{
        width: '100%',
        height: '100%',
        padding: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        boxShadow: 5
      }}
    >
      {/* 標題區域 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1
        }}
      >
        <Co2Icon 
          sx={{ 
            color: 'text.secondary',
            fontSize: 40 
          }} 
        />
        <Typography
          variant="subtitle1"
          sx={{
            textAlign: 'left',
            color: 'text.secondary'
          }}
        >
         Co2排放量指標
        </Typography>
      </Box>
      
      {/* 主要數值區域 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          mb: 1
        }}
      >
        <Typography
          variant="h4"
          component="span"
          sx={{
            fontWeight: 'bold',
            mr: 1,
            color: 'error.main'  // 使用紅色
          }}
        >
          0.253
        </Typography>
        <Typography
          variant="subtitle1"
          component="span"
          sx={{
            color: 'text.secondary'
          }}
        >
          kg/kWh
        </Typography>
      </Box>

      {/* 累計碳排量區域 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          mt: 1
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: 'text.secondary',
            mr: 1
          }}
        >
          累計碳排量
        </Typography>
        <Typography
          variant="h5"
          component="span"
          sx={{
            fontWeight: 'bold',
            mr: 1,
            color: 'error.main'
          }}
        >
          1,200
        </Typography>
        <Typography
          variant="subtitle2"
          component="span"
          sx={{
            color: 'text.secondary'
          }}
        >
          t
        </Typography>
      </Box>
    </Card>
  );
};

export default CoIndicator;
