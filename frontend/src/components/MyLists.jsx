import { useEffect, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Box, Typography, Card, CardContent, Button, TextField, Divider, Dialog, DialogTitle, DialogContent, DialogActions, styled } from '@mui/material';
import Menu2 from './Menu';
import useList from '../hooks/useList';
import useUser from '../hooks/useUser';
import useFavorites from '../hooks/useFavorites';
import useListFollowers from '../hooks/useListFollowers';
import { searchArtists, searchAlbums, searchSongs, getAlbumsByArtist, getSongsByRelease, getReleasesByReleaseGroup } from "../api/external/apiMB";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import InfoModal from '../components/InfoModal';
import useRatings from '../hooks/useRatings';

const MyListsBox = styled(Box)`
  display: flex; 
  flex-direction: column; 
  justify-content: start; 
  align-items: center; 
  gap: 3; 
  margin-left: 5px;

  @media (max-width: 960px) {
    width: 90%;
  }
`;

function MyLists() {
    const { t } = useTranslation();  // Hook para obtener las traducciones
    const { token, role, logout, user } = useContext(UserContext);
    const [editingList, setEditingList] = useState(null); // Estado para la lista en edición
    const [listName, setListName] = useState(''); // Estado para el nombre de la lista
    const [searchListName, setSearchListName] = useState(''); // Estado para el nombre de la lista a buscar
    const [editListName, setEditListName] = useState(''); // Estado para el nombre de la lista a editar
    const [songs, setSongs] = useState(''); // Estado para las canciones de la lista
    const [open, setOpen] = useState(false); // Estado para controlar el modal
    const [openSongsModal, setOpenSongsModal] = useState(false);
    const [selectedListSongs, setSelectedListSongs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchResults, setSearchResults] = useState([]); // Resultados de búsqueda
    const [ followLists, setFollowLists ] = useState('');
    const { lists, userLists, fetchListById, fetchAllLists, createNewList, removeList, renameList, fetchListsByUser, removeSong } = useList(token);
    const { followers, followersCount, followedLists, followL, unfollow, fetchFollowers, fetchFollowersCount, fetchFollowedLists, setFollowedLists } = useListFollowers(token);
    const [searchTermSong, setSearchTermSong] = useState("");
    const [songResults, setSongResults] = useState([]);
    const [selectedListId, setSelectedListId] = useState(null);
    const [creatorNames, setCreatorNames] = useState({});
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ type: '', data: null });
    const favoriteProps = useFavorites(token);
    const ratingProps = useRatings(token);
    const { getUserById } = useUser(token);
    const { addFavorite, removeFavorite, isFavorite, getFavoriteCount } = useFavorites(token);
    const [favoriteCounts, setFavoriteCounts] = useState({
        artists: {},
        albums: {},
        songs: {},
      });
    
    const fetchListWithSongs = async (listId) => {
    try {
      const list = await fetchListById(listId);
      return list && list.songs ? list.songs : [];
    } catch (err) {
      console.error('Error fetching list songs:', err);
      return [];
    }
  };

    const handleSearchListByUser = async () => {
      try {
        if (!user || !user.userId) {
          alert(t('errorFetchingUserId'));
        return;
        }
        const userId = user.userId;
          await fetchListsByUser(userId);
          await fetchFollowedLists(userId);
        } catch (err) {
          console.error('Error fetching lists by user:', err);
          alert(t('errorFetchingListsByUser'));
        }
        };
          
    useEffect(() => {
      if (token) {
        handleSearchListByUser(); // Llama a la función para buscar listas del usuario actual
        fetchAllLists(); // Llama a la función para obtener todas las listas
        console.log('Fetching lists for user:', user?.userId);
      }
    }, [token]);
    useEffect(() => {
      console.log('Lists updated:', userLists);
  
    })

    const handleSearchListByName = useCallback(async () => {
          setLoading(true);
          setError(null);
          try {
            // Usa el user del contexto directamente
            if (!user || !user.userId) {
              alert(t('errorFetchingUserId'));
              return;
            }
            const filteredLists = lists.filter(list =>
              list.name.toLowerCase().includes(searchListName.toLowerCase()) &&
              list.creator._id !== user.userId // Filtra las listas que no son del usuario actual
            );

            setSearchResults(filteredLists);
            console.log('Filtered lists (excluding user-owned):', filteredLists);
          } catch (err) {
            setError(err.message || 'Error fetching lists');
          } finally {
            setLoading(false);
          }
        }, [lists, searchListName, user, t]);



            
      const handleDeleteList = async (listId) => {
        if (!window.confirm(t('confirmDeleteList'))) return;

        try {
          console.log('Deleting list with ID:', listId);
          await removeList(listId);
          if (!user || !user.userId) return;
          fetchListsByUser(user.userId); // Actualiza la lista de listas
        } catch (err) {
          alert(t('errorDeletingList'));
          console.error(err);
        }
      };
      
      const handleOpenListModal = (list) => {
        console.log('Opening modal for list:', list); // Debugging line
        console.log('List name:', list.name); // Debugging line
        setEditingList(list); // Establece la lista en edición
        setEditListName(list.name); // Establece el nombre de la lista en el estado
        setSongs(list.songs.map(song => song.musicbrainzId).join(', ')); // Convierte los IDs de canciones a una cadena separada por comas
        setOpen(true); // Abre el modal
      };

      const handleCloseListModal = () => {
        setOpen(false); // Cierra el modal
        setEditingList(null); // Limpia la lista en edición
      };
            
      const handleSaveListChanges = async () => {
        try {
          const updatedSongs = songs
            .split(',')
            .map(s => s.trim())
            .filter(s => s !== '')
            .map(id => ({ musicbrainzId: id }));

          await renameList(editingList._id, editListName);

          alert(t('listUpdated'));
          setOpen(false);
          if (!user || !user.userId) return;
          fetchListsByUser(user.userId); // Actualiza la lista de listas
        } catch (err) {
          console.error('Error updating list:', err);
          if (err.response && err.response.status === 400) {
            alert(t('errorUpdatingListFields'));
          } else if (err.response && err.response.status === 403) {
            alert(t('errorAccessDenied'));
          } else if (err.response && err.response.status === 404) {
            alert(t('errorListNotFound'));
          } else {
            alert(t('errorUpdatingList'));
          }
        }
      };
            
      const handlefollowList = async (listId) => {
        try {
          await followL(listId);
          if (!user || !user.userId) return;
          await fetchFollowedLists(user.userId);
          alert(t('listFollowed'));
        } catch (err) {
          console.error('Error following list:', err);
          alert(t('errorFollowingList'));
        }
      };

      const handleUnfollowList = async (listId) => {
        try {
          await unfollow(listId);
          if (!user || !user.userId) return;
          await fetchFollowedLists(user.userId);
          setFollowedLists(prev => prev.filter(list => list._id !== listId));
          alert(t('listUnfollowed'));
        } catch (err) {
          console.error('Error unfollowing list:', err);
          alert(t('errorUnfollowingList'));
        }
      };

      const handleDeleteSongList = async (listId, musicbrainzId) => {
        try {
          await removeSong(listId, musicbrainzId);
          alert('Canción eliminada correctamenteXSDSD de la lista');
          if (!user || !user.userId) return;
          await fetchListsByUser(user.userId);
        } catch (err) {
          alert('Error al eliminar la canción de la lista');
          console.error(err);
        }
      };
      
      const handleGetCreatorName = async (creatorId) => {
        if (!creatorId || creatorNames[creatorId]) return;
        const user = await getUserById(creatorId);
        if (user && user.name) {
          setCreatorNames(prev => ({ ...prev, [creatorId]: user.name }));
        }
      };

  const updateFavoriteCount = async (id) => {
  try {
    const count = await favoriteProps.getFavoriteCount(id);
    setFavoriteCounts(prev => ({ ...prev, [id]: count }));
  } catch (err) {
    console.error("Error updating favorite count", err);
  }
};

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

