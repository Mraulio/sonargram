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
import LoadingScreen from "../components/LoadingScreen.jsx";
import TopFollowedLists from '../components/TopFollowedLists.jsx';

const TopBox= styled(Box)`
   display: flex; 
   gap: 10px;  
   justify-content: center; 
  
   width: 100%;
    @media (max-width: 920px) {
    flex-direction: column; 
    gap: 20px;
  }
`;
function TopsPage() {
  const { t } = useTranslation();  // Hook para obtener las traducciones
  const { token} = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
   
  return (

      <Box sx={{ display: 'flex', flexDirection: 'column', padding: 0, gap: 2, minHeight:'100vh', width: '100%', backgroundColor: theme.palette.background.secondary }}>
        <Menu />
        <TopBox>    
          <TopRatingsList limit={5} title={t('topRated')} setLoading={setLoading}/>        
          <TopFavoritosList limit={5} title={t('topLiked')} setLoading={setLoading}/>        
        </TopBox>
        <TopFollowedLists/>
        <LoadingScreen open={loading} />

      </Box>
  );
}

export default TopsPage;