import { useState } from 'react';
import { TextField, Button, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import useAuth from '../hooks/useAuth';  // Importamos el hook useAuth

function LoginPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const { loginHandler, loading, error } = useAuth();  // Usamos el hook de auth

  const loginUserHandler = async () => {
    await loginHandler(loginEmail, loginPassword);  // Solo llamamos al loginHandler del hook
    // La redirección se maneja automáticamente en App según el token
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5rem' }}>
      <Card sx={{ maxWidth: 400 }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Login
          </Typography>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={loginUserHandler}
            sx={{ marginTop: '1rem' }}
            disabled={loading}  // Deshabilitamos el botón si está cargando
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}  {/* Muestra un spinner si está cargando */}
          </Button>

          {error && <Typography color="error" variant="body2">{error}</Typography>} {/* Muestra el error si ocurre */}
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
