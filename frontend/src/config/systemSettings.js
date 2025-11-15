export const systemSettingsConfig = {
  domainManagement: {
    title: '網域管理',
    editable: false,
    items: [
      { id: 'domain', label: '網域', defaultValue: 'eai.bioengy.com', type: 'text' },
      { id: 'frontendPort', label: '前端服務端口', defaultValue: '8082', type: 'number' },
      { id: 'backendPort', label: '後端服務端口', defaultValue: '5500', type: 'number' }
    ]
  },
  defaultSettings: {
    title: '默認設置',
    editable: true,
    items: [
      {
        id: 'theme',
        label: '系統主題',
        type: 'radio',
        defaultValue: 'system',
        options: [
          { value: 'dark', label: '深色' },
          { value: 'light', label: '淺色' },
          { value: 'system', label: '跟隨系統' }
        ]
      },
      {
        id: 'fontSize',
        label: '默認標準字體',
        type: 'slider',
        defaultValue: 16,
        min: 12,
        max: 24,
        step: 1
      },
      {
        id: 'language',
        label: '默認語言',
        type: 'select',
        defaultValue: 'zh-TW',
        options: [
          { value: 'zh-TW', label: '繁體中文' },
          { value: 'zh-CN', label: '簡體中文' },
          { value: 'en', label: '英文' }
        ]
      }
    ]
  },
  operationSettings: {
    title: '系統維運基礎設置',
    editable: true,
    items: [
      {
        id: 'fitPrice',
        label: 'Fit 電價',
        type: 'price',
        defaultValue: '',
        currency: 'TWD'
      },
      {
        id: 'carbonIndex',
        label: '碳排指數',
        type: 'number',
        defaultValue: '',
        unit: 'kg/kwh'
      }
    ]
  }
}; 