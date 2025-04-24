import { useState, useContext } from 'react';
import { TextField, Button, Typography, Card, CardContent, Box, Divider } from '@mui/material';
import { UserContext } from '../context/UserContext';
import { jwtDecode } from 'jwt-decode';
import { loginUser } from '../api/internal/userApi';  // Importamos la función desde userApi
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; 
import { useTranslation } from 'react-i18next';
import { registerUser, getAllUsers } from '../api/internal/userApi'


function RegisterPage() {
    const { t } = useTranslation();  // Hook para obtener las traducciones
    const [users, setUsers] = useState([]);
    const [userName, setUserName] = useState('');
    const [userUsername, setUserUsername] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [lists, setLists] = useState([]);
    const [listName, setListName] = useState('');
    const [songs, setSongs] = useState('');
    const [creator, setCreator] = useState('');
    const { token, role, logout, login } = useContext(UserContext);
    const navigate = useNavigate();

     const createUser = async () => {
        try {
          const newUser = { name: userName, username: userUsername, email: userEmail, password: userPassword };
          const res = await registerUser(newUser); // Usamos la función registerUser
          setUsers([...users, res.data]);
          setUserName('');
          setUserUsername('');
          setUserEmail('');
          setUserPassword('');

           // Iniciar sesión automáticamente con el usuario recién creado
    const token = await loginUser(userEmail, userPassword); // Llamamos a la función loginUser
    const decodedToken = jwtDecode(token); // Decodificamos el token
    login(token, decodedToken.role, decodedToken); // Guardamos el token y los datos en el contexto

    // Redirigir al usuario a la página principal o dashboard
    navigate('/dashboard');
        } catch (err) {
          alert('Error creating user');
          console.error(err);
        }
      };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center', // Centra el contenido verticalmente
      backgroundImage: 'url("../images/imagen.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center', // Centra la imagen
      height: '100vh', // Ocupa toda la altura de la pantalla
      width: '100vw', // Ocupa todo el ancho de la pantalla
  }}>

<Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>{t('createUser')}</Typography>
            <TextField
              fullWidth
              label={t('name')}
              value={userName}
              onChange={e => setUserName(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label={t('username')}
              value={userUsername}
              onChange={e => setUserUsername(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label={t('email')}
              value={userEmail}
              onChange={e => setUserEmail(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              type="password"
              label={t('password')}
              value={userPassword}
              onChange={e => setUserPassword(e.target.value)}
              margin="normal"
            />
            <Button variant="contained" onClick={createUser} sx={{ mt: 2 }}>
              {t('createUserButton')}
            </Button>
            
          </CardContent>
        </Card>
        <Link to="/" style={{ textDecoration: 'none', color: 'blue' }}>Volver</Link> 
     
  </Box>
  );
}

export default RegisterPage;
