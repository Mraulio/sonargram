import { useEffect, useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem, Link } from '@mui/material';
import createApiClient from '../api/apiClient';
import Menu from '../components/Menu';


function ListPage() {
    const { t } = useTranslation();  // Hook para obtener las traducciones
      const [users, setUsers] = useState([]);
      const [userName, setUserName] = useState('');
      const [userUsername, setUserUsername] = useState('');
      const [userEmail, setUserEmail] = useState('');
      const [userPassword, setUserPassword] = useState('');
      const [lists, setLists] = useState([]);
      const [listName, setListName] = useState('');
      const [songs, setSongs] = useState('');
      const [creator, setCreator] = useState('');
      const { token, role, logout } = useContext(UserContext);
      const navigate = useNavigate();
      const apiClient = useMemo(() => createApiClient(token), [token]);
      
      useEffect(() => {
        apiClient.get('/lists')
          .then(res => setLists(res.data))
          .catch(err => console.error(err));
      }, [apiClient]);

      return (
        <Box>
          <Menu />
          <Box sx={{ p: 4, fontFamily: 'sans-serif', maxWidth: '90vw', mx: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{t('Listas')}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {lists.map(l => (
                <Card key={l._id} sx={{ width: '500px', p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>{l.name}</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {t('Canciones')}: {l.songs.join(', ')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', p: 4, fontFamily: 'sans-serif', maxWidth: '100%', mx: 'auto' }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('Creador de la lista')}: {l.creator.name || t('unknown')}
                    </Typography>
                    <Link href="editList" underline="hover" sx={{ display: 'block', mb: 1, color: 'black' }}>Editar</Link>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Box>
      );
}
export default ListPage;