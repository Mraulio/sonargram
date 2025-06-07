import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Avatar, Box, Button, Link, Modal, Typography } from '@mui/material';
import { ThemeContext } from '../context/ThemeContext';
import useUser from '../hooks/useUser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faListUl, faHeart, faMedal, faMoon, faSun, faXmark } from '@fortawesome/free-solid-svg-icons';
import UserEdit from './UserEdit'; // importa tu componente de edición
import { styled } from '@mui/material/styles';
import i18n from '../i18n';
import logo from '../logo.svg'; // Asegúrate de tener una imagen de logo

const CustomMenu = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 0 20px 0;
  width: 180px;
  position: fixed;
  top: 25px;
  left: 25px;
  background-color: #3e4a4c99;
  gap: 30px;
  border-radius: 10px;

  @media (min-width: 601px) and (max-width: 960px) {
    width: 120px;
  }

  @media (max-width: 600px) {
    flex-direction: row;
    width: 500px;
    margin: 0;
    position: fixed;
    bottom: 25px;
    left: 50%;
    transform: translateX(-50%);
    top: auto;
    border-radius: 10px;
    z-index: 1300;
    padding: 0 15px 0 15px;
    gap: 15px;

  `;
const CustomLink = styled(Link)`
    color: white;
    text-decoration: none;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    width: 80%;
    span{
      width: 50%;
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
    <CustomMenu>
      <Link href="/DashBoard" ><img src={logo} alt="Logo" style={{ width: "80px", height: "auto", marginTop:'15px' }} /></Link>
      {/* Avatar con onClick para abrir el modal */}
      <Avatar
        sx={{width: '50px', height: '50px', cursor: 'pointer'}}
        src={
          currentUser && currentUser.profilePic
            ? `http://localhost:5000/uploads/${currentUser.profilePic}`
            : '/assets/images/profilepic_default.png'
        }
        alt="imagen perfil"
        onClick={handleOpenUserEdit}
      />
      <CustomLink href="/community" underline="hover"><FontAwesomeIcon style={{ fontSize: '25px' }} icon={faUsers} /><span>{t('community')}</span></CustomLink>
      <CustomLink href="/lists" underline="hover" ><FontAwesomeIcon sx={{ width: '50%' }}style={{ fontSize: '25px' }} icon={faListUl} /><span>{t('lists')}</span></CustomLink>
      <CustomLink href="" underline="hover"><FontAwesomeIcon sx={{ width: '50%' }}style={{ fontSize: '25px' }} icon={faHeart} /><span>{t('favorites')}</span></CustomLink>
      <CustomLink href="" underline="hover"><FontAwesomeIcon sx={{ width: '50%' }}style={{ fontSize: '25px' }} icon={faMedal} /><span>{t('ratings')}</span></CustomLink>
      {role === 'admin' && <Link sx={{color: 'red'}} href="/admin" underline="hover">Admin</Link>}
      
      <CustomButton variant="outlined" onClick={logout} sx={{ color: 'white', borderColor: 'white' }}><FontAwesomeIcon sx={{ width: '50%' }}style={{ fontSize: '25px', color: 'red' }} icon={faXmark} /></CustomButton>

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