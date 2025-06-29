import { useEffect, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Card, CardContent, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Button, styled } from '@mui/material';
import { UserContext } from '../context/UserContext';
import useList from '../hooks/useList';
import InfoModal from '../components/InfoModal';
import useFavorites from '../hooks/useFavorites';
import useRatings from '../hooks/useRatings';
import useListFollowers from '../hooks/useListFollowers'
import { showToast } from '../utils/toast';

const ListCard= styled(Card)`
  width: 30vw;
  height: 200px; 
  display: flex;  
  align-items: center;
  @media (max-width: 960px) {
    width:95%;
  }
`;

const ListCardContent= styled(CardContent)`
  display: flex; 
  flex-direction: column;
  justify-content:center;
  width:100%;
`;

function OtherLists({ userId }) {
  const { t } = useTranslation();
  const { token, user } = useContext(UserContext);

  const [modalData, setModalData] = useState({ type: '', data: null });
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  // Estado para el modal de canciones
  const { followers, followersCount, followedLists, followL, unfollow, fetchFollowers, fetchFollowersCount, fetchFollowedLists, setFollowedLists } = useListFollowers(token);
  const { lists, userLists, addSong, setUserLists, fetchAllLists, createNewList, removeList, renameList, fetchListsByUser, removeSong, fetchListById, loading } = useList(token);
  const [openSongsModal, setOpenSongsModal] = useState(false);
  const [selectedListSongs, setSelectedListSongs] = useState([]);
  const [selectedListName, setSelectedListName] = useState('');
  const favoriteProps = useFavorites(token);
  const ratingProps = useRatings(token);
  const [favoriteCounts, setFavoriteCounts] = useState({
        artists: {},
        albums: {},
        songs: {},
      });
      const handleFavoriteToggle = async (id, type, item) => {
  if (favoriteProps.isFavorite(id)) {
    await favoriteProps.removeFavorite(id);
    setFavoriteCounts(prev => ({
      ...prev,
      [id]: Math.max((prev[id] || 1) - 1, 0)
    }));
  } else {
    await favoriteProps.addFavorite(
      id,
      type,
      item?.title || item?.name || "",
      item?.artist || item?.artistName || "",
      item?.coverUrl || "",
      item?.releaseDate || "",
      item?.duration || "",
      item?.externalLinks?.spotifyUrl || "",
      item?.externalLinks?.youtubeUrl || ""
        );
    
    setFavoriteCounts(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  }
};

  useEffect(() => {
    if (userId) {
      fetchListsByUser(userId);
    }
  }, [userId, fetchListsByUser]);

   const handleUnfollowList = async (listId) => {
        try {
          await unfollow(listId);
          if (!user || !user.userId) return;
          await fetchFollowedLists(user.userId);
          setFollowedLists(prev => prev.filter(list => list._id !== listId));
          showToast(t('listUnfollowed'), 'success');
        } catch (err) {
          console.error('Error unfollowing list:', err);
          showToast(t('errorUnfollowingList'), 'error');
        }
      };
      
      const handlefollowList = async (listId) => {
            try {
              await followL(listId);
              if (!user || !user.userId) return;
              await fetchFollowedLists(user.userId);      
              showToast(t('listFollowed'), 'success');
            } catch (err) {
              console.error('Error following list:', err);
              showToast(t('errorFollowingList'), 'error');
            }
          };

  if (loading) {
    return (
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body1">{t('loading')}</Typography>
      </Box>
    );
  }

  if (!userLists || userLists.length === 0) {
    return (
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body1">{t('noListsFound') || 'No lists found.'}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{  display: 'flex',  justifyContent: 'start', flexDirection: 'column', p: 4, flexWrap:'wrap', alignItems:'center' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>{t('userLists')}</Typography>
       <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '95vw' }}>
      {userLists.map(list => (
        <ListCard key={list._id} onClick={() => {
                  setModalData({ type: 'list', data: list });
                  setInfoModalOpen(true);
                }} sx={{ cursor: 'pointer'}}>
          <ListCardContent>
            <Typography
              variant="h5"
              sx={{ cursor: 'pointer' }}
               onClick={() => {
                  setModalData({ type: 'list', data: list });
                  setInfoModalOpen(true);
                }}
            >
              {list.name}
            </Typography>
            <Divider sx={{ width:'100%'}}/>
            <Typography variant="body2" color="text.secondary">
              {t('songs')}: {list.songs.length}
            </Typography>
           
            <Typography variant="body2" color="text.secondary">
              {t('creatorOfList')}: {list.creator?.name || t('unknown')}
            </Typography>
          </ListCardContent>
          <Divider sx={{ my: 1 }} />
        </ListCard>
      ))}
      </Box>
      {/* Modal para mostrar canciones de la lista */}
      <Dialog open={openSongsModal} onClose={() => setOpenSongsModal(false)}>
        <DialogTitle>{selectedListName} - {t('songs')}</DialogTitle>
        <DialogContent>
          <ul>
            {selectedListSongs.length === 0 && (
              <Typography variant="body2" color="text.secondary">{t('noSongs')}</Typography>
            )}
            {selectedListSongs.map((song, index) => (
              <li key={index}>
                {song.title} - {song.artistName}
              </li>
            ))}
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSongsModal(false)} color="primary">
            {t('close') || 'Cerrar'}
          </Button>
        </DialogActions>
      </Dialog>
      <InfoModal
      open={infoModalOpen}
      onClose={() => setInfoModalOpen(false)}
      type={modalData.type}
      data={modalData.data}
      ratingProps={ratingProps}
      favoriteProps={{
        ...favoriteProps,
        favoriteCounts,
        setFavoriteCounts,
        handleFavoriteToggle,
      }}
      handleUnfollowList={handleUnfollowList} // ✅ Se pasa como prop
           handlefollowList={handlefollowList}
    />
    </Box>
  );
}

export default OtherLists;