import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext.js';
import {
  Avatar,
  Box,
  Button,
  Modal,
  Typography,
  TextField,
  useMediaQuery
} from '@mui/material';
import { ThemeContext } from '../context/ThemeContext.js';
import useUser from '../hooks/useUser.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faListUl,
  faHeart,
  faMedal,
  faMoon,
  faSun,
  faXmark,
  faMagnifyingGlass
} from '@fortawesome/free-solid-svg-icons';
import UserEdit from './UserEdit.jsx';
import { styled } from '@mui/material/styles';
import i18n from '../i18n.js';
import { useNavigate } from 'react-router-dom';
import baseUrl from '../config.js';

const CustomMenu = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  top: 25px;
  gap: 50px;
  border-bottom: solid 1px;

  @media (max-width: 960px) {
    display: none;
  }
`;

const CustomMenuMobile = styled(Box)`
  display: none;

  @media (max-width: 960px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    top: 25px;
    border-bottom: solid 1px;
  }
`;

const CustomLink = styled(Box)`
  text-decoration: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const MenuLogo = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  text-decoration: none;
  gap: 10px;
  margin-top: 10px;
  margin-bottom: 10px;

  & img {
    width: 120px;
    margin-left: 25px;
  }

  @media (max-width: 960px) {
    & > .MuiTypography-root {
      display: none;
    }

    & > img {
      width: 60px;
    }
  }
`;

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      border: 'none',
      borderBottom: `2px solid`,
      borderRadius: 0
    },
    '&:hover fieldset': {
      borderBottom: `2px solid`
    },
    '&.Mui-focused fieldset': {
      borderBottom: `2px solid`
    },
    color: theme.palette.text.primary
  },
  '& input': {
    color: theme.palette.text.primary
  },
  '& label': {
    color: theme.palette.text.primary
  },
  '& label.Mui-focused': {
    color: theme.palette.primary.main
  },
  width: '450px'
}));

function Menu() {
  const { t } = useTranslation();
  const { token, role, logout } = useContext(UserContext);
  const [currentUser, setCurrentUser] = useState(null);
  const { getCurrentUser } = useUser(token);

  const [openUserEdit, setOpenUserEdit] = useState(false);
  const handleOpenUserEdit = () => setOpenUserEdit(true);
  const handleCloseUserEdit = () => setOpenUserEdit(false);

  const { theme, toggleTheme, mode } = useContext(ThemeContext);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const [showSearchExpanded, setShowSearchExpanded] = useState(false);
  const isTabletOrMobile = useMediaQuery('(max-width:960px)');

  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Error fetching current user', err);
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
    <Box>
      <CustomMenu>
        <MenuLogo onClick={() => navigate('/dashboard')}>
          <img src="assets/images/logo.svg" alt="Logo" />
          <Typography
            sx={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 800,
              fontSize: '2rem',
              color: theme.palette.text.primary
            }}
          >
            Sonargram
          </Typography>
        </MenuLogo>

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            width: '60%',
            justifyContent: 'end',
            alignItems: 'center',
            gap: 3
          }}
        >
          <Button onClick={() => navigate('/search')}>
            <FontAwesomeIcon
              style={{ fontSize: 24, color: theme.palette.text.primary }}
              icon={faMagnifyingGlass}
            />
          </Button>

          <CustomLink
            sx={{ color: theme.palette.text.primary }}
            onClick={() => navigate('/lists')}
          >
            <span>{t('lists')}</span>
          </CustomLink>

          <CustomLink
            sx={{ color: theme.palette.text.primary }}
            onClick={() => navigate('/tops')}
          >
            {t('tops')}
          </CustomLink>

          {role === 'admin' && (
            <CustomLink
              sx={{ color: theme.palette.text.primary }}
              onClick={() => navigate('/admin')}
            >
              Admin
            </CustomLink>
          )}

          <Avatar
            sx={{
              width: '80px',
              height: '80px',
              cursor: 'pointer',
              marginTop: '5px',
              marginBottom: '5px'
            }}
            src={
              currentUser?.profilePic
                ? `${baseUrl}/uploads/${currentUser.profilePic}`
                : '/assets/images/profilepic_default.png'
            }
            alt="imagen perfil"
            onClick={() => navigate('/profile')}
          />

          <Button
            onClick={logout}
            sx={{ color: theme.palette.text.primary, width: '30px', fontSize: '0.5rem' }}
          >
            {t('logout')}
          </Button>
        </Box>

        <Modal open={openUserEdit} onClose={handleCloseUserEdit}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#fff',
              borderRadius: 2,
              boxShadow: 24,
              p: 2,
              minWidth: 350
            }}
          >
            <UserEdit onClose={handleCloseUserEdit} />
          </Box>
        </Modal>
      </CustomMenu>

      <CustomMenuMobile>
        <MenuLogo onClick={() => navigate('/dashboard')}>
          <img src="assets/images/logo.svg" alt="Logo" />
          <Typography
            sx={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 800,
              fontSize: '2rem'
            }}
          >
            Sonargram
          </Typography>
        </MenuLogo>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'end',
            alignItems: 'center',
            gap: 3
          }}
        >
          {isTabletOrMobile ? (
            <>
              {showSearchExpanded ? (
                <Button onClick={() => setShowSearchExpanded(false)}>
                  <FontAwesomeIcon
                    style={{ fontSize: 12, color: '#3e4a4c' }}
                    icon={faXmark}
                  />
                </Button>
              ) : (
                <Button onClick={() => navigate('/search')}>
                  <FontAwesomeIcon
                    style={{ fontSize: 16, color: '#3e4a4c' }}
                    icon={faMagnifyingGlass}
                  />
                </Button>
              )}
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '30vw'
              }}
            >
              <CustomTextField
                label={t('searchBar')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                margin="normal"
              />
              <Button onClick={handleSearchClick}>
                <FontAwesomeIcon
                  style={{ fontSize: 14, color: '#3e4a4c' }}
                  icon={faMagnifyingGlass}
                />
              </Button>
            </Box>
          )}

          <CustomLink onClick={() => navigate('/lists')}>
            <FontAwesomeIcon style={{ fontSize: 12, color: '#3e4a4c' }} icon={faListUl} />
          </CustomLink>

          <CustomLink onClick={() => navigate('/tops')}>
            <FontAwesomeIcon style={{ fontSize: 12, color: '#3e4a4c' }} icon={faMedal} />
          </CustomLink>

          {role === 'admin' && (
            <CustomLink sx={{ color: 'red' }} onClick={() => navigate('/admin')}>
              Admin
            </CustomLink>
          )}

          <Avatar
            sx={{
              width: '60px',
              height: '60px',
              cursor: 'pointer',
              marginTop: '5px',
              marginBottom: '5px'
            }}
            src={
              currentUser?.profilePic
                ? `${baseUrl}/uploads/${currentUser.profilePic}`
                : '/assets/images/profilepic_default.png'
            }
            alt="imagen perfil"
            onClick={() => navigate('/profile')}
          />

          <Button
            onClick={logout}
            sx={{
              color: 'gray',
              borderColor: 'gray',
              width: '30px',
              fontSize: 10
            }}
          >
            <FontAwesomeIcon
              style={{ fontSize: 24, color: '#3e4a4c' }}
              icon={faXmark}
            />
          </Button>
        </Box>
      </CustomMenuMobile>
    </Box>
  );
}

export default Menu;
