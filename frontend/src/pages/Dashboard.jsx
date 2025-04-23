import { useEffect, useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import createApiClient from '../api/internal/apiClient';
import Menu from '../components/Menu';

function Dashboard() {
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
  const { token, role, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const apiClient = useMemo(() => createApiClient(token), [token]);

  // Obtener usuarios solo si es admin
  useEffect(() => {
    if(role === 'admin') {
      apiClient.get('/users')
        .then(res => setUsers(res.data))
        .catch(err => console.error(err));
    }
  }, [role, apiClient]);

  // Obtener listas
  useEffect(() => {
    apiClient.get('/lists')
      .then(res => setLists(res.data))
      .catch(err => console.error(err));
  }, [apiClient]);

  // Crear un usuario utilizando apiClient
  const createUser = async () => {
    try {
      const res = await apiClient.post('/users/register', {
        name: userName,
        username: userUsername,
        email: userEmail,
        password: userPassword
      });
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

  // Crear una lista utilizando apiClient
  const createList = async () => {
    try {
      const songArray = songs.split(',').map(s => s.trim());
      await apiClient.post('/lists', {
        name: listName,
        songs: songArray,
        creator
      });
      alert('List created');
      setListName('');
      setSongs('');
    } catch (err) {
      alert('Error creating list');
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
      <div>
        <Button variant="outlined" onClick={() => navigate('/profile')}>
            {t('goToProfile')}
        </Button>
      </div>
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
            <ul>
              {users.map(u => (
                <li key={u._id}>{u.name} ({u.email})</li>
              ))}
            </ul>
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
          <FormControl fullWidth margin="normal">
            <InputLabel>{t('creator')}</InputLabel>
            <Select
              value={creator}
              label={t('creator')}
              onChange={e => setCreator(e.target.value)}
            >
              <MenuItem value="">{t('selectCreator')}</MenuItem>
              {users.map(u => (
                <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={createList} sx={{ mt: 2 }}>
            {t('createListButton')}
          </Button>

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">{t('existingLists')}</Typography>
          <ul>
            {lists.map(l => (
              <li key={l._id}>{l.name}</li>
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

export default Dashboard;
