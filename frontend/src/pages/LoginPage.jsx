import { useState, useContext } from 'react';
import { TextField, Button, Typography, Card, CardContent, Box } from '@mui/material';
import { UserContext } from '../context/UserContext';
import { jwtDecode } from 'jwt-decode';
import { loginUser, getUserByEmail } from '../api/internal/userApi';  // Importamos la función desde userApi
import Login from '../components/Login';  // Importamos el componente Login
import { Link } from 'react-router-dom';
import imagen from '../images/imagen.jpg';  // Importamos la imagen de fondo
function LoginPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const { login } = useContext(UserContext);

  const loginUserHandler = async () => {
    try {
      const token = await loginUser(loginEmail, loginPassword); // Llamamos a la función desde userApi

      const decodedToken = jwtDecode(token);  // Decodificamos el token
      const userData = await getUserByEmail(loginEmail, token); // Obtenemos los datos del usuario desde el backend
      login(token, decodedToken.role, userData);  // Guardamos el token y el rol en el contexto

    } catch (err) {
      alert('Error logging in');
      console.error(err);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center', // Centra el contenido verticalmente
      backgroundImage: {imagen},
      backgroundSize: 'cover',
      backgroundPosition: 'center', // Centra la imagen
      height: '100vh', // Ocupa toda la altura de la pantalla
      width: '100vw', // Ocupa todo el ancho de la pantalla
  }}>
    <Login />  {/* Usamos el componente Login aquí */}

      <Typography variant="body2" sx={{ mt: 2, color: 'black' }}>
        No tienes cuenta? <Link to="/register" style={{ textDecoration: 'none', color: 'blue' }}>Regístrate aquí</Link> 
      </Typography>
  </Box>
  );
}

export default LoginPage;
