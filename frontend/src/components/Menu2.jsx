import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Avatar, Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem, Link } from '@mui/material';
import { ThemeContext } from '../context/ThemeContext';
import apiClient from '../api/internal/apiClient';
import useUser from '../hooks/useUser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { faListUl } from '@fortawesome/free-solid-svg-icons';

function Menu2() {
  const { t } = useTranslation();  // Hook para obtener las traducciones
  const { token, role, logout } = useContext(UserContext);
  const [currentUser, setCurrentUser] = useState(null);
  const { getCurrentUser } = useUser(token);
  useEffect(() => {
            const fetchCurrent = async () => {
              try {
                const user = await getCurrentUser();
                setCurrentUser(user);
              } catch (err) {
                console.error("Error fetching current user", err);
              }
            };
        
            if (token) fetchCurrent();
          }, [token, getCurrentUser]);


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'center', gap: 2, mt: 2, color: 'white', width: '5vw', height:'100%', gap: 4, top: '120px', left: '0', position: 'fixed', backgroundColor:'blue' }}>
      <Link href="/DashBoard" ><img src="" /></Link>
        <Link href="/profile" underline="hover"><Avatar sx={{width: '70px', height: '70px'}} src={
              currentUser && currentUser.profilePic
                ? `http://localhost:5000/uploads/${currentUser.profilePic}`
                : '/assets/images/profilepic_default.png'
            } alt="imagen perfil"/></Link>
        <Link sx={{color: 'white'}} href="/community" underline="hover"><FontAwesomeIcon style={{ fontSize: '35px' }} icon= {faUsers} /></Link>
        <Link sx={{color: 'white'}} href="/lists" underline="hover" ><FontAwesomeIcon style={{ fontSize: '35px' }} icon= {faListUl} /></Link>
        {role === 'admin' && <Link sx={{color: 'red'}} href="/admin" underline="hover">Admin</Link>}
        <Button variant="outlined" onClick={logout} sx={{ color: 'white', borderColor: 'white' }}>X</Button>
      
    

    </Box>
  );
}

export default Menu2;
