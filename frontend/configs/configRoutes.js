const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'system.config.json');

// 檢查文件權限並初始化
async function initializeConfig() {
  try {
    // 檢查文件是否存在
    try {
      await fs.access(CONFIG_PATH);
    } catch {
      // 如果文件不存在，創建默認配置文件
      const defaultConfig = require('../src/config/systemSettings').systemSettingsConfig;
      await fs.writeFile(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
    }

    // 設置文件權限
    // 644 表示: 擁有者可讀寫，群組和其他用戶只能讀
    await fs.chmod(CONFIG_PATH, 0o644);
    
    console.log('配置文件初始化成功');
  } catch (error) {
    console.error('配置文件初始化失敗:', error);
  }
}

// 中間件：檢查訪問權限
const checkPermission = (req, res, next) => {
  // 這裡可以添加用戶認證檢查
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: '沒有權限訪問配置' });
  }
  next();
};

// 初始化配置文件
initializeConfig();

// 讀取配置
router.get('/api/system/config', async (req, res) => {
  try {
    const config = await fs.readFile(CONFIG_PATH, 'utf8');
    res.json(JSON.parse(config));
  } catch (error) {
    // 如果文件不存在，返回默認配置
    if (error.code === 'ENOENT') {
      const { systemSettingsConfig } = require('../src/config/systemSettings');
      const defaultConfig = {};
      Object.keys(systemSettingsConfig).forEach(category => {
        defaultConfig[category] = {};
        systemSettingsConfig[category].items.forEach(item => {
          defaultConfig[category][item.id] = item.defaultValue;
        });
      });
      
      // 寫入默認配置
      await fs.writeFile(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
      res.json(defaultConfig);
    } else {
      res.status(500).json({ error: '無法讀取配置文件' });
    }
  }
});

// 更新配置
router.post('/api/system/config/update', async (req, res) => {
  try {
    const { key, value } = req.body;
    
    // 讀取當前配置
    let config = {};
    try {
      const configStr = await fs.readFile(CONFIG_PATH, 'utf8');
      config = JSON.parse(configStr);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // 如果文件不存在，使用空對象
    }
    
    // 解析鍵值路徑並更新配置
    const keys = key.split('.');
    let current = config;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    // 寫入文件
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
    
    res.json({ success: true });
  } catch (error) {
    console.error('更新配置失敗:', error);
    res.status(500).json({ error: '更新配置失敗' });
  }
});

module.exports = router; 