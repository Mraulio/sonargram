import { useState, useContext } from 'react';
import { TextField, Button, Typography, Card, CardContent } from '@mui/material';
import { UserContext } from '../context/UserContext';
import { jwtDecode } from 'jwt-decode';
import { loginUser } from '../api/internal/userApi';  // Importamos la función desde userApi

function LoginPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const { login } = useContext(UserContext);

  const loginUserHandler = async () => {
    try {
      const token = await loginUser(loginEmail, loginPassword); // Llamamos a la función desde userApi

      const decodedToken = jwtDecode(token);  // Decodificamos el token
      login(token, decodedToken.role);  // Guardamos el token y el rol en el contexto

    } catch (err) {
      alert('Error logging in');
      console.error(err);
    }
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
            onClick={loginUserHandler}  // Usamos el handler aquí
            sx={{ marginTop: '1rem' }}
          >
            Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
