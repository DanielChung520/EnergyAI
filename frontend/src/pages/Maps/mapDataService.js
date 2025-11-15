// 從 SVG path 元素獲取中心點坐標
function getPathCenterCoordinates(pathId) {
  const pathElement = document.getElementById(pathId);
  if (pathElement) {
    try {
      // 獲取 path 的中心點
      const pathLength = pathElement.getTotalLength();
      const midPoint = pathElement.getPointAtLength(pathLength / 2);
      
      // 使用 SVG 的座標系統
      const svg = pathElement.ownerSVGElement;
      if (!svg) return null;
      
      // 創建一個點來進行座標轉換
      const point = svg.createSVGPoint();
      point.x = midPoint.x;
      point.y = midPoint.y;
      
      // 獲取 SVG 的變換矩陣
      const ctm = svg.getScreenCTM();
      if (!ctm) return null;
      
      // 計算實際座標（考慮 SVG 的變換）
      const transformedPoint = point.matrixTransform(ctm.inverse());
      
      return [
        transformedPoint.x,
        transformedPoint.y
      ];
    } catch (error) {
      console.error('計算路徑中心點失敗:', error);
      return null;
    }
  }
  return null;
}

// 添加新的緩存鍵
const REGION_STORAGE_KEY = 'region_data';
const MAP_REGION_STORAGE_KEY = 'map_region_data';
const COUNTRY_STORAGE_KEY = 'country_data';

class MapDataService {
  constructor() {
    // 立即初始化數據
    this.initializeData();
  }

  // 修改初始化數據方法，同時初始化兩種數據
  async initializeData() {
    try {
      await Promise.all([
        this.initializeRegionData(),
        this.initializeMapRegionData(),
        this.initializeCountryData()
      ]);
    } catch (error) {
      console.error('初始化數據失敗:', error);
    }
  }

  // 區域數據初始化
  async initializeRegionData() {
    try {
      const cachedData = this.getLocalData(REGION_STORAGE_KEY);
      console.log('檢查區域本地緩存:', cachedData);
      
      if (!cachedData) {
        console.log('區域本地緩存不存在，從後端獲取數據');
        const data = await this.syncRegionsFromBackend();
        return data;
      }
      return cachedData;
    } catch (error) {
      console.error('初始化區域數據失敗:', error);
      return null;
    }
  }

  // 地圖區域數據初始化
  async initializeMapRegionData() {
    try {
      const cachedData = this.getLocalData(MAP_REGION_STORAGE_KEY);
      console.log('檢查地圖區域本地緩存:', cachedData);
      
      if (!cachedData) {
        console.log('地圖區域本地緩存不存在，從後端獲取數據');
        const data = await this.syncMapRegionsFromBackend();
        return data;
      }
      return cachedData;
    } catch (error) {
      console.error('初始化地圖區域數據失敗:', error);
      return null;
    }
  }

  // 國家數據初始化
  async initializeCountryData() {
    try {
      const cachedData = this.getLocalData(COUNTRY_STORAGE_KEY);
      console.log('檢查國家本地緩存:', cachedData);
      
      if (!cachedData) {
        console.log('國家本地緩存不存在，從後端獲取數據');
        const data = await this.syncCountriesFromBackend();
        return data;
      }
      return cachedData;
    } catch (error) {
      console.error('初始化國家數據失敗:', error);
      return null;
    }
  }