return (
  <MyListsBox >
    <Typography variant="h4" sx={{ mb: 2 }}>{t('yourLists')}</Typography>
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%' }}>
    {userLists.map(l => {
      handleGetCreatorName(l.creator);
      return (
    <li key={l._id} style={{ minHeight: '80px'}}>
        <Typography
          variant="h6"
          sx={{ mb: 1, cursor: 'pointer' }}
         onClick={() => {
          console.log('Abriendo modal con lista:', l);
          setModalData({ type: 'list', data: l });
          setInfoModalOpen(true);
        }}
        >
          {l.name}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', m:3 }}>
          
          {l.isFavoriteList !== true && l.isRatingList !== true && (
          <>
          <Typography variant="body2" color="text.secondary">
            {t('Creador de la lista')}: {creatorNames[l.creator] || l.creator || t('unknown')}
          </Typography>
            <Button
             
              color="warning"
              sx={{ fontSize: '0.7rem' }}
              onClick={() => handleOpenListModal(l)}
            >
              {t('edit')}
            </Button>
            <Button 
          
              sx={{ fontSize: '0.7rem' }}
              onClick={() => (handleDeleteList(l._id))} color="error">{t('delete')}
            </Button>
          </>
        )}
        </Box>
        <Divider/>
       </li>
      );
    })}
    </ul>
    <Typography variant="h4" sx={{ mb: 2 }}>{t('listfollowed')}</Typography>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%' }}>
        {followedLists.map(l => {
          handleGetCreatorName(l.creator);
          return (
            <li key={l._id}>
              <Typography
                variant="h6"
                sx={{ mb: 1, cursor: 'pointer' }}
                onClick={() => {
                  setModalData({ type: 'list', data: l });
                  setInfoModalOpen(true);
                }}
              >
                {l.name}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('Creador de la lista')}: {creatorNames[l.creator] || l.creator || t('unknown')}
                </Typography>
                <Button 
                  sx={{ fontSize: '0.6rem' }}
                  onClick={() => handleUnfollowList(l._id)} color="error">
                  {t('unfollow')}
                </Button>
                <Divider />
              </Box>
            </li>
          );
        })}
      </ul>
    {/* Modal para mostrar canciones de la lista */}
    <Dialog open={openSongsModal} onClose={() => setOpenSongsModal(false)}>
  <DialogTitle>{t('songs')}</DialogTitle>
  <DialogContent>
    <ul>
      {selectedListSongs.length === 0 && (
        <Typography variant="body2" color="text.secondary">{t('noSongs')}</Typography>
      )}
      {selectedListSongs.map((song, index) => (
        <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {song.title} - {song.artistName}
          {/* Solo muestra el botón si la lista es tuya */}
          {userLists.some(list => list._id === selectedListId) &&
            editingList?.name !== "Favoritos" && (
              <Button
                size="small"
                color="error"
                variant="contained"
                sx={{ ml: 1 }}
                onClick={() => handleDeleteSongList(selectedListId, song.musicbrainzId)}
              >
                X
              </Button>
          )}
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

    {/* Modal para renombrar la lista */}
    <Dialog open={open} onClose={handleCloseListModal}>
      <DialogTitle>
        {t('songs')} - {listName}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label={t('editListName')}
          value={editListName}
          onChange={(e) => setEditListName(e.target.value)}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSaveListChanges} variant="contained" color="primary">
          {t('save')}
        </Button>
        <Button onClick={handleCloseListModal} color="secondary">
          {t('cancel')}
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
    />
  </MyListsBox>
);
          }
export default MyLists;