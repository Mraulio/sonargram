import { useEffect, useState, useContext, useCallback } from 'react';
import { UserContext } from '../context/UserContext';
import { useParams } from 'react-router-dom';
import { Typography, Card, CardContent, Box, Avatar, Divider, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import OtherFollowers from '../components/OtherFollowers';
import useUser from '../hooks/useUser';
import Menu from '../components/Menu';
import OtherLists from '../components/OtherLists'
import baseUrl from '../config.js';

const userCard= styled(Card)`
`;
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
      
        <Typography variant="h6">{t('loading')}</Typography>
      </Box>
    );
  }

  if (!userResult) {
    return (
      <Box sx={{ mt: 8, textAlign: 'center' }}>
  
        <Typography variant="h6">{t('userNotFound')}</Typography>
      </Box>
    );
  }

  return (
    <Box style={{ display: 'flex', flexDirection: 'column'}}>
    <Menu/>
      <Box sx={{ display: 'flex', flexDirection:'column', alignItems:'center',minHeight: '100vh', width: '100vw'}}>
        <Card sx={{ display: 'flex', flexDirection:'column', alignItems:'center', justifyContent: 'space-around', width: '400px', marginBottom: '50px', marginTop: '50px',padding: 10}}>
        <Typography variant="h5" gutterBottom>
          {t('publicProfile')}
        </Typography>
            <Avatar
                src={
                userResult.profilePic
                    ? `${baseUrl}/uploads/${userResult.profilePic}`
                    : '/assets/images/profilepic_default.png'
                }
                alt="Profile Pic"
                sx={{ width: 200, height: 200, mr: 2 }}
            />
            <CardContent sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems:'center', gap: 5 }}>
                <Typography variant="h4">{userResult.name}</Typography>
                <Divider sx={{ width: '100%'}}/>
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">{t('userName')}: {userResult.username}</Typography>
                  <Typography variant="body2" color="text.secondary">email: {userResult.email}</Typography>
                  <Typography variant="body2" color="text.secondary">{t('createDate')}: {userResult?.createdAt?.slice(0,10)}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">{t('bio')}: {userResult.bio || t('noBio')}</Typography>
                </Box>
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