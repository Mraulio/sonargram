import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Box, Typography, Card, CardContent, Button, TextField, Divider } from '@mui/material';
import Menu from '../components/Menu';
import { registerUser, getAllUsers } from '../api/internal/userApi'

import { getAllLists, createList, deleteList } from '../api/internal/listApi'; 


function Test() {
  const { t } = useTranslation();  // Hook para obtener las traducciones
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState('');
  const [songs, setSongs] = useState('');
  const { token, role, logout } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    getAllUsers(token) // Usamos la función getAllUsers de userApi
      .then(data => setUsers(data))
      .catch(err => console.error(err));    
  }, [role, token]);

  // Obtener listas
  useEffect(() => {
    if (token) {
      getAllLists(token) // Usamos la función getAllLists de userApi
        .then(data => setLists(data))
        .catch(err => console.error(err));
    }
  }, [token]);

  // Crear un usuario utilizando la función de userApi
  const createUser = async () => {
    try {
      const newUser = { name: userName, username: userUsername, email: userEmail, password: userPassword };
      const res = await registerUser(newUser); // Usamos la función registerUser
      setUsers([...users, res.data]);
      setUserName('');
      setUserUsername('');
      setUserEmail('');
      setUserPassword('');
    } catch (err) {
      alert('Error creating user');
      console.error(err);
    }
  };

  // Crear una lista utilizando la función de userApi
  const createNewList = async () => {
    try {
      const songArray = songs
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '')
        .map(id => ({ musicbrainzId: id }));
  
      const newList = await createList({ name: listName, songs: songArray }, token);
      
      // Agregar al estado local
      setLists([...lists, newList]);
  
      alert('List created');
      setListName('');
      setSongs('');
    } catch (err) {
      alert('Error creating list');
      console.error(err);
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm(t('confirmDeleteList'))) return;
  
    try {
      await deleteList(listId, token);
      setLists(prev => prev.filter(l => l._id !== listId));
    } catch (err) {
      alert(t('errorDeletingList'));
      console.error(err);
    }
  };
  
  

  return (
    <Box sx={{ p: 4, fontFamily: 'sans-serif', maxWidth: 600, mx: 'auto' }}>
      <Menu></Menu>
      {/* Estado de sesión */}
      <Card sx={{ mb: 4, backgroundColor: token ? '#e8f5e9' : '#ffebee', border: '1px solid', borderColor: token ? 'green' : 'red' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: token ? 'green' : 'red' }}>
            {token ? t('userLoggedIn', { role }) : t('noUserLoggedIn')}
          </Typography>
          {token && (
            <Button variant="outlined" onClick={logout} sx={{ mt: 1 }}>
              {t('logout')}
            </Button>
          )}
        </CardContent>
      </Card>     
      
      <div>
        <Button variant="outlined" onClick={() => navigate('/profile')}>
            {t('goToProfile')}
        </Button>
      </div>

      {role === 'admin' && (
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
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">{t('existingUsers')}</Typography>
            
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>{t('createList')}</Typography>
          <TextField
            fullWidth
            label={t('listName')}
            value={listName}
            onChange={e => setListName(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label={t('songIds')}
            value={songs}
            onChange={e => setSongs(e.target.value)}
            margin="normal"
          />          
          <Button variant="contained" onClick={createNewList} sx={{ mt: 2 }}>
            {t('createListButton')}
          </Button>

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">{t('existingLists')}</Typography>
          <ul>
            {lists.map(l => (
              <li key={l._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{l.name}</span>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleDeleteList(l._id)}
                  sx={{ ml: 2 }}
                >
                  {t('delete')}
                </Button>
              </li>
            ))}
        </ul>

        </CardContent>
      </Card>

      {token && (
        <Typography sx={{ mt: 4 }} fontSize="small" color="text.secondary">
          {t('tokenLabel')}: {token}
        </Typography>
      )}
    </Box>
  );
}

export default Test;
