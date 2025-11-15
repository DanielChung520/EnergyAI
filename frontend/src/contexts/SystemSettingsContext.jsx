import { createContext, useContext, useState, useEffect } from 'react';

const SystemSettingsContext = createContext(null);

// 默認設置
const defaultSettings = {
  systemName: 'Energy AI Platform',
  logo: null,
  language: 'zh-TW',
  theme: 'system'
};

export const SystemSettingsProvider = ({ children }) => {
  // 從 localStorage 讀取設置，如果沒有則使用默認設置
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('systemSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // 當設置改變時，保存到 localStorage
  useEffect(() => {
    localStorage.setItem('systemSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  // Logo 需要特殊處理，因為是文件
  const updateLogo = async (file) => {
    if (file) {
      // 轉換為 base64 存儲
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({
          ...prev,
          logo: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <SystemSettingsContext.Provider 
      value={{ 
        settings, 
        updateSettings,
        updateLogo,
        resetToDefault: () => setSettings(defaultSettings)
      }}
    >
      {children}
    </SystemSettingsContext.Provider>
  );
};

export const useSystemSettings = () => {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error('useSystemSettings must be used within a SystemSettingsProvider');
  }
  return context;
}; 