import { useEffect, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Avatar, Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Menu from '../components/Menu';
import { getAllUsers } from '../api/internal/userApi'
import useUser from '../hooks/useUser';
import useFollow from '../hooks/useFollow';

function Dashboard() {
  const { t } = useTranslation();  // Hook para obtener las traducciones
  const [userUsername, setUserUsername] = useState('');
  const { token, role, logout, user} = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { follower, follow, following, fetchFollowing } = useFollow(token);
  const { users, fetchAllUsers, getCurrentUser } = useUser(token);
  const [searches, setSearches] = useState([]);
   
  useEffect(() => {
    fetchAllUsers(token);
    
  }, []);

  const handleSearchUser = async () => {
    try {
      const user = await getCurrentUser();
      await fetchFollowing(user._id);
      if (users.length > 0) {
      const filtered = users
        .filter(u => u._id !== user._id)
        .filter(u => u.username.toLowerCase().includes(userUsername.toLowerCase()));
        setSearches(filtered);
      };
    } catch (err) {
      setError(err.message || 'Error fetching users');
    }
  };

  const isFollowing = useCallback((userId) => {
    return following.some(f => f.followed && f.followed._id === userId);
  }, [following]);
  
 

  const handleFollow = async (followedId) => {
    try {
      await follow(followedId); // Llama a la función follow
      const user = await getCurrentUser()
      await fetchFollowing(user._id);
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
            ) : searches.length > 0 ? (
              <ul>
                {searches.map(user => (
                  <li key={user._id}>
                    <Avatar
                      src={user.profilePic ? `http://localhost:5000/uploads/${user.profilePic}` : '/default-avatar.png'}
                       alt={user.name}
                       sx={{ width: 56, height: 56, mr: 2 }}
                    />
                    {user.name} ({user.username})
                    {isFollowing(user._id) ? (
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