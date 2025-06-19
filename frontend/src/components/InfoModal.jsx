// src/components/InfoModal.js
import React, { useEffect, useState, useContext } from 'react';
import {
  Modal, Paper, Stack, Typography, Divider, IconButton,
  CircularProgress, Dialog, DialogTitle, DialogContent,
  List, ListItem, ListItemButton, ListItemText, Button,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import ItemRow from './ItemRow';
import ItemList from './ItemList';
import useList from '../hooks/useList';
import { UserContext } from "../context/UserContext";
import { useTranslation } from 'react-i18next';


const style = {
  position: 'absolute',
  top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400, bgcolor: 'background.paper',
  borderRadius: 2, boxShadow: 24,
  p: 3, maxHeight: '100vh', overflowY: 'auto'
};

const InfoModal = ({ open, onClose, type, data, ratingProps, favoriteProps }) => {
  const [listItems, setListItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();  // Hook para obtener las traducciones

  const { fetchListById } = useList();
  const { token, user } = useContext(UserContext);
  const {
    fetchListsByUser,
    userLists,
    addSong,
    loading: listLoading
  } = useList(token);

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

  // Fetch list data & favoriteCounts efficiently
  useEffect(() => {
    const fetchListData = async () => {
      setLoading(true);
      try {
        const res = await fetchListById(data._id);
        const songs = res.songs || [];
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
      } finally {
        setLoading(false);
      }
    };

    if (type === 'list' && data?._id) {
      fetchListData();
    }
  }, [type, data?._id]);

  if (!open || !data) return null;

  return (
    <>
      <Modal open={open} onClose={onClose}>
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
              <Typography variant="subtitle1" gutterBottom>
                {t('list')}: {data.name}
              </Typography>
              {loading ? (
                <CircularProgress />
              ) : (
                <ItemList
                  items={listItems}
                  type="song"
                  ratingProps={ratingProps}
                  favoriteCounts={favoriteProps.favoriteCounts}
                  isFavorite={favoriteProps.isFavorite}
                  onToggleFavorite={favoriteProps.handleFavoriteToggle}
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
            Cerrar
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InfoModal;
