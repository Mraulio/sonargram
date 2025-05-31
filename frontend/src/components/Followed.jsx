import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Avatar, Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import useFollow from '../hooks/useFollow';
import useUser from '../hooks/useUser';


function Followed() {
    const navigate = useNavigate();
    const { t } = useTranslation();  // Hook para obtener las traducciones
    const { token } = useContext(UserContext);
    const { following, fetchFollowing, unfollow } = useFollow(token);
    const { getCurrentUser } = useUser(token);
    const [followedIds, setFollowedIds] = useState([]);
    const [updatedFollowing, setUpdatedFollowing] = useState([]);

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
        await fetchFollowing(user._id); // Llama a la función fetchFollowers con el ID del usuario actual
        } catch (err) {
        console.error('Error fetching followers:', err);
        }
    } 
  

    useEffect(() => {
    handleFetchFollowing();
    console.log('Following:', following); // Verifica que obtienes la lista de seguidores
  }, []);

    return(
            <Box sx={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 2, width: '45%' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('usersfollower')}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                    {following.map(f => (
                        f.followed ? (
                            <Card key={f.follower._id} sx={{ width: '500px', p: 2, display: 'flex', alignItems: 'center' }}>
                               <Avatar
                                  src={f.followed.profilePic ? `http://localhost:5000/uploads/${f.followed.profilePic}` : '/default-avatar.png'}
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
 
    );
}
    
export default Followed;
