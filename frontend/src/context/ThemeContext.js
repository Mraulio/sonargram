// src/context/ThemeContext.jsx
import { createContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme } from '../theme/theme';

export const ThemeContext = createContext();

export const ThemeProviderCustom = ({ children }) => {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) setMode(savedMode);
  }, []);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
