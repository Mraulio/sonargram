import { useState, useContext } from 'react';
import { TextField, Button, Typography, Card, CardContent } from '@mui/material';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function LoginPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  
    const loginUser = async () => {
      try {
        const res = await axios.post('http://localhost:5000/api/users/login', {
          email: loginEmail,
          password: loginPassword
        });
  
        const { token } = res.data;
        const decodedToken = jwtDecode(token);
        login(token, decodedToken.role);
        //alert(`Logged in successfully. Role: ${decodedToken.role}`);
      } catch (err) {
        alert('Error logging in');
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
