import { createContext, useContext, useState } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme as blueLightTheme, darkTheme as blueDarkTheme } from '../styles/blue_theme';
import { lightTheme as greenLightTheme, darkTheme as greenDarkTheme } from '../styles/green_theme';
import { lightTheme as greyLightTheme, darkTheme as greyDarkTheme } from '../styles/grey_theme';

const ThemeContext = createContext();

const themes = {
  blue: {
    light: blueLightTheme,
    dark: blueDarkTheme
  },
  green: {
    light: greenLightTheme,
    dark: greenDarkTheme
  },
  grey: {
    light: greyLightTheme,
    dark: greyDarkTheme
  }
};

export const CustomThemeProvider = ({ children }) => {
  const [themeColor, setThemeColor] = useState('blue'); // 保持 blue 為默認
  const [mode, setMode] = useState('light');

  const currentTheme = themes[themeColor][mode];

  // 切換主題顏色
  const changeThemeColor = (color) => {
    if (themes[color]) {
      setThemeColor(color);
    }
  };

  // 切換明暗模式
  const toggleMode = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ 
      themeColor, 
      mode, 
      changeThemeColor, 
      toggleMode,
      // 添加一些有用的主題信息
      isDarkMode: mode === 'dark',
      theme: currentTheme
    }}>
      <MuiThemeProvider theme={currentTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// 自定義 Hook 用於訪問主題上下文
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a CustomThemeProvider');
  }
  return context;
}; 