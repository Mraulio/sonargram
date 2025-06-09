import { useEffect, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Card, CardContent, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { UserContext } from '../context/UserContext';
import useList from '../hooks/useList';

function OtherLists({ userId }) {
  const { t } = useTranslation();
  const { token } = useContext(UserContext);
  const { userLists, fetchListsByUser, loading } = useList(token);

  // Estado para el modal de canciones
  const [openSongsModal, setOpenSongsModal] = useState(false);
  const [selectedListSongs, setSelectedListSongs] = useState([]);
  const [selectedListName, setSelectedListName] = useState('');

  useEffect(() => {
    if (userId) {
      fetchListsByUser(userId);
    }
  }, [userId, fetchListsByUser]);

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
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>{t('userLists')}</Typography>
      {userLists.map(list => (
        <Card key={list._id} sx={{ mb: 2, p: 2 }}>
          <CardContent>
            <Typography
              variant="h6"
              sx={{ cursor: 'pointer' }}
              onClick={() => {
                setSelectedListSongs(list.songs || []);
                setSelectedListName(list.name);
                setOpenSongsModal(true);
              }}
            >
              {list.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('songs')}: {list.songs.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('Creador de la lista')}: {list.creator?.name || t('unknown')}
            </Typography>
          </CardContent>
          <Divider sx={{ my: 1 }} />
        </Card>
      ))}

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
    </Box>
  );
}

export default OtherLists;