import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import apiClient from '../api/apiClient';
import Menu from '../components/Menu';


function FollowedPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();  // Hook para obtener las traducciones

    return(
        <Box>
            <Menu/>
            <Typography>Hola!!! Aquí cargarán los que siguen al usuario</Typography>
        </Box>
    );
}
export default FollowedPage;