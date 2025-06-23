import { useEffect, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Avatar, Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem, styled, useTheme } from '@mui/material';
import Menu from '../components/Menu';
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
import { showToast } from '../utils/toast';

const MenuBox= styled(Box)`
 margin-left: 15px;
 position: fixed;
 width:90vw;
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
height: 100vh;
padding-left:2px; 
overflow-x: hidden;
overflow-y: auto;
margin-top:5px;
@media (max-width: 960px) {
    width: 99vw;
    border-right: 0px;
    display:flex;
    justify-content:center;
    min-height:0vh;
    overflow-y: auto;
  }
`;

const TimeLineBox= styled(Box)`
display: flex; 

width: 60%; 
height: 100vh;
overflow-y: auto;
@media (max-width: 960px) {
    width: 90vw;
    justify-content:center;
    align-items:start;
    overflow-y: auto;
  }

`;

const DashBoardBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginRight: '15px',
  backgroundColor: theme.palette.background.secondary,
  width: '95vw',
  gap: '15px',

  [`@media (max-width: 960px)`]: {
    flexDirection: 'column',
    justifyContent: 'start',
    alignItems: 'center',
  },
}));

function Dashboard() {
  const { t } = useTranslation();  // Hook para obtener las traducciones
  const [userUsername, setUserUsername] = useState('');
  const theme = useTheme();
  const { token, role, logout, user} = useContext(UserContext);
  const [error, setError] = useState(null);
  const { users, fetchAllUsers, getCurrentUser } = useUser(token);
   

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

  return (
    <Box sx={{width:'100%', display: 'flex', flexDirection:'column', minHeight: '100vh', }}>
      <Menu/>
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