// 使用命名導出
export const colors = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    orange: '#FFA500'
  },
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2'
  }
};

// 如果還需要 useColors hook
export function useColors() {
  return colors;
} 