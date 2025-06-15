import { useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import { Avatar, Box, Typography, Card, CardContent, Button } from '@mui/material';
import useFollow from '../hooks/useFollow';
import { useNavigate } from 'react-router-dom';
import baseUrl from '../config.js';

function OtherFollowers({ userId: propUserId }) {
    const { t } = useTranslation();
    const { token } = useContext(UserContext);
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
            alert(t('userFollowed'));
        } catch (err) {
            console.error('Error following user:', err);
            alert(t('errorFollowingUser'));
        }
    };

    const isFollowing = (id) => following.some(f => f.followed && f.followed._id === id);

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 2, width: '45%' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('usersfollowed')}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                    {following.map(f => (
                        f.followed ? (
                            <Card key={f.followed._id} sx={{ width: '500px', p: 2, display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                    src={f.followed.profilePic ? `${baseUrl}/uploads/${f.followed.profilePic}` : '/default-avatar.png'}
                                    alt={f.followed.name}
                                    sx={{ width: 56, height: 56, mr: 2 }}
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
                                {/* Botón solo si es tu propio perfil */}
                                {!propUserId && (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleUnfollow(f.followed._id)}
                                    >
                                        {t('unfollow')}
                                    </Button>
                                )}
                            </Card>
                        ) : null
                    ))}
                </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', alignItems: 'center', gap: 2, width: '45%' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('usersfollowers')}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                    {followers.map(f => (
                        f.follower ? (
                            <Card key={f.follower._id} sx={{ width: '500px', p: 2, display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                    src={
                                        f.follower.profilePic
                                            ? `${baseUrl}/uploads/${f.follower.profilePic}`
                                            : '/default-avatar.png'
                                    }
                                    alt={f.follower.name}
                                    sx={{ width: 56, height: 56, mr: 2 }}
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
                                {!propUserId && (
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
                            </Card>
                        ) : null
                    ))}
                </Box>
            </Box>
        </Box>
    );
}

export default OtherFollowers;