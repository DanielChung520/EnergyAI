// 從 localStorage 讀取設備數據
export const loadEquipmentData = () => {
  try {
    const data = localStorage.getItem('siteEquipments');
    if (data) {
      // 验证数据是否为有效的 JSON
      JSON.parse(data);
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error('Error loading equipment data:', error);
    return {};
  }
};

// 保存設備數據到 localStorage
export const saveEquipmentData = (data) => {
  try {
    localStorage.setItem('siteEquipments', JSON.stringify(data));
    console.log('Equipment data saved successfully');
  } catch (error) {
    console.error('Error saving equipment data:', error);
    throw error;
  }
}; 