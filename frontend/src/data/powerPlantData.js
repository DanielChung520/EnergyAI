export const powerPlantData = [
  {
    name: '台北電廠',
    value: [121.5, 25.03, 500],
    type: 'solar', // 電廠類型
    status: 'active', // 運轉狀態
    details: {
      capacity: 500, // MW
      yearBuilt: 2020,
      operator: '台電',
      // ... 其他詳細資訊
    }
  },
  {
    name: '高雄電廠',
    value: [120.3, 22.6, 300],
    type: 'wind',
    status: 'active',
    details: {
      capacity: 300,
      yearBuilt: 2019,
      operator: '台電',
    }
  },
  // ... 更多電廠數據
];

// 電廠類型的圖示配置
export const plantTypeConfig = {
  solar: {
    symbol: 'path://...', // 太陽能圖示的 SVG path
    color: '#FFD700'
  },
  wind: {
    symbol: 'path://...', // 風力圖示的 SVG path
    color: '#87CEEB'
  },
  // ... 其他類型
};

// 狀態配置
export const statusConfig = {
  active: {
    color: '#00FF00',
    label: '運轉中'
  },
  inactive: {
    color: '#FF0000',
    label: '停機'
  },
  maintenance: {
    color: '#FFA500',
    label: '維護中'
  }
}; 