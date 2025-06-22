import { useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import { Avatar, Box, Typography, Card, CardContent, Button, styled } from '@mui/material';
import useFollow from '../hooks/useFollow';
import { useNavigate } from 'react-router-dom';
import baseUrl from '../config.js';
import { showToast } from '../utils/toast.js';

const FollowBox = styled(Box)`
    display: flex;
    flex-wrap: wrap; 
    justify-content: center; 
    gap: 2;
    width: 100%;

    @media (max-width: 960px) {
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    width: 100vw;
  }

    `;
const FollowBoxContent = styled(Box)`
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    margin-top: 10px; 
    width: 45%; 
    height: 40vh;
    overflow-y: auto;
    
    @media (max-width: 960px) {
    width: 95%
    }

`;

const FollowCard = styled(Card)`
    width: 650px; 
    padding: 15px; 
    display: flex; 
    align-items: center;

    @media (max-width: 960px) {
    width: 95%
    }
`;
function OtherFollowers({ userId: propUserId }) {
    const { t } = useTranslation();
    const { token, user } = useContext(UserContext); // Asegúrate de que `user` contiene el usuario logueado
    const { followers, fetchFollowers, following, fetchFollowing, follow, unfollow } = useFollow(token);
    const navigate = useNavigate();

    useEffect(() => {
        if (propUserId) {
            fetchFollowers(propUserId);
            fetchFollowing(propUserId);
        }
    }, [propUserId, fetchFollowers, fetchFollowing]);

    const handleUnfollow = async (followedId) => {
        try {
            await unfollow(followedId);
            if (propUserId) {
                await fetchFollowers(propUserId);
                await fetchFollowing(propUserId);
            }
        } catch (err) {
            console.error('Error fetching followers:', err);
        }
    };

    const handleFollow = async (followedId) => {
        try {
            await follow(followedId);
            if (propUserId) {
                await fetchFollowers(propUserId);
                await fetchFollowing(propUserId);
            }
            showToast(t('userFollowed'), 'success');
        } catch (err) {
            console.error(t('errorFollowingUser'), err);
            showToast(t('errorFollowingUser'), 'error');
        }
    };

    const isFollowing = (id) => following.some(f => f.followed && f.followed._id === id);

    return (
        <FollowBox >

            <FollowBoxContent>
                <Typography variant="h4" sx={{ mb: 2 }}>{t('usersfollowed')}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                    {following.map(f => (
                        f.followed ? (
                            <FollowCard key={f.followed._id}>
                                <Avatar
                                    src={f.followed.profilePic ? `${baseUrl}/uploads/${f.followed.profilePic}` : '/default-avatar.png'}
                                    alt={f.followed.name}
                                    sx={{ width: 60, height: 60, mr: 2 }}
                                />
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        sx={{ mb: 1, cursor: 'pointer', textDecoration: 'underline' }}
                                        onClick={() => navigate(`/userresult/${f.followed._id}`)}
                                    >
                                        {f.followed.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">{t('since')}: {new Date(f.createdAt).toLocaleDateString()}</Typography>
                                    <Typography variant="body2" color="text.secondary">{t('bio')}: {f.followed.bio}</Typography>
                                </CardContent>

                                {!propUserId && f.followed._id !== user.userId && (
                                    isFollowing(f.followed._id) ? (
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleUnfollow(f.followed._id)}
                                        >
                                            {t('unfollow')}
                                        </Button>
                                    ) : (
                                        <Button
                                            sx={{ backgroundColor: '#d63b1f', color: 'white' }}
                                            variant="contained"
                                            onClick={() => handleFollow(f.followed._id)}
                                        >
                                            {t('follow')}
                                        </Button>
                                    )
                                )}
                            </FollowCard>
                        ) : null
                    ))}
                </Box>
            </FollowBoxContent>

            {/* USUARIOS QUE SIGUEN AL PERFIL */}
            <FollowBoxContent >
                <Typography variant="h4" sx={{ mb: 2 }}>{t('usersfollowers')}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                    {followers.map(f => (
                        f.follower ? (
                            <FollowCard key={f.follower._id} >
                                <Avatar
                                    src={
                                        f.follower.profilePic
                                            ? `${baseUrl}/uploads/${f.follower.profilePic}`
                                            : '/default-avatar.png'
                                    }
                                    alt={f.follower.name}
                                    sx={{ width: 60, height: 60, mr: 2 }}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{ mb: 1, cursor: 'pointer', textDecoration: 'underline' }}
                                        onClick={() => navigate(`/userresult/${f.follower._id}`)}
                                    >
                                        {f.follower.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">{t('since')}: {new Date(f.createdAt).toLocaleDateString()}</Typography>
                                    <Typography variant="body2" color="text.secondary">{t('bio')}: {f.follower.bio}</Typography>
                                </CardContent>
                                {!propUserId && f.follower._id !== user.userId && (
                                    isFollowing(f.follower._id) ? (
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleUnfollow(f.follower._id)}
                                        >
                                            {t('unfollow')}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            onClick={() => handleFollow(f.follower._id)}
                                        >
                                            {t('follow')}
                                        </Button>
                                    )
                                )}
                            </FollowCard>
                        ) : null
                    ))}
                </Box>
            </FollowBoxContent>
        </FollowBox>
    );
}

export default OtherFollowers;
