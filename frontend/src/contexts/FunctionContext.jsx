import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// 只设置超时
axios.defaults.timeout = 15000;

// 修改请求拦截器
axios.interceptors.request.use(
  config => {
    // 在开发环境中，请求会被 Vite 代理处理
    console.log('Request URL:', config.url);
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 改进响应拦截器的错误处理
axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error);
      // 可以在这里添加重试逻辑
      return Promise.reject(new Error('请求超时，请检查网络连接'));
    }
    if (error.response) {
      console.error('Response Error:', error.response);
      return Promise.reject(error.response.data);
    }
    console.error('Network Error:', error);
    return Promise.reject(new Error('网络错误，请检查网络连接'));
  }
);

export const FunctionContext = createContext();

export const useFunctions = () => {
  const context = useContext(FunctionContext);
  if (!context) {
    throw new Error('useFunctions must be used within a FunctionProvider');
  }
  return context;
};

export const FunctionProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modules, setModules] = useState([]);

  const fetchFunctions = async (retryCount = 0) => {
    try {
      setLoading(true);
      console.log('Fetching functions for module:', selectedModule);

      const cachedData = localStorage.getItem('functionList');
      let data;

      if (cachedData) {
        data = JSON.parse(cachedData);
        console.log('Using cached data:', data);
      } else {
        try {
          // 改回正确的路径
          const response = await axios.get('/api/system/function', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            timeout: 15000
          });
          
          if (!response.data) {
            throw new Error('No data received from server');
          }
          
          data = response.data;
          localStorage.setItem('functionList', JSON.stringify(data));
          console.log('Fetched and cached new data:', data);
        } catch (error) {
          if (error.code === 'ECONNABORTED' && retryCount < 3) {
            console.log(`Retry attempt ${retryCount + 1}`);
            return fetchFunctions(retryCount + 1);
          }
          throw error;
        }
      }

      // 添加数据类型验证
      if (data && typeof data === 'object') {
        // 处理数据
        const validData = Array.isArray(data) ? data : [];
        if (!Array.isArray(validData)) {
          console.error('Unexpected data format:', validData);
          throw new Error('Invalid data format received from server');
        }

        // 提取所有唯一的模块（只考慮 type="f" 的項目）
        const uniqueModules = [...new Set(
          validData
            .filter(item => item.type === 'f')
            .map(item => item.module)
        )];
        console.log('Available modules:', uniqueModules);
        setModules(uniqueModules);

        // 如果有選定模塊，過濾該模塊的功能和公用模塊的功能（只考慮 type="f" 的項目）
        const filteredData = selectedModule 
          ? validData.filter(item => 
              item.type === 'f' && (
                item.module === selectedModule || 
                item.module === '公用模組'
              )
            )
          : validData.filter(item => item.type === 'f');

        console.log('Filtered data for module:', selectedModule, filteredData);

        if (filteredData.length === 0) {
          console.warn('No data found for selected module:', selectedModule);
          setMenuItems([]);
          return;
        }

        // 對過濾後的數據進行排序，確保公用模組在最後
        const sortedData = filteredData.sort((a, b) => {
          if (a.module === '公用模組') return 1;
          if (b.module === '公用模組') return -1;
          return a.no.localeCompare(b.no);
        });

        const transformedData = transformFunctionsToTree(sortedData);
        console.log('Transformed data:', transformedData);

        if (transformedData.length === 0) {
          console.warn('No menu items generated after transformation');
        }

        setMenuItems(transformedData);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching functions:', err);
      setError(err.message || 'Failed to fetch functions');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  // 添加 CSV 解析函數（如果需要的話）
  const parseCSVData = (csvData) => {
    // 如果後端直接返回 JSON 則不需要這個函數
    // 如果後端返回 CSV，則在這裡添加解析邏輯
    return csvData;
  };

  // 将扁平的功能列表转换为树形结构
  const transformFunctionsToTree = (functions) => {
    console.log('Starting transformation with:', functions);

    // 只處理 type="f" 的項目
    const functionItems = functions.filter(item => item.type === 'f');

    // 按照 level 分組
    const levelOneItems = functionItems.filter(func => func.level === 1 || func.level === '1');
    const levelTwoItems = functionItems.filter(func => func.level === 2 || func.level === '2');

    console.log('Level one items:', levelOneItems);
    console.log('Level two items:', levelTwoItems);

    // 創建一級菜單項的映射
    const result = levelOneItems.map(func => ({
      ...func,
      id: func.uid,  // 使用 uid 作為 id
      text: func.item_cn,
      icon: func.icon,
      children: []
    }));

    // 將二級菜單項添加到對應的父項下
    levelTwoItems.forEach(func => {
      const parentNo = func.no.split('.').slice(0, 2).join('.');
      const parentItem = result.find(item => item.no === parentNo);
      
      if (parentItem) {
        parentItem.children.push({
          ...func,
          id: func.uid,  // 使用 uid 作為 id
          text: func.item_cn,
          icon: func.icon
        });
      } else {
        console.warn(`Parent not found for item: ${func.no}`);
      }
    });

    // 對一級菜單排序
    result.sort((a, b) => {
      const aNo = a.no.split('.');
      const bNo = b.no.split('.');
      return aNo[0].localeCompare(bNo[0]) || Number(aNo[1]) - Number(bNo[1]);
    });

    // 對每個一級菜單的子項目排序
    result.forEach(item => {
      if (item.children && item.children.length > 0) {
        item.children.sort((a, b) => {
          const aNo = a.no.split('.').pop();
          const bNo = b.no.split('.').pop();
          return Number(aNo) - Number(bNo);
        });
      }
    });

    console.log('Final transformed result:', result);
    return result;
  };

  // 切换选定的模块
  const selectModule = (moduleName) => {
    console.log('Selecting module:', moduleName);
    setSelectedModule(moduleName);
  };

  // 当选定模块改变时重新获取菜单
  useEffect(() => {
    console.log('Selected module changed to:', selectedModule);
    fetchFunctions();
  }, [selectedModule]);

  // 初始加载
  useEffect(() => {
    fetchFunctions();
  }, []);

  const value = {
    menuItems,
    loading,
    error,
    modules,
    selectedModule,
    selectModule,
    refreshFunctions: fetchFunctions
  };

  console.log('FunctionProvider value:', value);

  return (
    <FunctionContext.Provider value={value}>
      {children}
    </FunctionContext.Provider>
  );
}; 