// src/components/InfoModal.js
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Paper,
  Stack,
  Typography,
  Divider,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import ItemRow from './ItemRow';
import ItemList from './ItemList';
import useList from '../hooks/useList';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
} from "@mui/material";
import { UserContext } from "../context/UserContext";
import { useContext } from "react";
const style = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 550, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24,
  p: 3, maxHeight: '100vh', overflowY: 'auto'
};

const InfoModal = ({ open, onClose, type, data, ratingProps, favoriteProps }) => {
  const [listItems, setListItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { fetchListById } = useList(); // no necesitas token para esto si ya viene desde la actividad
  const { token, user } = useContext(UserContext);
  const { fetchListsByUser, userLists, addSong, loading: listLoading } = useList(token);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (modalOpen && user?.userId) {
      fetchListsByUser(user.userId);
    }
  }, [modalOpen, user, fetchListsByUser]);

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
      setMessage("Canción añadida correctamente.");
    } catch (err) {
      setMessage("Error al añadir la canción.");
    } finally {
      setAdding(false);
    }
  };
  useEffect(() => {
    if (type === 'list' && data?._id) {
      setLoading(true);
      fetchListById(data._id)
        .then((res) => setListItems(res.songs || []))
        .finally(() => setLoading(false));
    }
  }, [type, data?._id]);

  if (!open || !data) return null;

  return (<>
    <Modal open={open} onClose={onClose}>
      <Paper sx={style}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Detalle {type}</Typography>
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
            onAddClick={handleAddClick} // 👈 esto es lo que faltaba
          />
        )}

        {type === 'list' && (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Lista: {data.name}
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
