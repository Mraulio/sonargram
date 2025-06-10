/* src/components/InfoModal.js */
import React from 'react';
import {
  Modal,
  Paper,
  Stack,
  Typography,
  Divider,
  IconButton,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import ItemRow from './ItemRow';

const style = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 550, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24,
  p: 3, maxHeight: '100vh', overflowY: 'auto'
};

const InfoModal = ({ open, onClose, type, data, ratingProps, favoriteProps }) => {
  if (!open || !data) return null;
  if (!['song', 'album', 'artist'].includes(type)) return null;
  console.log('favorite propps modal', favoriteProps)
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
        <ItemRow
          item={data}
          type={type}
          ratingProps={ratingProps}
          favoriteCounts={favoriteProps.favoriteCounts}
          isFavorite={favoriteProps.isFavorite}
          onToggleFavorite={favoriteProps.handleFavoriteToggle}
          compact={false}
        />
      </Paper>
    </Modal>
  );
};

export default InfoModal;
