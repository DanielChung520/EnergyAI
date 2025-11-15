import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFunctions } from '../contexts/FunctionContext';
import { useAuth } from '../contexts/AuthContext';
import LogoImage from '../assets/BioEngy1_v1_W.png';
import WindTurbineLeft from '../assets/wind-turbine-left.jpg';

function LandingPage() {
  const navigate = useNavigate();
  const { selectModule } = useFunctions();
  const { isAuthenticated } = useAuth();

  const handleNavigateClick = () => {
    if (isAuthenticated) {
      navigate('/app/Maps/GlobalMaps');
    } else {
      navigate('/login');
    }
  };

  const handleFeatureClick = (moduleTitle) => {
    selectModule(moduleTitle);
    if (isAuthenticated) {
      navigate('/app/Maps/GlobalMaps');
    } else {
      navigate('/login');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 背景圖層 - 添加模糊效果 */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${WindTurbineLeft})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(5px)',
          transform: 'scale(1.1)',
          zIndex: 0,
        }}
      />
      
      {/* 覆蓋層 - 使用半透明藍色 */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(13, 94, 161, 0.6)',
          backdropFilter: 'blur(6px)',
          zIndex: 1,
        }}
      />

      {/* Header */}
      <Box
        sx={{
          py: 2,
          px: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img
            src={LogoImage}
            alt="Logo"
            style={{ height: 80, width: 'auto' }}
          />
         
        </Box>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleNavigateClick}
        >
          {isAuthenticated ? '进入系统' : '登入系统'}
        </Button>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 8, position: 'relative', zIndex: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            智慧能源管理平台
          </Typography>
          <Typography variant="h4" sx={{ mb: 4 }}>
            Bio-Energy AI Management Platform
          </Typography>
          <Typography variant="h5" sx={{ mb: 4 }}>
            整合能源管理、碳資產交易與企業節能的全方位解決方案
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={handleNavigateClick}
          >
            {isAuthenticated ? '立即进入' : '立即開始'}
          </Button>
        </Box>

        {/* Features */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          <FeatureCard
            title="能源管理運營平台"
            description="整合案場和設備管理，提供全面的營運分析和能源材料供應鏈管理。"
            onClick={() => handleFeatureClick("能源管理運營平台")}
          />
          <FeatureCard
            title="企業節能運營平台"
            description="幫助企業實現節能減排和可持續發展，通過全面的碳足跡管理和節能監控系統來達成目標。"
            onClick={() => handleFeatureClick("企業節能運營平台")}
          />
          <FeatureCard
            title="能源碳資產服務平台"
            description="提供碳資產和碳金融服務，幫助企業和個人實現碳中和目標。"
            onClick={() => handleFeatureClick("能源碳資產服務平台")}
          />
        </Box>
      </Container>
    </Box>
  );
}

function FeatureCard({ title, description, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        p: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        transition: 'transform 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
        }
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1">
        {description}
      </Typography>
    </Box>
  );
}

export default LandingPage; 