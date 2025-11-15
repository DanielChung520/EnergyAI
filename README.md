# influx-cli

CLI for managing resources in InfluxDB v2

## Motivation

This repository decouples the `influx` CLI from the OSS `influxdb` codebase. Our goals are to:
1. Make it easier to keep the CLI up-to-date with InfluxDB Cloud API changes
2. Enable faster turn-around on fixes/features that only affect the CLI
3. Allow the CLI to be built & released for a wider range of platforms than the server can support

## Building the CLI

Follow these steps to build the CLI. If you're updating your CLI build, see *Updating openapi* below.
1. Clone this repo (influx-cli) and change to your _influx-cli_ directory.

   ```
   git clone git@github.com:influxdata/influx-cli.git
   cd influx-cli
   ```
   
2. Build the CLI. The `make` and `make influx` commands write the new binary to `bin/$(GOOS)/influx`.
   
   ```
   make
   ```
   
### Updating openapi

If you change or update your branch, you may also need to update `influx-cli/openapi` and regenerate the client code.
`influx-cli/openapi` is a Git submodule that contains the underlying API contracts and client used by the CLI.
We use [`OpenAPITools/openapi-generator`](https://github.com/OpenAPITools/openapi-generator) to generate
the HTTP client.

To update, run the following commands in your `influx-cli` repo:

1. Update the _openapi_ Git submodule. The following command pulls the latest commits for the branch and all submodules.

   `git pull --recurse-submodules`
   
2. With [Docker](https://docs.docker.com/get-docker/) running locally, regenerate _openapi_.

   `make openapi`
   
3. Rebuild the CLI

   `make`
 
## Running the CLI

After building, use `influx -h` to see the list of available commands.

### Enabling Completions

The CLI supports generating completions for `bash`, `zsh`, and `powershell`. To enable completions for a
single shell session, run one of these commands:
```
# For bash:
source <(influx completion bash)
# For zsh:
source <(influx completion zsh)
# For pwsh:
Invoke-Expression ((influx completion powershell) -join "`n`")
```
To enable completions across sessions, add the appropriate line to your shell's login profile (i.e. `~/.bash_profile`).

## Testing

Run `make test` to run unit tests.

# InfluxDB 服務管理

## 啟動服務
1. 進入項目根目錄：
```bash
cd /home/daniel/project/EnergyAi
```

2. 執行啟動腳本：
```bash
./start-influxdb.sh
```

## 停止服務
```bash
sudo pkill influxd
```

## 服務信息
- Web 界面：http://125.229.37.248:8086
- 用戶名：admin
- 密碼：findaniel
- 組織：energy-ai
- Bucket：power-plant-data

## 數據位置
所有數據存儲在項目目錄的 influxdb/data 文件夾中

# Energy AI 系統安裝指南

## 一、目錄結構
energy-ai/
├── frontend/ # 前端專案目錄
│ ├── public/ # 靜態資源
│ │ ├── assets/ # 靜態資源文件
│ │ └── images/ # 圖片資源
│ │
│ ├── src/
│ │ ├── components/ # 共用元件
│ │ │ ├── Charts/ # 圖表相關組件
│ │ │ │ ├── BarLine.jsx
│ │ │ │ ├── StaticWindPowerChart.jsx
│ │ │ │ └── WindPowerChart.jsx
│ │ │ ├── Compass.jsx # 風向羅盤組件
│ │ │ ├── TemperatureComp.jsx # 溫度計組件
│ │ │ ├── WeatherComp.jsx # 天氣組件
│ │ │ └── WebPageViewer.jsx # 網頁嵌入組件
│ │ │
│ │ ├── contexts/ # Context API 相關
│ │ ├── pages/ # 頁面組件
│ │ ├── styles/ # 樣式文件
│ │ ├── utils/ # 工具函數
│ │ ├── App.jsx
│ │ └── main.jsx
│ │
│ ├── index.html
│ ├── package.json
│ └── vite.config.js
│
├── influxdb/ # InfluxDB 相關
│ ├── data/ # 數據存儲目錄
│ └── start-influxdb.sh # 啟動腳本
│
└── backend/ # 後端專案目錄（待開發）

## 三、環境配置

### 1. 系統要求
- Node.js >= 16.0.0
- npm >= 7.0.0
- InfluxDB >= 2.0

### 2. 環境變數
```env
# API 配置
VITE_API_URL=your_api_url
VITE_API_KEY=your_api_key

# InfluxDB 配置
INFLUXDB_URL=http://125.229.37.248:8086
INFLUXDB_ORG=energy-ai
INFLUXDB_BUCKET=power-plant-data
INFLUXDB_TOKEN=your_influxdb_token
```

## 四、安裝步驟

### 1. 安裝 InfluxDB
```bash
# 啟動 InfluxDB 服務
cd /path/to/project
./start-influxdb.sh
```

### 2. 前端專案設置
```bash
# 安裝依賴
cd frontend
npm install

# 核心依賴
npm install react react-dom @vitejs/plugin-react
npm install react-router-dom
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material react-icons
npm install echarts echarts-for-react
npm install axios moment lodash

# 開發依賴
npm install -D vite @vitejs/plugin-react
npm install -D eslint prettier
npm install -D vitest @testing-library/react

# 啟動開發服務器
npm run dev
```

## 五、開發工具配置

### 1. VS Code 擴展
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "dsznajder.es7-react-js-snippets",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### 2. ESLint 配置
```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'prettier'
  ]
}
```

## 六、注意事項

1. 確保 InfluxDB 服務正常運行
2. 檢查環境變數配置
3. 確保數據存儲目錄權限正確
4. 定期備份 InfluxDB 數據

## 七、常見問題處理

1. InfluxDB 服務無法啟動
   - 檢查端口 8086 是否被占用
   - 確認數據目錄權限
   - 查看服務日誌

2. 前端開發服務器問題
   - 清除 node_modules 並重新安裝
   - 檢查 Node.js 版本兼容性
   - 確認環境變數配置

## 八、技術支援

- Email: support@energyai.com
- 服務時間: 週一至週五 9:00-18:00

## License
© 2024 Energy AI System. All Rights Reserved.
