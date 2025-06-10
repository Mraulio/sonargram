import { useEffect, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Avatar, Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem, styled } from '@mui/material';
import Menu2 from '../components/Menu2';
import Search2 from '../components/Search2'
import useUser from '../hooks/useUser';
import useFollow from '../hooks/useFollow';
import TopRatingsList from '../components/TopRatingsList';
import TopFavoritosList from '../components/TopFavoritosList'
import Timeline from '../components/Timeline'
import MyLists from '../components/MyLists'
import { useNavigate } from 'react-router-dom';

const MenuBox= styled(Box)`
 margin-left: 15px;
 position: fixed;
 width:100vw;
 display: flex;
 justify-content: center;
 align-item: center;
  @media (min-width: 601px) and (max-width: 960px) {
    width: 180px;
  }
  @media (max-width: 600px) {
    width: 30px;
  }

`;

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
    <Box sx={{width:'100vw', display: 'flex', flexDirection:'column'}}>
      <Menu2/>
      <Box sx={{ display: 'flex', justifyContent:'space-between', mr: 5, alignItems:'start' }}>
        <Box sx={{width:'20%', height: '100%',  borderRight: '2px solid' }}>
          <MyLists/>
        </Box>
        <Box sx={{width:'40%' }}>
          <Timeline/>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexDirection:'column', justifyContent:'center', alignItems:'start', width:'40%' }}>    
          <TopRatingsList limit={5} title="Top 5 por Rating" />        
          <TopFavoritosList limit={5}/>        
      </Box>  
      </Box>
       
    </Box>
  );
}

export default Dashboard;