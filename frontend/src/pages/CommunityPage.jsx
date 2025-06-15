import { useEffect, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Avatar, Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Menu2 from '../components/Menu2';

import Followers from '../components/Followers';
import useUser from '../hooks/useUser';
import useFollow from '../hooks/useFollow';
import baseUrl from '../config.js';


function CommunityPage() {
  const { t } = useTranslation();  // Hook para obtener las traducciones
  const [userUsername, setUserUsername] = useState('');
  const { token, role, logout, user} = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { followers, follow, following, fetchFollowing, fetchFollowers, unfollow } = useFollow(token);
  const { users, fetchAllUsers, getCurrentUser } = useUser(token);
  const [searches, setSearches] = useState([]);

  

   
  useEffect(() => {
    fetchAllUsers(token);
    handleFetchFollowers();
    handleFetchFollowing();
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

  const handleFetchFollowers = async () => {
        try {
            const user = await getCurrentUser();
            if (!user) {
            console.error('No user ID found');
            return;
            }

            await fetchFollowers(user._id);
            await fetchFollowing(user._id); // también obtenemos a quién sigue
        } catch (err) {
            console.error('Error fetching followers:', err);
        }
    };

     const handleFetchFollowing = async () => {
    try {
        const user = await getCurrentUser()// Asegúrate de tener el ID del usuario actual
        if (!user) {
        console.error('No user ID found');
        return;
        }
        await fetchFollowing(user._id); // Llama a la función fetchFollowers con el ID del usuario actual

        } catch (err) {
        console.error('Error fetching followers:', err);
    }
    };

     const handleUnfollow = async (followedId) => {
      try {
        await unfollow(followedId);
        const user = await getCurrentUser()// Asegúrate de tener el ID del usuario actual
        if (!user) {
        console.error('No user ID found');
        return;
          }
        await fetchFollowers(user._id); // Llama a la función fetchFollowers con el ID del usuario actual
        await fetchFollowing(user._id);
        } catch (err) {
        console.error('Error fetching followers:', err);
        }
    } 



  return (

      <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap:'wrap', padding: 0, gap: 2, justifyContent: 'start', alignItems: 'center', width: '100vw' }}>
        <Menu2 />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '90vw' }}>
          <Box>
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
                margin="normal"/>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 2,}}>
              <Typography variant="h6">{t('searchResults')}</Typography>
                {loading ? (
                  <Typography>{t('loading')}</Typography>
                ) : error ? (
                  <Typography color="error">{error}</Typography>
                ) : searches.length > 0 ? (
                  <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 2}}>
                    {searches.map(user => (
                      <Card key={user._id} sx={{ width: '500px', p: 2, display: 'flex', alignItems: 'center' }} >
                        <Avatar
                          src={user.profilePic ? `${baseUrl}/uploads/${user.profilePic}` : '/default-avatar.png'}
                          alt={user.name}
                          sx={{ width: 56, height: 56, mr: 2 }}
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <Typography sx={{fontWeight: '400', fontSize: '28px' }}>{user.name}</Typography>
                        <Typography>@{user.username}</Typography>
                        </Box>
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
                      </Card>
                    ))}
                  </Box>
                ) : (
                <Typography>{t('noResults')}</Typography>
              )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 2, width: '45%' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('usersfollowed')}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                    {following.map(f => (
                        f.followed ? (
                            <Card key={f.follower._id} sx={{ width: '500px', p: 2, display: 'flex', alignItems: 'center' }}>
                               <Avatar
                                  src={f.followed.profilePic ? `${baseUrl}/uploads/${f.followed.profilePic}` : '/default-avatar.png'}
                                  alt={f.followed.name}
                                  sx={{ width: 56, height: 56, mr: 2 }}
                                />
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 1 }}>{f.followed.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">{t('since')}: {f.createdAt}</Typography>
                                    <Typography variant="body2" color="text.secondary">{t('bio')}: {f.followed.bio}</Typography>
                                </CardContent>
                                <Button
                                variant="outlined"
                                color="error"
                                onClick={() => handleUnfollow(f.followed._id)}
                                >
                                t{'Unfollow'}
                              </Button>
                            </Card>
                        ) : null
                    ))}
                </Box>
            </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', alignItems:'center', gap: 2, width: '45%' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('usersfollowers')}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                    {followers.map(f => (
                        f.follower ? (
                        <Card key={f.follower._id} sx={{ width: '500px', p: 2, display: 'flex', alignItems: 'center' }}>
                        <Avatar
                            src={
                            f.follower.profilePic
                                ? `${baseUrl}/uploads/${f.follower.profilePic}`
                                : '/default-avatar.png'
                            }
                            alt={f.follower.name}
                            sx={{ width: 56, height: 56, mr: 2 }}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" sx={{ mb: 1 }}>{f.follower.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{t('since')}: {new Date(f.createdAt).toLocaleDateString()}</Typography>
                            <Typography variant="body2" color="text.secondary">{t('bio')}: {f.follower.bio}</Typography>
                        </CardContent>
                        {isFollowing(f.follower._id) ? (
                            <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleUnfollow(f.follower._id)}
                            >
                            Unfollow
                            </Button>
                        ) : (
                            <Button
                            variant="contained"
                            onClick={() => handleFollow(f.follower._id)}
                            >
                            Follow
                            </Button>
                        )}
                        </Card>
                    ) : null
                    ))}
                </Box>
            </Box>
        </Box>
      </Box>

  );
}

export default CommunityPage;