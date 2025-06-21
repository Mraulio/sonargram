import { useEffect, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext.js';
import { Avatar, Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem, useTheme, styled } from '@mui/material';
import Menu from '../components/Menu.jsx';
import Followers from '../components/Followers.jsx';
import useUser from '../hooks/useUser.js';
import useFollow from '../hooks/useFollow.js';
import baseUrl from '../config.js';
import TopRatingsList from '../components/TopRatingsList.jsx';
import TopFavoritosList from '../components/TopFavoritosList.jsx'

const TopBox= styled(Box)`
   display: flex; 
   gap: 10px;  
   justify-content: center; 
   align-items: center; 
   width: 100%;
    @media (max-width: 920px) {
    flex-direction: column; 
    gap: 20px;
  }
`;
function TopsPage() {
  const { t } = useTranslation();  // Hook para obtener las traducciones
  const [userUsername, setUserUsername] = useState('');
  const { token, role, logout, user} = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { followers, follow, following, fetchFollowing, fetchFollowers, unfollow } = useFollow(token);
  const { users, fetchAllUsers, getCurrentUser } = useUser(token);
  const [searches, setSearches] = useState([]);
  const theme = useTheme();
   
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

      <Box sx={{ display: 'flex', flexDirection: 'column', padding: 0, gap: 2, minHeight:'100vh', width: '100%', backgroundColor: theme.palette.background.secondary }}>
        <Menu />
       
        <TopBox>    
          <TopRatingsList limit={5} title={t('topRated')} />        
          <TopFavoritosList limit={5} title={t('topLiked')}/>        
      </TopBox> 
      </Box>

  );
}

export default TopsPage;