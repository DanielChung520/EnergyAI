// 初始國家/區域數據
export const countryData = {
  // SVG path ID 對應的名稱
  regionNames: {
    // 使用實際的 path ID 和已保存的名稱
  },

  // SVG path ID 與大分區的關聯
  parentRegions: {
    // 使用實際的 path ID 和已保存的關聯
  }
};

// 同步服務
export const syncLocalStorage = {
  // 初始化 localStorage
  init() {
    if (!localStorage.getItem('regionNames')) {
      localStorage.setItem('regionNames', JSON.stringify(countryData.regionNames));
    }
    if (!localStorage.getItem('parentRegions')) {
      localStorage.setItem('parentRegions', JSON.stringify(countryData.parentRegions));
    }
    if (!localStorage.getItem('regions')) {
      localStorage.setItem('regions', JSON.stringify(regionData));
    }
  },

  // 從 localStorage 獲取數據
  getData() {
    return {
      regionNames: JSON.parse(localStorage.getItem('regionNames') || '{}'),
      parentRegions: JSON.parse(localStorage.getItem('parentRegions') || '{}'),
      regions: JSON.parse(localStorage.getItem('regions') || '[]')
    };
  },

  // 更新 localStorage 數據
  updateData(data) {
    if (data.regionNames) {
      localStorage.setItem('regionNames', JSON.stringify(data.regionNames));
    }
    if (data.parentRegions) {
      localStorage.setItem('parentRegions', JSON.stringify(data.parentRegions));
    }
    if (data.regions) {
      localStorage.setItem('regions', JSON.stringify(data.regions));
    }
  }
}; 