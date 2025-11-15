# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


# 能源 AI 智慧管理系統

基於 React + Vite 開發的新一代能源管理系統，專注於風力發電、智慧能源管理與碳資產交易。

## 系統特色

### 1. 風力發電即時監控
- 即時監測風機運行狀態
- 風向、風速即時數據展示
- 發電量實時統計與展示
- 多時段數據分析（分鐘、小時、天、月）

### 2. 智慧數據分析
- 發電效能即時分析
- 風機/併網發電量對比
- 累計發電量統計
- 收益與減碳效益計算

### 3. 環境效益追蹤
- 碳排放減量計算
- 環境效益可視化
- 即時天氣資訊整合
- Ventusky 氣象地圖整合

## 技術架構

### 前端技術棧
- React 18
- Vite
- Material-UI (MUI)
- ECharts
- Axios

### 主要依賴
```bash
# 核心依賴
npm install react react-dom
npm install @vitejs/plugin-react

# UI 框架
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material

# 圖表
npm install echarts

# 網路請求
npm install axios

# 路由
npm install react-router-dom
```

## 項目結構

frontend/README.md
frontend/
├── public/
│ └── assets/
│ └── images/
├── src/
│ ├── components/ # 共用元件
│ │ ├── PageContainer.jsx
│ │ ├── ProfileDialog.jsx
│ │ ├── ChangePasswordDialog.jsx
│ │ └── ProtectedRoute.jsx
│ │
│ ├── contexts/ # Context API 相關
│ │ ├── AuthContext.jsx
│ │ └── SystemSettingsContext.jsx
│ │
│ ├── pages/ # 頁面元件
│ │ ├── Dashboard.jsx # 主要儀表板頁面
│ │ ├── Login.jsx
│ │ ├── site/ # 案場管理相關頁面
│ │ │ └── SiteManagement.jsx
│ │ └── system/ # 系統設定相關頁面
│ │ └── BasicSettings.jsx
│ │
│ ├── styles/ # 樣式文件
│ │ ├── Dashboard.module.css
│ │ └── App.css
│ │
│ ├── App.jsx # 應用程式主入口
│ └── main.jsx # React 渲染入口
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 系統配置與初始化

### 配置文件結構
```bash
# 核心依賴
npm install react react-dom
npm install @vitejs/plugin-react

# UI 框架
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material

# 圖表
npm install echarts

# 網路請求
npm install axios

# 路由
npm install react-router-dom