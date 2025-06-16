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
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw' }}>
      
      <Card sx={{ display:'flex', flexDirection: 'column', justifyContent:'center', alignItems:'center', width: '400px', height: "660px", gap: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent:'center', alignItems:'center', gap:1}}>
          <img src="/assets/images/logo.svg" style={{width: '100px', height: '100px' }}/>
          <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: '1.5rem',}}>Sonargram</Typography>
        </Box>
        <Typography variant="subtitle1" gutterBottom>{t('createUser')}</Typography>
        <TextField
          sx={{ width:'300px'}}
          label={t('name')}
          value={userName}
          onChange={e => setUserName(e.target.value)}
          margin="normal"
        />
        <TextField
          sx={{ width:'300px'}}
          label={t('username')}
          value={userUsername}
          onChange={e => setUserUsername(e.target.value)}
          margin="normal"
        />
        <TextField
          sx={{ width:'300px'}}
          label={t('email')}
          value={userEmail}
          onChange={e => setUserEmail(e.target.value)}
          margin="normal"
        />
        <TextField
          sx={{ width:'300px'}}
          type="password"
          label={t('password')}
          value={userPassword}
          onChange={e => setUserPassword(e.target.value)}
          margin="normal"
        />
        <Button variant="contained" onClick={createUser} sx={{ mt: 2, width:'300px', backgroundColor: '#d63b1f'}}>
          {t('createUserButton')}
        </Button>
        <Link to="/" style={{ textDecoration: 'none'}}>Volver</Link> 
     </Card>
  </Box>
  );
}

export default RegisterPage;
