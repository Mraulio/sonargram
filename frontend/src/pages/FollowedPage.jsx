import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import useFollow from '../hooks/useFollow';
import useUser from '../hooks/useUser';
import Menu from '../components/Menu';


function FollowedPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();  // Hook para obtener las traducciones
    const { token } = useContext(UserContext);
    const {  fetchFollowing } = useFollow(token);
    const { getCurrentUser } = useUser(token);
    const [followedList, setFollowedList] = useState([]);

    const handleFetchFollowers = async () => {
    try {
        const user = await getCurrentUser()// Asegúrate de tener el ID del usuario actual
        if (!user) {
        console.error('No user ID found');
        return;
        }
        console.log('Current user ID:', user._id); // Verifica que obtienes el ID del usuario actual
        const followedList = await fetchFollowing(user._id); // Llama a la función fetchFollowers con el ID del usuario actual
        console.log(followedList);
        setFollowedList(followedList); // Actualiza el estado con la lista de seguidores

        } catch (err) {
        console.error('Error fetching followers:', err);
    }
    };

    useEffect(() => {
    handleFetchFollowers();
  }, []);

    return(
        <Box>
            <Menu/>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('usersFollowed')}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                    {followedList.map(f => (
                        f.followed ? (
                            <Card key={f.followed._id} sx={{ width: '500px', p: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 1 }}>{f.followed.name}</Typography>
                                </CardContent>
                            </Card>
                        ) : null
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
    
export default FollowedPage;
