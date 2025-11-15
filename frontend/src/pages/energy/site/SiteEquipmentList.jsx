import React from 'react';
import { Box } from '@mui/material';
import TowerComp from './TowerComp';
import SitePerformanceChart from './SitePerformanceChart';

function SiteEquipmentList() {
  const SITE_ID = 'c89286ff-bef3-496c-986b-8d74a521dc3b';
  const STAT_TYPE = 'power';

  return (
    <Box sx={{ p: 2 }}>
      <TowerComp>
        {(period) => (
          <SitePerformanceChart 
            siteId={SITE_ID}
            period={period}
            statType={STAT_TYPE}
            hideTitle={true}
          />
        )}
      </TowerComp>
    </Box>
  );
}

export default SiteEquipmentList;
