import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: 'white',
      secondary: '#f0f0f0',  // gris claro
      tertiary: '#fafafa'    // gris aún más claro
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: 'black',
      secondary: '#2c2c2c',  // gris oscuro
      tertiary: '#3a3a3a'    // algo más claro que secondary
    },
  },
});