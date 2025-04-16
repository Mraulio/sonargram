import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ThemeContext } from '../context/ThemeContext';
import apiClient from '../api/apiClient';

function Menu() {
  const { t } = useTranslation();  // Hook para obtener las traducciones
 
  return (
    <Box sx={{ p: 4, fontFamily: 'sans-serif', maxWidth: 600, mx: 'auto' }}>
        Menu
        Cambios
    </Box>
  );
}

export default Menu;