  // 從 LocalStorage 獲取數據
  getLocalData(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('讀取本地數據失敗:', error);
      return null;
    }
  }

  // 保存數據到 LocalStorage
  saveLocalData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('保存本地數據失敗:', error);
      return false;
    }
  }

  // 從後端同步區域數據
  async syncRegionsFromBackend() {
    try {
      const response = await fetch('/api/map/regions');
      const data = await response.json();
      if (data) {
        this.saveLocalData(REGION_STORAGE_KEY, data);
      }
      return data;
    } catch (error) {
      console.error('同步區域數據失敗:', error);
      throw error;
    }
  }

  // 從後端同步地圖區域數據
  async syncMapRegionsFromBackend() {
    try {
      const response = await fetch('/api/map/map-regions');
      const data = await response.json();
      if (data) {
        this.saveLocalData(MAP_REGION_STORAGE_KEY, data);
      }
      return data;
    } catch (error) {
      console.error('同步地圖區域數據失敗:', error);
      throw error;
    }
  }

  // 從後端同步國家數據
  async syncCountriesFromBackend() {
    try {
      const response = await fetch('/api/map/countries');
      const data = await response.json();
      if (data) {
        this.saveLocalData(COUNTRY_STORAGE_KEY, data);
      }
      return data;
    } catch (error) {
      console.error('同步國家數據失敗:', error);
      throw error;
    }
  }

  // 獲取區域數據
  async getRegions() {
    try {
      let data = this.getLocalData(REGION_STORAGE_KEY);
      if (!data) {
        data = await this.syncRegionsFromBackend();
      }
      return data?.regions || [];
    } catch (error) {
      console.error('獲取區域數據失敗:', error);
      return [];
    }
  }

  // 獲取地圖區域數據
  async getMapRegions() {
    try {
      let data = this.getLocalData(MAP_REGION_STORAGE_KEY);
      if (!data) {
        data = await this.syncMapRegionsFromBackend();
      }
      return data?.regions || [];
    } catch (error) {
      console.error('獲取地圖區域數據失敗:', error);
      return [];
    }
  }

  // 獲取國家數據
  async getCountries() {
    try {
      let data = this.getLocalData(COUNTRY_STORAGE_KEY);
      if (!data) {
        data = await this.syncCountriesFromBackend();
      }
      return data?.countries || [];
    } catch (error) {
      console.error('獲取國家數據失敗:', error);
      return [];
    }
  }

  // 更新區域
  async updateRegion(regionId, regionData) {
    try {
      const response = await fetch(`/api/map/regions/${regionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(regionData)
      });
      const data = this.getLocalData(REGION_STORAGE_KEY);
      if (data) {
        const index = data.regions.findIndex(r => r.id === regionId);
        if (index !== -1) {
          data.regions[index] = await response.json();
          this.saveLocalData(REGION_STORAGE_KEY, data);
        }
      }
      return await response.json();
    } catch (error) {
      console.error('更新區域失敗:', error);
      throw error;
    }
  }

  // 更新地圖區域
  async updateMapRegion(pathId, regionData) {
    try {
      // 調用後端 API
      const response = await fetch(`/api/map/map-regions/${pathId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(regionData)
      });
      
      // 更新本地緩存
      const data = this.getLocalData(MAP_REGION_STORAGE_KEY);
      if (data) {
        const index = data.regions.findIndex(r => r.path_id === pathId);
        if (index !== -1) {
          // 確保數據格式一致
          const updatedRegion = {
            path_id: pathId,
            region_id: regionData.region_id || '',
            country: regionData.country || '',
            responsable: regionData.responsable || '',
            contact: regionData.contact || '',
            coordinates: regionData.coordinates || [],
            created_at: data.regions[index].created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          data.regions[index] = updatedRegion;
          this.saveLocalData(MAP_REGION_STORAGE_KEY, data);
        }
      }
      
      return await response.json();
    } catch (error) {
      console.error('更新地圖區域失敗:', error);
      throw error;
    }
  }

  // 清除所有緩存
  clearAllCache() {
    try {
      localStorage.removeItem(REGION_STORAGE_KEY);
      localStorage.removeItem(MAP_REGION_STORAGE_KEY);
      localStorage.removeItem(COUNTRY_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('清除緩存失敗:', error);
      return false;
    }
  }

  // 強制重新同步所有數據
  async forceSync() {
    try {
      await Promise.all([
        this.syncRegionsFromBackend(),
        this.syncMapRegionsFromBackend(),
        this.syncCountriesFromBackend()
      ]);
      return true;
    } catch (error) {
      console.error('強制同步失敗:', error);
      return false;
    }
  }

  // 創建新區域
  async createRegion(regionData) {
    try {
      // 先更新後端
      const response = await fetch('/api/map/map-regions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(regionData)
      });
      
      // 成功後更新本地緩存
      const data = this.getLocalData(MAP_REGION_STORAGE_KEY) || { regions: [] };
      data.regions.push(await response.json());
      this.saveLocalData(MAP_REGION_STORAGE_KEY, data);
      
      return await response.json();
    } catch (error) {
      console.error('創建區域失敗:', error);
      throw error;
    }
  }

  // 刪除區域
  async deleteRegion(pathId) {
    try {
      // 先更新後端
      await fetch(`/api/map/map-regions/${pathId}`, {
        method: 'DELETE'
      });
      
      // 成功後更新本地緩存
      const data = this.getLocalData(MAP_REGION_STORAGE_KEY);
      if (data) {
        data.regions = data.regions.filter(r => r.path_id !== pathId);
        this.saveLocalData(MAP_REGION_STORAGE_KEY, data);
      }
      
      return true;
    } catch (error) {
      console.error('刪除區域失敗:', error);
      throw error;
    }
  }

  // 批量更新區域
  async batchUpdateRegions(updates) {
    try {
      // 先更新後端
      const response = await fetch('/api/map/map-regions/batch', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      // 成功後更新本地緩存
      const data = this.getLocalData(MAP_REGION_STORAGE_KEY);
      if (data) {
        updates.forEach(update => {
          const index = data.regions.findIndex(r => r.path_id === update.path_id);
          if (index !== -1) {
            data.regions[index] = { ...data.regions[index], ...update };
          }
        });
        this.saveLocalData(MAP_REGION_STORAGE_KEY, data);
      }
      
      return await response.json();
    } catch (error) {
      console.error('批量更新區域失敗:', error);
      throw error;
    }
  }

  // 創建新國家
  async createCountry(countryData) {
    try {
      const response = await fetch('/api/map/countries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(countryData)
      });
      const data = this.getLocalData(COUNTRY_STORAGE_KEY) || { countries: [] };
      data.countries.push(await response.json());
      this.saveLocalData(COUNTRY_STORAGE_KEY, data);
      return await response.json();
    } catch (error) {
      console.error('創建國家失敗:', error);
      throw error;
    }
  }

  // 更新特定國家
  async updateCountry(countryId, countryData) {
    try {
      const response = await fetch(`/api/map/countries/${countryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(countryData)
      });
      const data = this.getLocalData(COUNTRY_STORAGE_KEY);
      if (data) {
        const index = data.countries.findIndex(c => c.id === countryId);
        if (index !== -1) {
          data.countries[index] = await response.json();
          this.saveLocalData(COUNTRY_STORAGE_KEY, data);
        }
      }
      return await response.json();
    } catch (error) {
      console.error('更新國家失敗:', error);
      throw error;
    }
  }

  // 刪除特定國家
  async deleteCountry(countryId) {
    try {
      await fetch(`/api/map/countries/${countryId}`, {
        method: 'DELETE'
      });
      const data = this.getLocalData(COUNTRY_STORAGE_KEY);
      if (data) {
        data.countries = data.countries.filter(c => c.id !== countryId);
        this.saveLocalData(COUNTRY_STORAGE_KEY, data);
      }
      return true;
    } catch (error) {
      console.error('刪除國家失敗:', error);
      throw error;
    }
  }
}

export default new MapDataService(); 