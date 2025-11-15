import { createTheme } from '@mui/material/styles';

const lightColorScheme = {
  primary: {
    main: '#3F6836',
    light: '#BFEFB1',
    dark: '#002201',
    contrastText: '#FFFFFF'
  },
  secondary: {
    main: '#53634E',
    light: '#D7E8CD',
    dark: '#121F0E',
    contrastText: '#FFFFFF'
  },
  tertiary: {
    main: '#386569',
    light: '#BCEBEF',
    dark: '#002022',
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
    paper: '#F8FBF1'
  },
  surface: {
    main: '#F8FBF1',
    dim: '#D8DBD2',
    bright: '#F8FBF1',
    containerLowest: '#FFFFFF',
    containerLow: '#F2F5EB',
    container: '#ECEFE5',
    containerHigh: '#E6E9E0',
    containerHighest: '#E1E4DA'
  },
  text: {
    primary: '#191D17',
    secondary: '#43483F'
  },
  divider: '#73796E'
};

const darkColorScheme = {
  primary: {
    main: '#A4D396',
    light: '#BFEFB1',
    dark: '#10380C',
    contrastText: '#002201'
  },
  secondary: {
    main: '#BBCBB2',
    light: '#D7E8CD',
    dark: '#263422',
    contrastText: '#121F0E'
  },
  tertiary: {
    main: '#A0CFD2',
    light: '#BCEBEF',
    dark: '#00373A',
    contrastText: '#002022'
  },
  error: {
    main: '#FFB4AB',
    light: '#FFDAD6',
    dark: '#690005',
    contrastText: '#FFDAD6'
  },
  background: {
    default: '#11140F',
    paper: '#191D17'
  },
  surface: {
    main: '#11140F',
    dim: '#11140F',
    bright: '#363A34',
    containerLowest: '#0B0F0A',
    containerLow: '#191D17',
    container: '#1D211B',
    containerHigh: '#272B25',
    containerHighest: '#32362F'
  },
  text: {
    primary: '#E1E4DA',
    secondary: '#C3C8BC'
  },
  divider: '#8D9387'
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