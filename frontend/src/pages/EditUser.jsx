import { useState, useContext, useEffect} from 'react';
import { TextField, Button, Typography, Card, CardContent, Box, Divider } from '@mui/material';
import { UserContext } from '../context/UserContext';
import { jwtDecode } from 'jwt-decode';
import { loginUser } from '../api/internal/userApi';  // Importamos la función desde userApi
import { useNavigate } from 'react-router-dom'; 
import { useTranslation } from 'react-i18next';
import { registerUser, getAllUsers } from '../api/internal/userApi'
import useUser from '../hooks/useUser';
import Menu from '../components/Menu';
import { useParams } from 'react-router-dom';

function UserPage() {
    const { t } = useTranslation();  // Hook para obtener las traducciones
        const [users, setUsers] = useState([]);
        const [userId, setUserId] = useState(''); // Estado para el ID del usuario a editar
        const [userName, setUserName] = useState('');
        const [userUsername, setUserUsername] = useState('');
        const [userEmail, setUserEmail] = useState('');
        const [userPassword, setUserPassword] = useState('');
        const [lists, setLists] = useState([]);
        const [listName, setListName] = useState('');
        const [songs, setSongs] = useState('');
        const [creator, setCreator] = useState('');
        const { token, role, logout, login } = useContext(UserContext);
        const navigate = useNavigate();
        const { id } = useParams(); // Obtiene el ID del usuario desde la URL
        const {
              fetchAllUsers,
              registerNewUser,
              deleteUser,
              getUserById,
              getCurrentUser,
              setCurrentUser,
              updateUser,
            } = useUser(token);

        useEffect(() => {
          const fetchUserData = async () => {
            try {
              const user = await getUserById(id); // Llamamos a getCurrentUser para obtener los datos del usuario actual
              if (user) {
                setUserName(user.name);
                setUserUsername(user.username);
                setUserEmail(user.email);
                setUserId(user._id); 
              }
            } catch (err) {
              console.error('Error fetching current user:', err);
            }
          };
      
          fetchUserData();
        }, [getCurrentUser]);

        const handleDeleteUser = async (userId) => {
          if (!window.confirm(t('confirmDeleteUser'))) return; // Confirmación antes de eliminar
        
          try {
            await deleteUser(userId); // Llamamos a la función deleteUser del hook
            alert(t('userDeleted')); // Mensaje de éxito
            navigate('/admin'); // Redirige a la página de administración
            

          } catch (err) {
            alert(t('errorDeletingUser')); // Mensaje de error
            console.error('Error deleting user:', err);
          }
        };

        const handleEditUser = async (userId, updatedData) => {
          try {
            // Llamamos a la función updateUser del hook para actualizar los datos del usuario
            await updateUser(userId, updatedData);
            
            alert(t('userUpdated')); // Mensaje de éxito
          } catch (err) {
            alert(t('errorUpdatingUser')); // Mensaje de error
            console.error('Error updating user:', err);
          }
        };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '5rem' }}>
      <Menu />
      <Card sx={{ width: '500px', p: 2, margin: 'auto', backgroundColor: '#f5f5f5' }}>
        <CardContent>
        <Typography variant="h5" gutterBottom>{t('updateUser')}: {userName} {id}</Typography>
            <TextField
              fullWidth
              label={t('name')}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label={t('username')}
              value={userUsername}
              onChange={(e) => setUserUsername(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label={t('email')}
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              margin="normal"
            />
            <Button
              variant="contained"
              onClick={() =>
                handleEditUser(id, {
                  name: userName,
                  username: userUsername,
                  email: userEmail,
                })
              }
              sx={{ mt: 2 }}
            >
              {t('editUserButton')}
            </Button>
            <Button variant="contained" color= "error" onClick={() => handleDeleteUser(id)} sx={{ mt: 2 }}>
              {t('deleteUserButton')}
            </Button>
        </CardContent>
      </Card>
   

    </div>
  );
}

export default UserPage;
