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
import FooterBar from '../components/Footer'
import { useNavigate } from 'react-router-dom';
import useFavorites from '../hooks/useFavorites';
import useList from '../hooks/useList';

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

const ListsBox= styled(Box)`
width: 25vw; 
min-height: 100vh;
padding-left:2px; 
border-right: 1px solid;

@media (max-width: 960px) {
    width: 100vw;
    border-right: 0px;
    display:flex;
    justify-content:center;
    min-height:0vh;
  }
`;

const TimeLineBox= styled(Box)`
display: flex; 
flex-direction:column; 
width: 69vw; 
height: 100vh; 
overflow-y: auto;
margin-top: 15px;
@media (max-width: 960px) {
    width: 95vw;
    justify-content:start;
    align-items:center;
    overflow-y: auto;
  }

`;

const DashBoardBox= styled(Box)`
 display: flex;
 margin-right: 15px; 
 align-items:center; 
 width:100vw; 
 gap:15px;

@media (max-width: 960px) {
  width: 100vw;
  flex-direction: column;
  justify-content:start;
  align-items:start;
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
   

  // Estados centrales para favoritos y listas
  const favoriteProps = useFavorites(token);
  const listProps = useList(token);

  const [favoriteCounts, setFavoriteCounts] = useState({});
  const [userLists, setUserLists] = useState([]);


  useEffect(() => {
    fetchAllUsers(token);
    handleCurrentUser();
  }, [token, fetchAllUsers]);

  const handleCurrentUser= async () => {
    try {
      const user = await getCurrentUser();
      setUserUsername(user.name);
    } catch (err) {
      setError(err.message || 'Error fetching users');
    }
  };
  // Refrescar listas del usuario y actualizar estado
  const refreshLists = async (userId = user?.userId) => {
    if (!userId) return;
    try {
      const lists = await listProps.fetchListsByUser(userId);
      setUserLists(lists || []);
    } catch (err) {
      console.error("Error fetching user lists", err);
    }
  };

  // Función para actualizar el contador de favoritos de un id dado
  const updateFavoriteCount = async (id) => {
    try {
      const count = await favoriteProps.getFavoriteCount(id);
      setFavoriteCounts(prev => ({ ...prev, [id]: count }));
    } catch (err) {
      console.error("Error updating favorite count", err);
    }
  };

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
      <DashBoardBox>
        <ListsBox>
            <MyLists
              userLists={userLists}
              refreshLists={refreshLists}
              favoriteProps={{ ...favoriteProps, favoriteCounts, updateFavoriteCount }}
            />        
          </ListsBox>
          <TimeLineBox>  
            <Timeline
              favoriteProps={{ ...favoriteProps, favoriteCounts, updateFavoriteCount }}
              userLists={userLists}
              refreshLists={refreshLists}
            />              
          </TimeLineBox>        
      </DashBoardBox>
    </Box>
  );
}

export default Dashboard;