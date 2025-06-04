import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Avatar, Box, Button, Link, Modal } from '@mui/material';
import { ThemeContext } from '../context/ThemeContext';
import apiClient from '../api/internal/apiClient';
import useUser from '../hooks/useUser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faListUl } from '@fortawesome/free-solid-svg-icons';
import UserEdit from './UserEdit'; // importa tu componente de edición

function Menu2() {
  const { t } = useTranslation();
  const { token, role, logout } = useContext(UserContext);
  const [currentUser, setCurrentUser] = useState(null);
  const { getCurrentUser } = useUser(token);

  // Estado para el modal
  const [openUserEdit, setOpenUserEdit] = useState(false);
  const handleOpenUserEdit = () => setOpenUserEdit(true);
  const handleCloseUserEdit = () => setOpenUserEdit(false);

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
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'center', gap: 4, mt: 2, color: 'white', width: '5vw', height:'100%', top: '120px', left: '0', position: 'fixed', backgroundColor:'blue' }}>
      <Link href="/DashBoard" ><img src="" alt="" /></Link>
      {/* Avatar con onClick para abrir el modal */}
      <Avatar
        sx={{width: '70px', height: '70px', cursor: 'pointer'}}
        src={
          currentUser && currentUser.profilePic
            ? `http://localhost:5000/uploads/${currentUser.profilePic}`
            : '/assets/images/profilepic_default.png'
        }
        alt="imagen perfil"
        onClick={handleOpenUserEdit}
      />
      <Link sx={{color: 'white'}} href="/community" underline="hover"><FontAwesomeIcon style={{ fontSize: '35px' }} icon={faUsers} /></Link>
      <Link sx={{color: 'white'}} href="/lists" underline="hover" ><FontAwesomeIcon style={{ fontSize: '35px' }} icon={faListUl} /></Link>
      {role === 'admin' && <Link sx={{color: 'red'}} href="/admin" underline="hover">Admin</Link>}
      <Button variant="outlined" onClick={logout} sx={{ color: 'white', borderColor: 'white' }}>X</Button>

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
    </Box>
  );
}

export default Menu2;