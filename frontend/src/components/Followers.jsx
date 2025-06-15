import { useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Avatar, Box, Typography, Card, CardContent, Button, Divider} from '@mui/material';
import useFollow from '../hooks/useFollow';
import useUser from '../hooks/useUser';
import { useNavigate } from 'react-router-dom';

function Followers({ userId: propUserId }) {
    const { t } = useTranslation();
    const { token, user } = useContext(UserContext);
    const { followers, fetchFollowers, following, fetchFollowing, follow, unfollow } = useFollow(token);
    const navigate = useNavigate();

    // Usa el id recibido por props o el del usuario actual
    const userId = propUserId || user?._id || user?.userId;

    useEffect(() => {
        if (userId) {
            fetchFollowers(userId);
            fetchFollowing(userId);
        }
    }, [userId, fetchFollowers, fetchFollowing]);

    const handleUnfollow = async (followedId) => {
        try {
            await unfollow(followedId);
            if (userId) {
                await fetchFollowers(userId);
                await fetchFollowing(userId);
            }
        } catch (err) {
            console.error(t('errorFetchingFollowers'), err);
        }
    };

    const handleFollow = async (followedId) => {
        try {
            await follow(followedId);
            if (userId) {
                await fetchFollowers(userId);
                await fetchFollowing(userId);
            }
            alert(t('userFollowed'));
        } catch (err) {
            console.error(t('errorFollowingUser'), err);
            alert(t('errorFollowingUser'));
        }
    };

    const isFollowing = (id) => following.some(f => f.followed && f.followed._id === id);

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex',  flexDirection: 'column', gap: 2,  alignItems: 'center', mt: 2, width: '45%', height: '40vh', overflowY: 'auto' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('usersfollowed')}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                    {following.map(f => (
                        f.followed ? (
                            <Card key={f.followed._id} sx={{ width: '650px', p: 2, display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                    src={f.followed.profilePic ? `http://localhost:5000/uploads/${f.followed.profilePic}` : '/default-avatar.png'}
                                    alt={f.followed.name}
                                    sx={{ width: 60, height: 60, mr: 2 }}
                                />
                                <CardContent sx={{width: '100%'}}>
                                    <Typography
                                        variant="h5"
                                        sx={{ mb: 1, cursor: 'pointer' }}
                                        onClick={() => navigate(`/userresult/${f.followed._id}`)}
                                    >
                                        {f.followed.name}
                                    </Typography>
                                    <Divider/>
                                    <Box sx={{ display: 'flex', gap: 3, mt: 1, justifyContent:'space-between' }}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">{t('since')}: {new Date(f.createdAt).toLocaleDateString()}</Typography>
                                            <Typography variant="body2" color="text.secondary">{t('bio')}: {f.followed.bio}</Typography>
                                        </Box>
                                {!propUserId && (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => handleUnfollow(f.followed._id)}
                                    >
                                        {t('unfollow')}
                                    </Button>
                                )}
                                    </Box>
                                </CardContent>
                            </Card>
                        ) : null
                    ))}
                </Box>
            </Box>

            <Box sx={{  display: 'flex',  flexDirection: 'column', gap: 2,  alignItems: 'center', mt: 2, width: '45%', height: '40vh', overflowY: 'auto'  }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('usersfollowers')}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                    {followers.map(f => (
                        f.follower ? (
                            <Card key={f.follower._id} sx={{ width: '650px', p: 2, display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                    src={
                                        f.follower.profilePic
                                            ? `http://localhost:5000/uploads/${f.follower.profilePic}`
                                            : '/default-avatar.png'
                                    }
                                    alt={f.follower.name}
                                    sx={{ width: 60, height: 60, mr: 2 }}
                                />
                                <CardContent sx={{width: '100%'}}>
                                    <Typography
                                        variant="h5"
                                        sx={{ mb: 1, cursor: 'pointer' }}
                                        onClick={() => navigate(`/userresult/${f.follower._id}`)}
                                    >
                                        {f.follower.name}
                                    </Typography>
                                    <Divider/>
                                    <Box sx={{ display: 'flex', gap: 3, mt: 1, justifyContent:'space-between' }}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">{t('since')}: {new Date(f.createdAt).toLocaleDateString()}</Typography>
                                            <Typography variant="body2" color="text.secondary">{t('bio')}: {f.follower.bio}</Typography>
                                        </Box>
                                
                                {!propUserId && (
                                    isFollowing(f.follower._id) ? (
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleUnfollow(f.follower._id)}
                                        >
                                            {t('unfollow')}
                                        </Button>
                                    ) : (
                                        <Button
                                            sx={{ backgroundColor: '#d63b1f', color: 'white'}}
                                            variant="contained"
                                            onClick={() => handleFollow(f.follower._id)}
                                        >
                                            {t('follow')}
                                        </Button>
                                    )
                                )}
                                        </Box>
                                </CardContent>
                            </Card>
                        ) : null
                    ))}
                </Box>
            </Box>
        </Box>
    );
}

export default Followers;