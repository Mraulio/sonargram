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
              const user = await getCurrentUser(); // Llamamos a getCurrentUser para obtener los datos del usuario actual
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
          } catch (err) {
            alert(t('errorDeletingUser')); // Mensaje de error
            console.error('Error deleting user:', err);
          }
        };

        const handleEditUser = async (userId, updatedData) => {
          try {
            // Solo enviar los campos permitidos por el backend
            const updates = {
              name: userName,
            };
        
            await updateUser(userId, updates); // Llama a la función updateUser con los datos permitidos
            alert(t('userUpdated')); // Mensaje de éxito
       
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '5rem' }}>
      <Menu />
      <Card sx={{ width: '500px', p: 2, margin: 'auto', backgroundColor: '#f5f5f5' }}>
        <CardContent>
        <Typography variant="h5" gutterBottom>{t('updateUser')}</Typography>
                    <TextField
              fullWidth
              label={t('name')}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              margin="normal"
            />

            <Button
              variant="contained"
              onClick={() =>
                handleEditUser(userId, {
                  name: userName,
                  username: userUsername,
                  email: userEmail,
                })
              }
              sx={{ mt: 2 }}
            >
              {t('editUserButton')}
            </Button>
            <Button variant="contained" color= "error" onClick={() => handleDeleteUser(userId)} sx={{ mt: 2 }}>
              {t('deleteUserButton')}
            </Button>
        </CardContent>
      </Card>
   

    </div>
  );
}

export default UserPage;
