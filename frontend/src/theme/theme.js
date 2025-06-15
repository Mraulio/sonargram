import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: 'white', 
    },

  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: 'black',
    },
    
  },
});
