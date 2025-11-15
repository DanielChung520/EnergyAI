const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

// 配置文件路徑
const CONFIG_PATHS = {
  settings: path.join(__dirname, 'systemSettings.js'),
  config: path.join(__dirname, 'system.config.json'),
  backup: path.join(__dirname, 'backups'),
  log: path.join(__dirname, 'config.log')
};

// 交互式命令行
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function initializeSystem() {
  try {
    console.log('開始系統初始化...');

    // 1. 讀取默認配置
    const { systemSettingsConfig } = require('../src/config/systemSettings');
    
    // 2. 交互式配置主要參數
    const config = await promptForConfiguration(systemSettingsConfig);
    
    // 3. 創建必要的目錄
    await createDirectories();
    
    // 4. 寫入配置文件
    await writeConfigurations(config);
    
    // 5. 設置文件權限
    await setFilePermissions();

    console.log('系統初始化完成！');
    
  } catch (error) {
    console.error('初始化失敗:', error);
  } finally {
    rl.close();
  }
}

// 交互式配置
async function promptForConfiguration(defaultConfig) {
  const config = { ...defaultConfig };
  
  console.log('\n請設置基本配置項：');
  
  // 網域設置
  config.domainManagement.domain = await prompt('請輸入網域 (默認: eai.bioengy.com): ') 
    || 'eai.bioengy.com';
  config.domainManagement.frontendPort = await prompt('請輸入前端端口 (默認: 8082): ') 
    || '8082';
  config.domainManagement.backendPort = await prompt('請輸入後端端口 (默認: 5500): ') 
    || '5500';
  
  // 系統設置
  const theme = await prompt('請選擇系統主題 (dark/light/system): ') || 'system';
  config.defaultSettings.theme = theme;
  
  // 其他設置...
  
  return config;
}

// 創建必要的目錄
async function createDirectories() {
  await fs.mkdir(CONFIG_PATHS.backup, { recursive: true });
  console.log('創建備份目錄成功');
}

// 寫入配置文件
async function writeConfigurations(config) {
  await fs.writeFile(
    CONFIG_PATHS.config,
    JSON.stringify(config, null, 2)
  );
  console.log('寫入配置文件成功');
}

// 設置文件權限
async function setFilePermissions() {
  // 設置配置文件權限
  await fs.chmod(CONFIG_PATHS.config, 0o644);
  await fs.chmod(CONFIG_PATHS.backup, 0o755);
  console.log('設置文件權限成功');
}

// Promise 封裝的提示輸入
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// 導出初始化函數
module.exports = {
  initializeSystem
}; 