import { createTheme } from '@mui/material/styles';

const lightColorScheme = {
  primary: {
    main: '#5E5E5E',
    light: '#E2E2E2',
    dark: '#1B1B1B',
    contrastText: '#FFFFFF'
  },
  secondary: {
    main: '#5E5E5E',
    light: '#E2E2E2',
    dark: '#1B1B1B',
    contrastText: '#FFFFFF'
  },
  tertiary: {
    main: '#5E5E5E',
    light: '#E2E2E2',
    dark: '#1B1B1B',
    contrastText: '#FFFFFF'
  },
  error: {
    main: '#BA1A1A',
    light: '#FFDAD6',
    dark: '#410002',
    contrastText: '#FFFFFF'
  },
  background: {
    default: '#FFFFFF',
    paper: '#F9F9F9'
  },
  surface: {
    main: '#F9F9F9',
    dim: '#DADADA',
    bright: '#F9F9F9',
    containerLowest: '#FFFFFF',
    containerLow: '#F3F3F3',
    container: '#EEEEEE',
    containerHigh: '#E8E8E8',
    containerHighest: '#E2E2E2'
  },
  text: {
    primary: '#1B1B1B',
    secondary: '#474747'
  },
  divider: '#777777'
};

const darkColorScheme = {
  primary: {
    main: '#C6C6C6',
    light: '#E2E2E2',
    dark: '#303030',
    contrastText: '#1B1B1B'
  },
  secondary: {
    main: '#C6C6C6',
    light: '#E2E2E2',
    dark: '#303030',
    contrastText: '#1B1B1B'
  },
  tertiary: {
    main: '#C6C6C6',
    light: '#E2E2E2',
    dark: '#303030',
    contrastText: '#1B1B1B'
  },
  error: {
    main: '#FFB4AB',
    light: '#FFDAD6',
    dark: '#690005',
    contrastText: '#FFDAD6'
  },
  background: {
    default: '#131313',
    paper: '#1B1B1B'
  },
  surface: {
    main: '#131313',
    dim: '#131313',
    bright: '#393939',
    containerLowest: '#0E0E0E',
    containerLow: '#1B1B1B',
    container: '#1F1F1F',
    containerHigh: '#2A2A2A',
    containerHighest: '#353535'
  },
  text: {
    primary: '#E2E2E2',
    secondary: '#C6C6C6'
  },
  divider: '#919191'
};

export const lightTheme = createTheme({
  palette: lightColorScheme,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none'
        }
      }
    }
  }
});

export const darkTheme = createTheme({
  palette: darkColorScheme,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none'
        }
      }
    }
  }
});

export default lightTheme; 