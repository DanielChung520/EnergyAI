import { Box, Typography, IconButton } from '@mui/material';
import OpenWithOutlinedIcon from '@mui/icons-material/OpenWithOutlined';

const CardHeader = ({
  title = '標題',
  showExpand = true,
  onExpand,
  headerWidth = '50%',
  headerHeight = 35,
  bgColor = 'primary.main'
}) => {
  const createSvgBackground = (color) => {
    const svg = `
      <svg width="100%" height="100%" viewBox="0 0 592 77" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow">
            <feGaussianBlur stdDeviation="1"/>
            <feOffset dx="0" dy="1"/>
            <feComposite in2="SourceGraphic" operator="over"/>
          </filter>
        </defs>
        <path d="M 0,0 
          L 583,0 
          C 576.3,0.7 570.2,2 564.6,4.9 
          C 562.2,6.1 559.7,7.1 557.4,8.5 
          C 554.4,10.4 551.6,12.4 548.9,14.6 
          C 545.3,17.5 541.8,20.6 538.3,23.6 
          C 534.9,26.5 531.5,29.5 528.1,32.4 
          C 523.7,36.1 519.3,39.8 515,43.5 
          L 504.6,52.5 
          C 500.2,56.2 495.9,59.9 491.5,63.6 
          C 482.9,71.8 472.4,75.1 463.3,76.1 
          C 452,77.9 440.4,78.1 428.8,78.1 
          C 285.8,78.1 142.8,78 0.8,78 
          C 0.4,78 -0.2,78.2 0.2,77.4 
          L 0,0 Z" 
          fill="${color}"
          filter="url(#shadow)"
        />
      </svg>
    `;
    return `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}')`;
  };

  return (
    <>
      {showExpand && (
        <IconButton
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            zIndex: 2,
            color: 'rgba(0, 0, 0, 0.6)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.1)'
            }
          }}
          onClick={onExpand}
        >
          <OpenWithOutlinedIcon fontSize="small" />
        </IconButton>
      )}

      <Box
        sx={{
          position: 'absolute',
          width: headerWidth,
          height: headerHeight,
          color: 'common.white',
          borderBottomRightRadius: 8,
          backgroundImage: (theme) => createSvgBackground(theme.palette[bgColor.split('.')[0]][bgColor.split('.')[1]]),
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'transparent',
          isolation: 'isolate',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'transparent',
            zIndex: -1
          }
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            position: 'absolute',
            top: '50%',
            left: 20,
            transform: 'translateY(-50%)',
            zIndex: 1.2,
            fontSize: '1rem',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.9)',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)'
          }}
        >
          {title}
        </Typography>
      </Box>
    </>
  );
};

export default CardHeader; 