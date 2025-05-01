import { useEffect, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Menu from '../components/Menu';
import { getAllUsers } from '../api/internal/userApi'
import useList from '../hooks/useList';

function Dashboard() {
  const { t } = useTranslation();  // Hook para obtener las traducciones
  const [users, setUsers] = useState([]);
  const [userUsername, setUserUsername] = useState('');
  const [listName, setListName] = useState('');
  const [songs, setSongs] = useState('');
  const { token, role, logout, user} = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
        lists,
        fetchAllLists,
        createNewList,
        removeList,
      } = useList(token);
    
          
    useEffect(() => {
      if (token) fetchAllLists();
    }, [token, fetchAllLists]);
  // Crear una lista utilizando la función de userApi
  const handleCreateList = async () => {
    try {
      const songArray = songs
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '')
        .map(id => ({ musicbrainzId: id }));

      await createNewList({ name: listName, songs: songArray });

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
      await removeList(listId);
    } catch (err) {
      alert(t('errorDeletingList'));
      console.error(err);
    }
  };

  const handleSearchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Obtén todos los usuarios
      const data = await getAllUsers(token);

      // Verifica que userUsername no sea undefined o vacío
  
      // Filtra los usuarios cuyo username contenga el texto ingresado
      const filteredUsers = data.filter(user =>
        user.username.toLowerCase().includes(userUsername.toLowerCase())
      );
  
      setUsers(filteredUsers); // Actualiza el estado con los usuarios filtrados
      console.log('Filtered users:', filteredUsers); // Agrega esta línea para depurar
    } catch (err) {
      setError(err.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  }, [token, userUsername]);



  return (
    <Box sx={{ backgroundColor: '#f0f0f0', minHeight: '100vh', width: '100vw' }}>
    <Menu></Menu>
    <Box sx={{ p: 4, fontFamily: 'sans-serif', maxWidth: 600, mx: 'auto' }}>
      
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
      
      <Card>
  <CardContent>
    <Typography variant="h5">{t('findUsers')}</Typography>
    <TextField
      fullWidth
      label={t('userName')}
      onChange={e => setUserUsername(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          handleSearchUser();
        }
      }}
      margin="normal"
    />
  </CardContent>
</Card>

{/* Mostrar los usuarios obtenidos */}
<Card>
  <CardContent>
    <Typography variant="h6">{t('searchResults')}</Typography>
    {loading ? (
      <Typography>{t('loading')}</Typography>) : error ? (<Typography color="error">{error}</Typography>) : users.length > 0 ? (
      <ul>
        {users.map(user => (
          <li key={user._id}>
            {user.name} ({user.username})
          </li>
        ))}
      </ul>
    ) : (
      <Typography>{t('noResults')}</Typography>
    )}
  </CardContent>
</Card>

<Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>{t('createList')}</Typography>
                <TextField fullWidth label={t('listName')} value={listName} onChange={e => setListName(e.target.value)} margin="normal" />
                <TextField fullWidth label={t('songIds')} value={songs} onChange={e => setSongs(e.target.value)} margin="normal" />
                <Button variant="contained" onClick={handleCreateList} sx={{ mt: 2 }}>
                {t('createListButton')}
                </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default Dashboard;
