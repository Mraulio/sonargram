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

const style = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 550, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24,
  p: 3, maxHeight: '100vh', overflowY: 'auto'
};

const InfoModal = ({ open, onClose, type, data, ratingProps, favoriteProps }) => {
  const [listItems, setListItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { fetchListById } = useList(); // no necesitas token para esto si ya viene desde la actividad

  useEffect(() => {
    if (type === 'list' && data?._id) {
      setLoading(true);
      fetchListById(data._id)
        .then((res) => setListItems(res.songs || []))
        .finally(() => setLoading(false));
    }
  }, [type, data?._id]);

  if (!open || !data) return null;

  return (
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
  );
};

export default InfoModal;
