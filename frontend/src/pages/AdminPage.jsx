import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Box, Typography, Card, CardContent, Button, TextField, Divider } from '@mui/material';
import Menu from '../components/Menu';
import useUser from '../hooks/useUser';
import useList from '../hooks/useList';

function AdminPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { token, role, logout } = useContext(UserContext);
  
    const {
      users,
      fetchAllUsers,
      registerNewUser,
      deleteUser,
    } = useUser();
  
    const {
      lists,
      fetchAllLists,
      createNewList,
      removeList,
    } = useList(token);
  
    const [userName, setUserName] = useState('');
    const [userUsername, setUserUsername] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
  
    const [listName, setListName] = useState('');
    const [songs, setSongs] = useState('');
  
    useEffect(() => {
      if (token && role === 'admin') fetchAllUsers(token);
    }, [token, role, fetchAllUsers]);
  
    useEffect(() => {
      if (token) fetchAllLists();
    }, [token, fetchAllLists]);
  
    const handleCreateUser = async () => {
      try {
        await registerNewUser({
          name: userName,
          username: userUsername,
          email: userEmail,
          password: userPassword,
        });
  
        setUserName('');
        setUserUsername('');
        setUserEmail('');
        setUserPassword('');
      } catch (err) {
        alert('Error creating user');
        console.error(err);
      }
    };
  
    const handleCreateList = async () => {
      try {
        const songArray = songs
          .split(',')
          .map(s => s.trim())
          .filter(s => s !== '')
          .map(id => ({ musicbrainzId: id }));
  
        await createNewList({ name: listName, songs: songArray });
  
        alert('List created');
        setListName('');
        setSongs('');
      } catch (err) {
        alert('Error creating list');
        console.error(err);
      }
    };
  
    const handleDeleteList = async (listId) => {
      if (!window.confirm(t('confirmDeleteList'))) return;
  
      try {
        await removeList(listId);
      } catch (err) {
        alert(t('errorDeletingList'));
        console.error(err);
      }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm(t('confirmDeleteUser'))) return; // Confirmación antes de eliminar
      
        try {
          await deleteUser(userId); // Llamamos a la función deleteUser del hook
          alert(t('userDeleted')); // Mensaje de éxito
        } catch (err) {
          alert(t('errorDeletingUser')); // Mensaje de error
          console.error('Error deleting user:', err);
        }
      };
  
    return (
      <Box sx={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <Menu />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',  maxWidth: '600px', marginTop: '1.1rem' }}>
            <Card sx={{ mb: 4, backgroundColor: token ? '#e8f5e9' : '#ffebee', border: '1px solid', borderColor: token ? 'green' : 'red' }}>
            <CardContent>
                <Typography variant="h6" sx={{ color: token ? 'green' : 'red' }}>
                {token ? t('userLoggedIn', { role }) : t('noUserLoggedIn')}
                </Typography>
            </CardContent>
            </Card>
    
    
            {role === 'admin' && (
            <Card sx={{ mb: 4 }}>
                <CardContent>
                <Typography variant="h5" gutterBottom>{t('createUser')}</Typography>
                <TextField fullWidth label={t('name')} value={userName} onChange={e => setUserName(e.target.value)} margin="normal" />
                <TextField fullWidth label={t('username')} value={userUsername} onChange={e => setUserUsername(e.target.value)} margin="normal" />
                <TextField fullWidth label={t('email')} value={userEmail} onChange={e => setUserEmail(e.target.value)} margin="normal" />
                <TextField fullWidth type="password" label={t('password')} value={userPassword} onChange={e => setUserPassword(e.target.value)} margin="normal" />
                <Button variant="contained" onClick={handleCreateUser} sx={{ mt: 2 }}>
                    {t('createUserButton')}
                </Button>
    
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">{t('existingUsers')}</Typography>
                <ul>
                    {users.map(u => (
                    <li key={u._id}>
                        {u.username} - {u.email}
                        <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteUser(u._id)} sx={{ ml: 2 }}>
                        {t('delete')}
                        </Button>
                    </li>
                    ))}
                </ul>
                </CardContent>
            </Card>
            )}
    
            <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>{t('createList')}</Typography>
                <TextField fullWidth label={t('listName')} value={listName} onChange={e => setListName(e.target.value)} margin="normal" />
                <TextField fullWidth label={t('songIds')} value={songs} onChange={e => setSongs(e.target.value)} margin="normal" />
                <Button variant="contained" onClick={handleCreateList} sx={{ mt: 2 }}>
                {t('createListButton')}
                </Button>
    
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">{t('existingLists')}</Typography>
                <ul>
                {lists.map(l => (
                    <li key={l._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{l.name}</span>
                    <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteList(l._id)} sx={{ ml: 2 }}>
                        {t('delete')}
                    </Button>
                    </li>
                ))}
                </ul>
            </CardContent>
            </Card>
    
            {token && (
            <Typography sx={{ mt: 4 }} fontSize="small" color="text.secondary">
                {t('tokenLabel')}: {token}
            </Typography>
            )}
        </Box>
      </Box>
    );
  }
  
  export default AdminPage;