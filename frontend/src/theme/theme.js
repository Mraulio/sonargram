import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: 'white',
      secondary: '#f0f0f0', // definido aquí también
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: 'black',
      secondary: '#2c2c2c', // definido también aquí para consistencia
    },
  },
});