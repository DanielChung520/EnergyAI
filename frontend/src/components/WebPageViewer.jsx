import React from 'react';
import { 
  Box, 
  Card, 
  CardHeader, 
  CardContent,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const STYLES = {
  fontSize: {
    title: '1.1rem'
  },
  padding: {
    header: 1
  },
  height: {
    container: '768px',
    content: 'calc(768px - 48px)'
  },
  width: {
    container: '1024px'
  }
};

const WebPageViewer = ({ url, title, onClose }) => {
  return (
    <Box sx={{ 
      p: 1, 
      height: STYLES.height.container,
      width: STYLES.width.container
    }}>
      <Card sx={{ height: '100%', width: '100%' }}>
        <CardHeader 
          title={title}
          action={
            <IconButton 
              onClick={onClose}
              size="small"
              sx={{ 
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          }
          sx={{
            backgroundColor: theme => theme.palette.primary.main,
            color: 'white',
            py: STYLES.padding.header,
            '& .MuiCardHeader-title': {
              fontSize: STYLES.fontSize.title,
              fontWeight: 'bold'
            },
            '& .MuiCardHeader-action': {
              margin: 0,
              alignSelf: 'center'
            }
          }}
        />
        <CardContent sx={{ 
          p: 0, 
          height: STYLES.height.content, 
          '&:last-child': { pb: 0 } 
        }}>
          <iframe
            src={url}
            title={title}
            width="100%"
            height="100%"
            style={{ 
              border: 'none',
              display: 'block'
            }}
            sandbox="allow-same-origin allow-scripts"
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default WebPageViewer; 