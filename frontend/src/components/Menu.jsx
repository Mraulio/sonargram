import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem, Link } from '@mui/material';
import { ThemeContext } from '../context/ThemeContext';
import apiClient from '../api/internal/apiClient';


function Menu() {
  const { t } = useTranslation();  // Hook para obtener las traducciones
  const { token, role, logout } = useContext(UserContext);
  return (
    <Box sx={{ display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', width: '100%', p: 4, backgroundColor: 'primary.main', color: 'white'  }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', width: '100%', p: 4, backgroundColor: 'primary.main', color: 'white'  }}>
        <Link href="/dashboard" underline="hover" sx={{ display: 'block', mb: 1 }}><img src='assets/images/logo.png' alt="logo" style={{ width: 100, height: 100, borderRadius: '50%' }}/></Link>
        <Link href="songs" underline="hover" sx={{ display: 'block', mb: 1, color: 'white' }}>Canciones</Link>
        <Link href="/album" underline="hover" sx={{ display: 'block', mb: 1, color: 'white'}}>Álbumes</Link>
        <Link href="/artists" underline="hover" sx={{ display: 'block', mb: 1, color: 'white' }}>Artistas</Link>
        <Link href="/lists" underline="hover" sx={{ display: 'block', mb: 1, color: 'white' }}>Listas</Link>
        <Link href="/followers" underline="hover" sx={{ display: 'block', mb: 1, color: 'white' }}>Seguidores</Link>
        <Link href="/followed" underline="hover" sx={{ display: 'block', mb: 1, color: 'white' }}>Seguidos</Link>
        {role === 'admin' && <Link href="/admin" underline="hover" sx={{ display: 'block', mb: 1, color: 'red' }}>Admin</Link>}
        <Link href="/profile" underline="hover" sx={{ display: 'block', mb: 1, color: 'white' }}><img  src="/assets/images/avatar.jpg" alt="imagen perfil" style={{ width: 100, height: 100, borderRadius: '50%' }}/></Link>
        <Button variant="outlined" onClick={logout} sx={{ mt: 1, color: 'white', borderColor: 'white' }}>{t('logout')}</Button>
      </Box>
      <TextField label="buscar" variant="outlined" sx={{ width: '20%', mb: 2, color: 'white', borderColor:'white' }} />

    </Box>
  );
}

export default Menu;
