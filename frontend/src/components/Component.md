# 組件文檔

## CardComp 卡片組件

### 用途
一個具有斜角標題設計的卡片組件，可用於展示各種內容。標題區域具有獨特的斜邊和圓弧過渡設計，支持明暗主題切換。

### 預設樣式
- 卡片尺寸：400 x 300
- 標題區域：左側 40% 寬度（最大350px）
- 標題高度：40px
- 內容區域：自動佔據剩餘空間
- 內邊距：2px

### 參數說明

| 參數名 | 類型 | 默認值 | 說明 |
|--------|------|--------|------|
| theme | string | 'light' | 主題設置，可選 'light' 或 'dark' |
| title | string | '卡片標題' | 標題文字 |
| width | number | 400 | 卡片寬度（像素） |
| height | number | 300 | 卡片高度（像素） |
| headerWidth | string/number | '40%' | 標題區域寬度，支持百分比或具體數值，最大350px |
| headerHeight | number | 40 | 標題區域高度（像素） |
| headerBgColor | string | - | 標題背景色，可選。未設置時使用主題默認色 |
| contentText | string | '這裡是卡片的內容區域' | 內容區域文字 |
| headerTextSize | string | 'h6' | 標題文字大小，使用 MUI Typography variant |
| contentTextSize | string | 'body2' | 內容文字大小，使用 MUI Typography variant |

### 使用示例
// 基本使用
<CardComp />

// 自定義樣式
<CardComp 
  width={500}
  height={400}
  headerWidth="50%"
  headerHeight={50}
  headerBgColor="secondary.main"
  title="自定義標題"
  contentText="自定義內容"
  headerTextSize="h5"
  contentTextSize="body1"
  theme="dark"
/>