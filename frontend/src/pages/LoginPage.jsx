import { useState, useContext } from 'react';
import { TextField, Button, Typography, Card, CardContent } from '@mui/material';
import { UserContext } from '../context/UserContext';
import { jwtDecode } from 'jwt-decode';
import createApiClient from '../api/internal/apiClient';

function LoginPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const { login } = useContext(UserContext);

  const apiClient = createApiClient(); // sin token por ahora

  const loginUser = async () => {
    try {
      const res = await apiClient.post('/users/login', {
        email: loginEmail,
        password: loginPassword,
      });

      const { token } = res.data;
      const decodedToken = jwtDecode(token);
      
      login(token, decodedToken.role); // esto probablemente lo guarda en contexto/localStorage

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
            onClick={loginUser}
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
