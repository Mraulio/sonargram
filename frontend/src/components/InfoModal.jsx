// src/components/InfoModal.js
import React, { useEffect, useState, useContext } from 'react';
import {
  Modal, Paper, Stack, Typography, Divider, IconButton,
  CircularProgress, Dialog, DialogTitle, DialogContent,
  List, ListItem, ListItemButton, ListItemText, Button, Box
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import ItemRow from './ItemRow';
import ItemList from './ItemList';
import useList from '../hooks/useList';
import { UserContext } from "../context/UserContext";
import { useTranslation } from 'react-i18next';
import { showToast } from '../utils/toast';
import useListFollowers from '../hooks/useListFollowers'; // si no lo tienes aún

const style = {
  position: 'absolute',
  top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 550, bgcolor: 'background.paper',
  borderRadius: 2, boxShadow: 24,
  p: 3, maxHeight: '100vh', overflowY: 'auto',
  width: { xs: '90vw', md: '40vw' }
};

const InfoModal = ({ open, onClose, type, data, ratingProps, favoriteProps, handleUnfollowList, handlefollowList }) => {
  const [listItems, setListItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();  // Hook para obtener las traducciones
  const [ creatorList, setCreatorList ] = useState([]);
  const { token, user } = useContext(UserContext);
  const [localFollowedLists, setLocalFollowedLists] = useState([]);
  const {
    fetchListsByUser,
    userLists,
    addSong,
    fetchListById,
    removeSong,
    loading: listLoading
  } = useList(token);
  const {
  followedLists,
  fetchFollowedLists
} = useListFollowers(token);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch user lists when modal opens
  useEffect(() => {
    if (modalOpen && user?.userId) {
      fetchListsByUser(user.userId);
    }
  }, [modalOpen, user, fetchListsByUser]);

  // Handle Add to List Modal actions
  const handleAddClick = (song) => {
    setSelectedSong(song);
    setMessage("");
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedSong(null);
    setMessage("");
  };

  const handleAddToList = async (list) => {
    if (!selectedSong) return;
    setAdding(true);
    try {
      await addSong(
        list._id,
        selectedSong.id,
        selectedSong.title,
        selectedSong.artist,
        selectedSong.coverUrl,
        selectedSong.releaseDate,
        selectedSong.duration
      );
      setMessage("Canción añadida correctamesdsdnte.");
    } catch (err) {
      setMessage("Error al añadir la canción.");
    } finally {
      setAdding(false);
    }
  };
  const handleDeleteSongList = async (listId, musicbrainzId) => {
  try {
    await removeSong(listId, musicbrainzId);
    showToast(t('songRemovedFromList'), "success");

    // Actualiza el estado local eliminando la canción
    setListItems(prev => prev.filter(song =>
      (song.id || song.musicbrainzId || song._id) !== musicbrainzId
    ));

    // Opcional: actualiza listas del usuario si es necesario en otros lugares
    if (user?.userId) {
      await fetchListsByUser(user.userId);
    }

  } catch (err) {
    showToast(t('errorDeletingListSong'), "error");
    console.error(err);
  }
};

  // Fetch list data & favoriteCounts efficiently
  useEffect(() => {
    const fetchListData = async () => {
      setLoading(true);
     
      try {
        if (data.isFavoriteList == true){
                const songs = data.songs || [];
                
                setListItems(songs);
          

              const ids = songs.map(song => song.id || song.musicbrainzId || song._id);
              if (ids.length === 0) return;

              ratingProps.fetchMultipleItemRatings(ids);

              const missingIds = ids.filter(id => !(id in favoriteProps.favoriteCounts));
              if (missingIds.length === 0) return;

              const countsArray = await Promise.all(missingIds.map(id => favoriteProps.getFavoriteCount(id)));
              const countsMap = {};
              let changed = false;

              missingIds.forEach((id, idx) => {
                const count = countsArray[idx] || 0;
                if (favoriteProps.favoriteCounts[id] !== count) {
                  countsMap[id] = count;
                  changed = true;
                }
              });

              if (changed) {
                favoriteProps.setFavoriteCounts(prev => ({
                  ...prev,
                  ...countsMap
                }));
              }
              }
        else if (data.isRatingList == true){
                const songs = data.songs || [];
                setListItems(songs);

              const ids = songs.map(song => song.id || song.musicbrainzId || song._id);
              if (ids.length === 0) return;

              ratingProps.fetchMultipleItemRatings(ids);

              const missingIds = ids.filter(id => !(id in favoriteProps.favoriteCounts));
              if (missingIds.length === 0) return;

              const countsArray = await Promise.all(missingIds.map(id => favoriteProps.getFavoriteCount(id)));
              const countsMap = {};
              let changed = false;

              missingIds.forEach((id, idx) => {
                const count = countsArray[idx] || 0;
                if (favoriteProps.favoriteCounts[id] !== count) {
                  countsMap[id] = count;
                  changed = true;
                }
              });

              if (changed) {
                favoriteProps.setFavoriteCounts(prev => ({
                  ...prev,
                  ...countsMap
                }));
              }
        }
        else{
           const res = await fetchListById(data._id);
          const songs = res.songs || [];
          const creator = res.creator || data.creator;
          setListItems(songs);
          setCreatorList(creator._id);

        const ids = songs.map(song => song.id || song.musicbrainzId || song._id);
        if (ids.length === 0) return;

        ratingProps.fetchMultipleItemRatings(ids);

        const missingIds = ids.filter(id => !(id in favoriteProps.favoriteCounts));
        if (missingIds.length === 0) return;

        const countsArray = await Promise.all(missingIds.map(id => favoriteProps.getFavoriteCount(id)));
        const countsMap = {};
        let changed = false;

        missingIds.forEach((id, idx) => {
          const count = countsArray[idx] || 0;
          if (favoriteProps.favoriteCounts[id] !== count) {
            countsMap[id] = count;
            changed = true;
          }
        });

        if (changed) {
          favoriteProps.setFavoriteCounts(prev => ({
            ...prev,
            ...countsMap
          }));
        }
        }
       
      } finally {
        setLoading(false);
      }
    };

    if (type === 'list' && data?._id) {
      fetchListData();
    }
  }, [type, data?._id]);


useEffect(() => {
  if (type === 'list' && user?.userId) {
    fetchFollowedLists(user.userId).then(() => {
      setLocalFollowedLists([...followedLists]);
    });
  }
}, [type, user?.userId, fetchFollowedLists, followedLists]);

const isFollowedByUser = (listId) => {
  return localFollowedLists.some(list => list._id === listId);
};
const isOwnedByUser = () => {
  return creatorList === user?.userId;
};

useEffect(() => {
  if (Array.isArray(followedLists)) {
    setLocalFollowedLists(followedLists);
  }
}, [followedLists]);
  if (!open || !data) return null;

  

  return (
    <>
      <Modal open={open} onClose={onClose} >
        <Paper sx={style}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">{t('detail')} {t(type)}</Typography>
            
            <IconButton size="small" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </IconButton>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          
          {['song', 'album', 'artist'].includes(type) && (
            <ItemRow
              item={data}
              type={type}
              ratingProps={ratingProps}
              favoriteCounts={favoriteProps.favoriteCounts}
              isFavorite={favoriteProps.isFavorite}
              onToggleFavorite={favoriteProps.handleFavoriteToggle}
              compact={false}
              showAddButton={type === 'song'}
              onAddClick={handleAddClick}
              
            />
          )}

          {type === 'list' && (
            <>
            <Box sx={{width:'100%', display: 'flex', justifyContent: 'space-between'}}>
              <Typography variant="subtitle1" gutterBottom>
                {t('list')}: {data.name}
              </Typography>
              {isFollowedByUser(data._id) && !isOwnedByUser() && data.isFavoriteList !== true && data.isRatingList !== true && (
                <Button 
                  sx={{ fontSize: '0.6rem' }}
                  variant="contained"
                onClick={async () => {
                  await handleUnfollowList(data._id);
                  setLocalFollowedLists(prev => prev.filter(list => list._id !== data._id));
                }}
                  color="error"
                >
                  {t('unfollow')}
                </Button>
              )}

              {!isFollowedByUser(data._id) && !isOwnedByUser() && data.isFavoriteList !== true && data.isRatingList !== true && (
                <Button 
                  sx={{ fontSize: '0.6rem', ml: 1 }}
                  variant="contained"
                 onClick={async () => {
                  await handlefollowList(data._id);
                  setLocalFollowedLists(prev => [...prev, { _id: data._id }]);
                }}
                  color="primary"
                >
                  {t('follow')}
                </Button>
              )}
            </Box>
              {loading ? (
                <CircularProgress />
              ) : (
                <ItemList
                  items={listItems}
                  list={data._id}
                  type="song"
                  ratingProps={ratingProps}
                  favoriteCounts={favoriteProps.favoriteCounts}
                  isFavorite={favoriteProps.isFavorite}
                  onToggleFavorite={favoriteProps.handleFavoriteToggle}
                  onDeleteFromList={
                    creatorList === user?.userId && !data.isFavoriteList && !data.isRatingList
                      ? handleDeleteSongList
                      : undefined
}
                />
               
              )}
              
            </>
            
          )}
        </Paper>
      </Modal>

      <Dialog open={modalOpen} onClose={handleClose}>
        <DialogTitle>Añadir "{selectedSong?.title}" a una lista</DialogTitle>
        <DialogContent dividers>
          {listLoading ? (
            <CircularProgress />
          ) : (
            <List>
              {userLists.map((list) => (
                <ListItem key={list._id} disablePadding>
                  <ListItemButton onClick={() => handleAddToList(list)} disabled={adding}>
                    <ListItemText primary={list.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
          {message && (
            <Typography sx={{ mt: 2, color: message.includes("Error") ? "error.main" : "success.main" }}>
              {message}
            </Typography>
          )}
          <Button onClick={handleClose} disabled={adding} sx={{ mt: 2 }}>
            {t('close')}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InfoModal;
