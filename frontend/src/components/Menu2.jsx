import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Avatar, Box, Button, Link, Modal, Typography, TextField } from '@mui/material';
import { ThemeContext } from '../context/ThemeContext';
import useUser from '../hooks/useUser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faListUl, faHeart, faMedal, faMoon, faSun, faXmark, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import UserEdit from './UserEdit'; // importa tu componente de edición
import { styled } from '@mui/material/styles';
import i18n from '../i18n';
import logo from '../logo.png' // Asegúrate de tener una imagen de logo
import { useNavigate } from 'react-router-dom';

const CustomMenu = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100vw;
  top: 25px;
  gap: 50px;
  border-bottom: solid 1px;
  background-color: 
  

  @media (min-width: 601px) and (max-width: 960px) {
    width: 120px;
  }

  @media (max-width: 600px) {
    flex-direction: row;
    width: 500px;
    margin: 0;
    bottom: 25px;
    left: 50%;
    transform: translateX(-50%);
    top: auto;
    border-radius: 15px;
    z-index: 1300;
    padding: 0 15px 0 15px;
    gap: 15px;

  `;
const CustomLink = styled(Link)`
    color: #3e4a4c;
    text-decoration: none;
    display: flex;
    justify-content: center;
    align-items: center;

    span{
      width: 50%;
      display:none;
      }

    @media (max-width: 960px) {
      span {
        display: none;
      }
    }
 
`;

const CustomButton = styled(Link)`
    color : white;
    text-decoration: none;
    cursor: pointer;
  `;
const CustomTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    
    '& fieldset': {
      border: 'none',
      borderBottom: '2px solid #3e4a4c', // solo borde abajo, cambia el color si quieres
      borderRadius: 0,
    },
    '&:hover fieldset': {
      border: 'none',
      borderBottom: '2px solid #3e4a4c',
    },
    '&.Mui-focused fieldset': {
      border: 'none',
      borderBottom: '2px solid #3e4a4c',
    },
  },
  '& label': {
    color: '#3e4a4c',
  },
  '& label.Mui-focused': {
    color: '#3e4a4c',
  },
  width: '550px',
});

function Menu2() {
  const { t } = useTranslation();
  const { token, role, logout } = useContext(UserContext);
  const [currentUser, setCurrentUser] = useState(null);
  const { getCurrentUser } = useUser(token);

  // Estado para el modal
  const [openUserEdit, setOpenUserEdit] = useState(false);
  const handleOpenUserEdit = () => setOpenUserEdit(true);
  const handleCloseUserEdit = () => setOpenUserEdit(false);
  //  // Contexto del tema
  const { theme, toggleTheme, mode } = useContext(ThemeContext);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

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

  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      navigate(`/results?query=${encodeURIComponent(searchTerm)}`);
    }
  };


  return (
    <CustomMenu>
        <Link href="/dashboard" ><img src={logo} alt="Logo" style={{ width: "150px" }} /></Link>
        <Box sx={{ display: 'flex', gap: 1, width:'60vw', justifyContent:'start', alignItems: 'center', gap:3 }}>
            <CustomTextField
                fullWidth
                label="Buscar artistas, álbumes o canciones"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} // <-- agrega esto
                onKeyDown={e => e.key === "Enter" && handleSearchClick()}
                margin="normal"
              />
            <Button onClick={handleSearchClick}><FontAwesomeIcon style={{fontSize: 24, color: '#3e4a4c'}} icon={faMagnifyingGlass} /></Button>
            <CustomLink href="/community" underline="hover"><FontAwesomeIcon style={{ fontSize: '35px' }} icon={faUsers} /><span>{t('community')}</span></CustomLink>
            <CustomLink href="/lists" underline="hover" ><FontAwesomeIcon sx={{ width: '50%' }}style={{ fontSize: '35px' }} icon={faListUl} /><span>{t('lists')}</span></CustomLink>
            <CustomLink href="" underline="hover"><FontAwesomeIcon sx={{ width: '50%' }}style={{ fontSize: '35px' }} icon={faHeart} /><span>{t('favorites')}</span></CustomLink>
            {role === 'admin' && <Link sx={{color: 'red'}} href="/admin" underline="hover">Admin</Link>}
            {/* Avatar con onClick para abrir el modal */}
            <Avatar
              sx={{width: '100px', height: '100px', cursor: 'pointer'}}
              src={
                currentUser && currentUser.profilePic
                  ? `http://localhost:5000/uploads/${currentUser.profilePic}`
                  : '/assets/images/profilepic_default.png'
              }
              alt="imagen perfil"
              onClick={() => navigate('/profile')}
            />
            <CustomButton variant="outlined" onClick={logout} sx={{ color: 'white', borderColor: 'white' }}><FontAwesomeIcon sx={{ width: '50%' }}style={{ fontSize: '25px', color: 'gray' }} icon={faXmark} /></CustomButton>
        </Box>
        
      
          
      {/* Modal para editar usuario */}
      <Modal open={openUserEdit} onClose={handleCloseUserEdit}>
        <Box sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#fff",
          borderRadius: 2,
          boxShadow: 24,
          p: 2,
          minWidth: 350,
        }}>
          <UserEdit onClose={handleCloseUserEdit} />
        </Box>
      </Modal>
    </CustomMenu>
  );
}

export default Menu2;