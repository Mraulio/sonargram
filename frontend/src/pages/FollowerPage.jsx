import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Avatar, Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import useFollow from '../hooks/useFollow';
import useUser from '../hooks/useUser';
import Menu from '../components/Menu';


function FollowerPage() {
    const { t } = useTranslation();  // Hook para obtener las traducciones
    const { token } = useContext(UserContext);
    const { followers, fetchFollowers, following, fetchFollowing, follow, unfollow } = useFollow(token);
    const { getCurrentUser } = useUser(token);


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

    const handleFollow = async (followedId) => {
    try {
      await follow(followedId); // Llama a la función follow
      const user = await getCurrentUser()
      await fetchFollowers(user._id);
      await fetchFollowing(user._id);
      alert(t('userFollowed')); // Muestra un mensaje de éxito
        } catch (err) {
      console.error('Error following user:', err);
      alert(t('errorFollowingUser')); // Muestra un mensaje de error
        }
    };

    const isFollowing = (userId) => {
        return following.some(f => f.followed && f.followed._id === userId);
    };

    useEffect(() => {
    handleFetchFollowers();
  }, []);

    return(
        <Box>
            <Menu/>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('usersfollower')}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                    {followers.map(f => (
                        f.follower ? (
                        <Card key={f.follower._id} sx={{ width: '500px', p: 2, display: 'flex', alignItems: 'center' }}>
                        <Avatar
                            src={
                            f.follower.profilePic
                                ? `http://localhost:5000/uploads/${f.follower.profilePic}`
                                : '/default-avatar.png'
                            }
                            alt={f.follower.name}
                            sx={{ width: 56, height: 56, mr: 2 }}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" sx={{ mb: 1 }}>{f.follower.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{t('since')}: {new Date(f.createdAt).toLocaleDateString()}</Typography>
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
    );
}
    
export default FollowerPage;
