import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Box, Typography, Card, CardContent, Button, TextField, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Menu2 from '../components/Menu2';
import useUser from '../hooks/useUser';
import useList from '../hooks/useList';
import TopRatingsUser from '../components/TopRatingsUser';
import TopFavoritesUser from '../components/TopFavoritesUser';

function UserItems() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { token, role, logout } = useContext(UserContext);
    const [open, setOpen] = useState(false);
    const {
      users,
      fetchAllUsers,
      registerNewUser,
      deleteUser,
      getUserById,
      getCurrentUser,
      updateUser,
    } = useUser(token);
  

    
   
    return (
    <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'end', width: "100vw" }}>
      <Menu2 />
      <Box sx={{ width: '95vw', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>    
            <TopRatingsUser limit={5} title={t("Tus ratings más altos")} />
            <TopFavoritesUser limit={5} title={t("Tus favoritos")} />
        </Box>      
    </Box>
  </Box>
  );
      
  }
  
  export default UserItems;