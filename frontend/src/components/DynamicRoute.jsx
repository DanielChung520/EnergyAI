import { useNavigate } from 'react-router-dom';
// import TwMap from '../pages/Maps/TwMap';

/**
 * 動態路由 Hook
 * @param {string} functionNo - 功能編號，對應 functionList 中的 no
 * @returns {Object} 返回路由相關的數據和導航函數
 * 
 * 使用示例:
 * const DynamicRoute = new DynamicRoute('A.2.2');
 * DynamicRoute.navigateTo({ state: { data: someData } });
 */
export const useDynamicRoute = (functionNo) => {
  const navigate = useNavigate();
  
  // 從 localStorage 獲取功能數據
  const getFunctionData = () => {
    try {
      const functionList = JSON.parse(localStorage.getItem('functionList') || '[]');
      return functionList.find(item => item.no === functionNo) || null;
    } catch (error) {
      console.error('Error parsing function data:', error);
      return null;
    }
  };

  const functionData = getFunctionData();

  // 獲取路由數據
  const getRouteData = () => ({
    route: functionData?.route || '',
    itemCn: functionData?.item_cn || '',
    itemEn: functionData?.item_en || '',
    icon: functionData?.icon || '',
    fullPath: functionData?.route ? `/app/${functionData.route}` : ''
  });

  // 導航到指定路由
  const navigateTo = ({ state = {} } = {}) => {
    if (functionData?.route) {
      navigate(`/app/${functionData.route}`, { state });
    } else {
      console.warn(`Route not found for ${functionNo}, redirecting to UnderConstruction`);
      navigate('/app/under-construction', { 
        state: { 
          ...state,
          functionNo 
        } 
      });
    }
  };

  return {
    getRouteData,
    navigateTo,
    functionData
  };
};

export default useDynamicRoute; 