import { useEffect, useState, useContext, useCallback } from 'react';
import { UserContext } from '../context/UserContext';
import { useParams } from 'react-router-dom';
import { Typography, Card, CardContent, Box, Avatar, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import OtherFollowers from '../components/OtherFollowers';
import useUser from '../hooks/useUser';
import Menu2 from '../components/Menu2';
import OtherLists from '../components/OtherLists'
import baseUrl from '../config.js';

function UserResult() {
  const { t } = useTranslation();
  const { id } = useParams(); // <-- id del usuario en la URL
  const [userResult, setUserResult] = useState(null);
  const { token, user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const { getUserById } = useUser(token);
  console.log('base urlssss:', baseUrl);
 useEffect(() => {
  const fetchUser = async () => {
    setLoading(true);
    try {
      const userData = await getUserById(id);
      setUserResult(userData);
    } catch (err) {
      setUserResult(null);
    }
    setLoading(false);
  };
  if (id) fetchUser();
// Solo depende de id y token
}, [id, token]);


  if (loading) {
    return (
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Menu2 />
        <Typography variant="h6">{t('loading')}</Typography>
      </Box>
    );
  }

  if (!userResult) {
    return (
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Menu2 />
        <Typography variant="h6">{t('userNotFound')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Menu2 />
      <Box sx={{ height:'100vh' }}>
        <Typography variant="h5" gutterBottom>
          {t('publicProfile')}
        </Typography>
        <Card sx={{ display: 'flex', alignItems: 'center', p: 2, mb: 2, width: 400 }}>
            <Avatar
                src={
                userResult.profilePic
                    ? `${baseUrl}/uploads/${userResult.profilePic}`
                    : '/assets/images/profilepic_default.png'
                }
                alt="Profile Pic"
                sx={{ width: 100, height: 100, mr: 2 }}
            />
            <CardContent>
                <Typography variant="h6">{userResult.name}</Typography>
                <Typography variant="body2" color="text.secondary">{userResult.email}</Typography>
                <Typography variant="body2" color="text.secondary">{t('bio')}: {userResult.bio || t('noBio')}</Typography>
            </CardContent>
            </Card>
            <Divider sx={{ my: 2 }} />
        {/* Followers de este usuario */}
        <OtherFollowers userId={userResult.id} />
        <OtherLists userId={userResult.id} />
      </Box>
    </Box>
  );
}

export default UserResult;