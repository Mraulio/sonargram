import { useEffect, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Card, CardContent, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Button, styled } from '@mui/material';
import { UserContext } from '../context/UserContext';
import useList from '../hooks/useList';

const ListCard= styled(Card)`
  width: 45vw;
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
    <Box sx={{  display: 'flex',  justifyContent: 'start', flexDirection: 'column', p: 4, flexWrap:'wrap', alignItems:'center' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>{t('userLists')}</Typography>
       <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '95vw' }}>
      {userLists.map(list => (
        <ListCard key={list._id} >
          <ListCardContent>
            <Typography
              variant="h5"
              sx={{ cursor: 'pointer' }}
              onClick={() => {
                setSelectedListSongs(list.songs || []);
                setSelectedListName(list.name);
                setOpenSongsModal(true);
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
    </Box>
  );
}

export default OtherLists;