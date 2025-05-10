import { useEffect, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Menu from '../components/Menu';
import { getAllUsers } from '../api/internal/userApi'
import useUser from '../hooks/useUser';
import useFollow from '../hooks/useFollow';

function Dashboard() {
  const { t } = useTranslation();  // Hook para obtener las traducciones
  const [users, setUsers] = useState([]);
  const [userUsername, setUserUsername] = useState('');
  const { token, role, logout, user} = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { follower, follow, fetchFollowing } = useFollow(token);
  const { getCurrentUser, fetchAllUsers } = useUser(token);
  const [followedIds, setFollowedIds] = useState([]);
 

  const handleSearchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Obtén todos los usuarios
      const data = await getAllUsers(token);
      const currentUser = await getCurrentUser(token); // Obtiene el usuario actual

      // Verifica que userUsername no sea undefined o vacío
  
      // Filtra los usuarios cuyo username contenga el texto ingresado
      const filteredUsers = data.filter(user =>
       user._id !== currentUser._id &&
      user.username.toLowerCase().includes(userUsername.toLowerCase())
    );
  
      setUsers(filteredUsers); // Actualiza el estado con los usuarios filtrados

      const followingList = await fetchFollowing(currentUser._id); // Obtiene la lista de usuarios seguidos por el usuario actual
      const followedIds = followingList.map(f => f.followed._id); // Extrae los IDs de los usuarios seguidos
      setFollowedIds(followedIds); // Guardar en estado

    } catch (err) {
      setError(err.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  }, [token, userUsername]);

  const handleFollow = async (followedId) => {
    try {
      await follow(followedId); // Llama a la función `follow`
      setFollowedIds(prev => [...prev, followedId]);
      alert(t('userFollowed')); // Muestra un mensaje de éxito
    } catch (err) {
      console.error('Error following user:', err);
      alert(t('errorFollowingUser')); // Muestra un mensaje de error
    }
  };


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
              <Typography>{t('loading')}</Typography>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : users.length > 0 ? (
              <ul>
                {users.map(user => (
                  <li key={user._id}>
                    {user.name} ({user.username})
                    {followedIds.includes(user._id) ? (
                      <Typography sx={{ ml: 2, color: 'green', display: 'inline-block' }}>
                        {t('following')}
                      </Typography>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleFollow(user._id)}
                        sx={{ ml: 2 }}
                      >
                        {t('follow')}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <Typography>{t('noResults')}</Typography>
            )}
          </CardContent>
        </Card>

      </Box>
    </Box>
  );
}

export default Dashboard;
