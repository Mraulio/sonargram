import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem, Link } from '@mui/material';
import useAuth from '../hooks/useAuth';  // Importamos el hook useAuth

function Login() {
  const { t } = useTranslation();  // Hook para obtener las traducciones
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const { loginHandler, loading, error } = useAuth();  // Usamos el hook de auth

  const loginUserHandler = async () => {
    await loginHandler(loginEmail, loginPassword);  // Solo llamamos al loginHandler del hook
    // La redirección se maneja automáticamente en App según el token
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ width: '400px', height: '290px' }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            {t('login')}
          </Typography>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
             onKeyDown={(e) => {
              if (e.key === 'Enter') loginUserHandler();
            }}
          />
          <TextField
            label={t('password')}
            type="password"
            fullWidth
            margin="normal"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
             onKeyDown={(e) => {
                if (e.key === 'Enter') loginUserHandler();
              }}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={loginUserHandler}  // Usamos el handler aquí
            sx={{
              marginTop: '1rem',
              backgroundColor: '#fb4925',
              '&:hover': {
                backgroundColor: '#d63b1f', // un tono más oscuro opcional para el hover
              },
              color:'white'
            }}
          >
            {t('enter')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
