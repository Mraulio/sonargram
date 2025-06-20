import { useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Avatar, Box, Typography, Card, CardContent, Button, Divider, styled} from '@mui/material';
import useFollow from '../hooks/useFollow';
import useUser from '../hooks/useUser';
import { useNavigate } from 'react-router-dom';
import baseUrl from '../config.js';

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
    width: 100%;
  }

    `;
const FollowBoxContent = styled(Box)`
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    margin-top: 10px; 
    width: 50%; 
    min-height: 40vh;
    
    @media (max-width: 960px) {
    width: 95%
    }

`;

const FollowCard = styled(Card)`
    width: 100%; 
    padding: 15px; 
    display: flex; 
    align-items: center;

    @media (max-width: 960px) {
    width: 95%
    }
`;

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
        <FollowBox>
            <FollowBoxContent> 
                <Typography variant="h6" sx={{ mb: 2 }}>{t('usersfollowed')}</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 2, overFlowY: 'auto', width: '80%' }}>
                    {following.map(f => (
                        f.followed ? (
                            <FollowCard key={f.followed._id} >
                                <Avatar
                                    src={f.followed.profilePic ? `${baseUrl}/uploads/${f.followed.profilePic}` : '/default-avatar.png'}
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
                                            <Typography variant="body2" color="text.secondary">email: {f.followed.email}</Typography>
                                            <Typography variant="body2" color="text.secondary">{t('since')}: {new Date(f.followed.createdAt).toLocaleDateString()}</Typography>
                                            <Typography variant="body2" color="text.secondary">{t('bio')}: {f.followed.bio}</Typography>
                                        </Box>
                                {!propUserId && (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => handleUnfollow(f.followed._id)}
                                        sx={{ mt: 2, width: '20%', fontSize: '0.6rem', height: '10%' }}
                                    >
                                        {t('unfollow')}
                                        
                                    </Button>
                                )}
                                    </Box>
                                </CardContent>
                            </FollowCard>
                        ) : null
                    ))}
                </Box>
            </FollowBoxContent>

            <FollowBoxContent >
                <Typography variant="h6" sx={{ mb: 2 }}>{t('usersfollowers')}</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 2, overflowY: 'auto', width: '80%' }}>
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
                                            <Typography variant="body2" color="text.secondary">email: {f.follower.email}</Typography>
                                            <Typography variant="body2" color="text.secondary">{t('since')}: {new Date(f.follower.createdAt).toLocaleDateString()}</Typography>
                                            <Typography variant="body2" color="text.secondary">{t('bio')}: {f.follower.bio}</Typography>
                                        </Box>
                                
                                {!propUserId && (
                                    isFollowing(f.follower._id) ? (
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleUnfollow(f.follower._id)}
                                            sx={{ mt: 2, width: '20%', fontSize: '0.6rem', height: '10%' }}
                                        >
                                            {t('unfollow')}
                                        </Button>
                                    ) : (
                                        <Button
                                            sx={{ backgroundColor: '#d63b1f', color: 'white', width: '20%', fontSize: '0.6rem', height: '10%'}}
                                            variant="contained"
                                            onClick={() => handleFollow(f.follower._id)}
                                          
                                        >
                                            {t('follow')}
                                        </Button>
                                    )
                                )}
                                        </Box>
                                </CardContent>
                            </FollowCard>
                        ) : null
                    ))}
                </Box>
            </FollowBoxContent>
        </FollowBox>
    );
}

export default Followers;