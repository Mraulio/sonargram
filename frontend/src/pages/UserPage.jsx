import { useState, useContext, useEffect, useRef } from 'react';
import { TextField, Button, Typography, Card, CardContent, Box, Divider, ButtonBase, Modal, styled, useTheme } from '@mui/material';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom'; 
import { useTranslation } from 'react-i18next';
import Followers from '../components/Followers';
import useUser from '../hooks/useUser';
import Menu from '../components/Menu';
import TopRatingsUser from '../components/TopRatingsUser'
import baseUrl from '../config.js';
import { showToast } from "../utils/toast.js";

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      border: 'none',
      borderBottom: `2px solid `, // color del borde
      borderRadius: 0,
    },
    '&:hover fieldset': {
      borderBottom: `2px solid`, // hover
    },
    '&.Mui-focused fieldset': {
      borderBottom: `2px solid`, // foco
    },
    color: theme.palette.text.primary,
  },
  '& input': {
    color: theme.palette.text.primary, // texto introducido
  },
  '& label': {
    color: theme.palette.text.primary, // etiqueta
  },
  '& label.Mui-focused': {
    color: theme.palette.primary.main, // etiqueta con foco
  },
  width: '100%',
}));

function UserPage() {
    const { t } = useTranslation();  // Hook para obtener las traducciones
        const [users, setUsers] = useState([]);
        const [userId, setUserId] = useState(''); // Estado para el ID del usuario a editar
        const [userName, setUserName] = useState('');
        const [userUsername, setUserUsername] = useState('');
        const [userEmail, setUserEmail] = useState('');
        const [userBio, setUserBio] = useState('');
        const [openModal, setOpenModal] = useState(false);
        const [openProfilePicModal, setOpenProfilePicModal] = useState(false);
        const { token, role, logout, login, profilePic, setProfilePic } = useContext(UserContext);
        const navigate = useNavigate();
        const [previewImage, setPreviewImage] = useState(null);
        const [resizedImage, setResizedImage] = useState(null);
        const fileInputRef = useRef(null);
        const [currentUser, setCurrentUser] = useState(null);
        const [selectedUser, setSelectedUser] = useState(null);
        const theme = useTheme();

        const {
              fetchAllUsers,
              registerNewUser,
              deleteUser,
              getUserById,
              getCurrentUser,
              updateUser,
              uploadProfilePic,
              deleteProfilePic,
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

                setUserBio(user.bio); // Asignamos la biografía al estado
              }
            } catch (err) {
              console.error(t('errorFetchingCurrentUser'), err);
            }
          };
      
          fetchUserData();
        }, [getCurrentUser]);

        useEffect(() => {
          const fetchCurrent = async () => {
            try {
              const user = await getCurrentUser();
              setCurrentUser(user);
            } catch (err) {
              console.error(t('errorFetchingCurrentUser'), err);
            }
          };
      
          if (token) fetchCurrent();
        }, [token, getCurrentUser]);

        const handleDeleteUser = async (userId) => {
          if (!window.confirm(t('confirmDeleteUser'))) return; // Confirmación antes de eliminar
          
          try {
            await deleteUser(userId); // Llamamos a la función deleteUser del hook
            showToast(t('userDeleted'), 'success')
            logout(); // Cerrar sesión después de eliminar el usuario
          } catch (err) {
            showToast(t('errorDeletingUser'), 'error')
            console.error(t('errorDeletingUser'), err);
          }
        };

        const handleEditUser = async (userId, updatedData) => {
          try {
            // Solo enviar los campos permitidos por el backend
            const updates = {
              name: userName,
              bio: userBio
            };
        
            await updateUser(userId, updates); // Llama a la función updateUser con los datos permitidos
            showToast(t('userUpdated'), 'success')
       
          } catch (err) {
            console.error(t('errorUpdateUser'), err);
        
            // Manejo de errores basado en la respuesta del backend
            if (err.response && err.response.status === 400) {
              showToast(t('errorUpdatingUserFields'), 'error')
            } else if (err.response && err.response.status === 403) {
              showToast(t('errorAccessDenied'), 'error')
            } else if (err.response && err.response.status === 404) {
              showToast(t('errorUserNotFound'), 'error')
            } else {
              showToast(t('errorUpdatingUser'), 'error')
            }
          }
        };

        // ****************** IMAGEN DE PERFIL ********************************* //
  const handleProfilePicClick = () => {
    fileInputRef.current.click(); // abre el file picker
  };
  
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        resizeImage(reader.result);
        setOpenProfilePicModal(true);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const resizeImage = (dataUrl) => {
    const img = new Image();
    img.onload = () => {
      const maxSize = 200;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
  
      canvas.width = maxSize;
      canvas.height = maxSize;
  
      // Calcular el tamaño redimensionado manteniendo proporción
      const ratio = Math.min(maxSize / img.width, maxSize / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;
  
      // Centrar la imagen en el canvas
      const offsetX = (maxSize - newWidth) / 2;
      const offsetY = (maxSize - newHeight) / 2;
  
      // Fondo blanco opcional (puedes cambiar a transparente si prefieres)
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, maxSize, maxSize);
  
      ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);
      const resizedDataUrl = canvas.toDataURL("image/jpeg");
      setResizedImage(resizedDataUrl);
    };
    img.src = dataUrl;
  };
  

  const handleSaveImage = async () => {
    try {
      const response = await fetch(resizedImage);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("profilePic", blob, "profile.jpg");
  
      // Subir la imagen usando el hook
      const resp = await uploadProfilePic(formData); // Esta es la llamada a la API
      const newProfilePic = `${resp.profilePic}?t=${new Date().getTime()}`;
      setCurrentUser({...currentUser, profilePic: newProfilePic }) // Le meto una url con un tiempo aleatorio para que vea un cambio y se actualice
      setProfilePic(newProfilePic)
      setOpenProfilePicModal(false); // Cerrar el modal
    } catch (err) {
      console.error(t('errorUpdateProfilePic'), err);
      showToast(t('errorUpdateProfilePic'), 'error')
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false); // Cerramos el modal
    setSelectedUser(null); // Limpiamos los detalles del usuario
  };

  const handleDeleteProfilePic = async () => {
      try {
        const resp = await deleteProfilePic();
        setCurrentUser({...currentUser, profilePic: resp.updatedUser.profilePic});
        setProfilePic(null);
      } catch (err) {
        showToast(t('errorDeleteProfilePic'), 'error')
        console.error(err);
      } 
  };
  
  
  
 // ****************** FIN IMAGEN DE PERFIL ********************************* //


 return (
  <Box style={{ width: '100%',display: 'flex', flexDirection: 'column' }}>
    <Menu />
    <Box sx={{ display: 'flex', flexDirection:'column', alignItems:'center',minHeight: '100vh', width: '100%', backgroundColor: theme.palette.background.secondary}}>
      <Card sx={{ display: 'flex', flexDirection:'column', alignItems:'center', width: '400px', marginBottom: '50px', marginTop: '50px',padding: 10}}>
        <Typography variant="h5" gutterBottom>
          {t('dataUser')}
        </Typography>
    
        <ButtonBase
          onClick={handleProfilePicClick}
          sx={{
            borderRadius: '50%',
            overflow: 'hidden',
            width: 150,
            height: 150,
            display: 'inline-block',
          }}
        >
          <img
            src={
             profilePic
                ? `${baseUrl}/uploads/${profilePic}`
                : '/assets/images/profilepic_default.png'
            }
            alt="Profile Pic"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </ButtonBase>
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <br />
        <Button variant="outlined" color="error" onClick={handleDeleteProfilePic} sx={{ mt: 2 }}>
        {t('deleteProfilePic')}
        </Button>
        <CustomTextField
          fullWidth
          multiline
          label={t('name')}
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          margin="normal"
        />
        <CustomTextField
          fullWidth
          label={t('bio')} // Etiqueta traducida para la biografía
          value={userBio} // Estado para la biografía
          onChange={(e) => setUserBio(e.target.value)} // Actualiza el estado de la biografía
          margin="normal"/>
        <Box sx={{ display: 'flex', justifyContent:'space-around', width:'100%'}}>
          <Button
            variant="contained"
            color= "warning"
            onClick={() =>
              handleEditUser(userId, {
                name: userName,
              })
            }
            sx={{ mt: 2, width: '40%', fontSize: '0.6rem' }}
          >
            {t('editUserButton')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDeleteUser(userId)}
            sx={{ mt: 2, width: '40%', fontSize: '0.6rem' }}
          >
            {t('deleteUserButton')}
          </Button>
        </Box>  
        </Card>
        <Followers/>
    {selectedUser && (
          <Modal
            open={openModal}
            onClose={handleCloseModal}
            aria-labelledby="user-details-modal"
            aria-describedby="user-details-description"
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "white",
                padding: 4,
                borderRadius: 2,
                boxShadow: 24,
                width: 400,
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <img
                src={
                  selectedUser.profilePic
                    ? `${baseUrl}/uploads/${selectedUser.profilePic}`
                    : '/assets/images/profilepic_default.png'  // Accede directamente a la carpeta public
                }
                alt="Profile Pic"
                style={{ width: '150px', height: '150px', borderRadius: '50%' }}
              />
              <Button
                variant="contained"
                onClick={handleCloseModal}
                sx={{ mt: 2 }}
              >
                {t("close")}
              </Button>
            </Box>
            
          </Modal>
        )}

        <Modal open={openProfilePicModal} onClose={() => setOpenProfilePicModal(false)}>
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "white",
                    padding: 4,
                    borderRadius: 2,
                    boxShadow: 24,
                    width: 300,
                    textAlign: "center"
                  }}
                >
                  <Typography variant="h6">Actualizar imagen de perfil</Typography>
                  {previewImage && (
                    <img
                      src={resizedImage || previewImage}
                      alt="Preview"
                      style={{ width: 200, height: 200, borderRadius: "50%", marginTop: 16 }}
                    />
                  )}
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={handleSaveImage}
                  >
                    Guardar Imagen
                  </Button>
                </Box>
              </Modal>
              
    </Box>
  </Box>
);
}

export default UserPage;
