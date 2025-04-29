import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Box, Typography, Card, CardContent, Button, TextField, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Menu from '../components/Menu';
import useUser from '../hooks/useUser';
import useList from '../hooks/useList';

function AdminPage() {
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
    const [editingUser, setEditingUser] = useState(null); // Estado para el usuario en edición
    
    useEffect(() => {
      if (token && role === "admin") fetchAllUsers();
    }, [token, role, fetchAllUsers]);
    
    useEffect(() => {
      if (token) fetchAllLists();
    }, [token, fetchAllLists]);
  

    const handleOpenModal = (user) => {
      setEditingUser(user); // Establece el usuario en edición
      setUserName(user.name);

      setOpen(true); // Abre el modal
    };

    const handleCloseModal = () => {
      setOpen(false); // Cierra el modal
      setEditingUser(null); // Limpia el usuario en edición
    };

    const handleSaveChanges = async () => {
      try {
        // Solo enviar los campos permitidos por el backend
        const updates = {
          name: userName,
        };
    
        await updateUser(editingUser._id, updates); // Llama a la función updateUser con los datos permitidos
        alert(t('userUpdated')); // Mensaje de éxito
        setOpen(false); // Cierra el modal
        fetchAllUsers(); // Actualiza la lista de usuarios
      } catch (err) {
        console.error('Error updating user:', err);
    
        // Manejo de errores basado en la respuesta del backend
        if (err.response && err.response.status === 400) {
          alert(t('errorUpdatingUserFields')); // Mensaje para campos no permitidos
        } else if (err.response && err.response.status === 403) {
          alert(t('errorAccessDenied')); // Mensaje para acceso denegado
        } else if (err.response && err.response.status === 404) {
          alert(t('errorUserNotFound')); // Mensaje para usuario no encontrado
        } else {
          alert(t('errorUpdatingUser')); // Mensaje genérico
        }
      }
    };
  
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
        console.log('Deleting user with ID:', userId); // Verifica el ID del usuario a eliminar
        try {
          await deleteUser(userId); // Llamamos a la función deleteUser del hook
          alert(t('userDeleted')); // Mensaje de éxito
        } catch (err) {
          alert(t('errorDeletingUser')); // Mensaje de error
          console.error('Error deleting user:', err);
        }
      };

      
      const handleUserClick = async (userId) => {
        try {
          const user = await getUserById(userId);
          alert(`
            ID: ${user.id}
            Nombre: ${user.name}
            Username: ${user.username}
            Bio: ${user.bio}
            Email: ${user.email}
            Status: ${user.status}
            Rol: ${user.role}
            Created: ${user.createdAt}
          `);
        } catch (err) {
          alert("Error al obtener datos del usuario");
          console.error(err);
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
                {users.map((u) => (
                  <li
                    key={u._id}
                    style={{
                      display: "flex", // Usamos flexbox para alinear los elementos
                      alignItems: "center", // Alinea verticalmente los elementos
                      gap: "10px", // Espaciado entre los botones y el texto
                      justifyContent: "space-between", // Espacio entre el texto y los botones
                      cursor: "pointer",
                      textDecoration: "underline",
                      color: "blue",
                    }}
                    onClick={() => handleUserClick(u._id)}>
                    {u.username} - {u.email}
                    <Box>
                    <Button variant="outlined" color="warning" size="small" onClick={(e) => {e.stopPropagation(); handleOpenModal(u);}} sx={{ ml: 2 }}>{t('edit')}</Button>
                    <Button variant="outlined" color="error" size="small" onClick={(e) => {e.stopPropagation(); handleDeleteUser(u._id);}} sx={{ ml: 2 }}>{t('delete')}</Button>
                    </Box>
                  </li>
                   
                ))}
              </ul>                   
                </CardContent>
            </Card>
            )}

            {/* Modal para editar usuario */}
      <Dialog open={open} onClose={handleCloseModal}>
        <DialogTitle>{t('editUser')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('name')}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            margin="normal"
          />
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            {t('cancel')}
          </Button>
          <Button onClick={handleSaveChanges} variant="contained" color="primary">
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>

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