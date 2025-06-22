import { useEffect, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Box, Typography, Card, CardContent, Button, TextField, Divider, Dialog, DialogTitle, DialogContent, DialogActions, styled, useTheme } from '@mui/material';
import Menu from '../components/Menu';
import useList from '../hooks/useList';
import useUser from '../hooks/useUser';
import useFavorites from '../hooks/useFavorites';
import useListFollowers from '../hooks/useListFollowers';
import { searchArtists, searchAlbums, searchSongs, getAlbumsByArtist, getSongsByRelease, getReleasesByReleaseGroup } from "../api/external/apiMB";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import InfoModal from '../components/InfoModal';
import useRatings from '../hooks/useRatings';
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

const ButtonBox= styled(Box)`
  width:100%;
  display: flex;
  justify-content:end;
  gap: 15px;
  padding: 10px 20px 0 0;
`;
const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      border: 'none',
      borderBottom: `2px solid `, // color del borde
      borderRadius: 0,
    },
    '&:hover fieldset': {
      borderBottom: `2px solid`, // hover
    },
    '&.Mui-focused fieldset': {
      borderBottom: `2px solid`, // foco
    },
    color: theme.palette.text.primary,
  },
  '& input': {
    color: theme.palette.text.primary, // texto introducido
  },
  '& label': {
    color: theme.palette.text.primary, // etiqueta
  },
  '& label.Mui-focused': {
    color: theme.palette.primary.main, // etiqueta con foco
  },
  width: '100%',
}));

function ListPage() {
    const { t } = useTranslation();  // Hook para obtener las traducciones
    const { token, role, logout, user } = useContext(UserContext);
    const theme = useTheme();
    const [editingList, setEditingList] = useState(null); // Estado para la lista en edición
    const [listName, setListName] = useState(''); // Estado para el nombre de la lista
    const [searchListName, setSearchListName] = useState(''); // Estado para el nombre de la lista a buscar
    const [editListName, setEditListName] = useState(''); // Estado para el nombre de la lista a editar
    const [selectedListId, setSelectedListId] = useState(null);
    const [songs, setSongs] = useState(''); // Estado para las canciones de la lista
    const [open, setOpen] = useState(false); // Estado para controlar el modal
    const [openSongsModal, setOpenSongsModal] = useState(false);
    const [selectedListSongs, setSelectedListSongs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchResults, setSearchResults] = useState([]); // Resultados de búsqueda
    const [ followLists, setFollowLists ] = useState('');
    const { lists, userLists, addSong, setUserLists, fetchAllLists, createNewList, removeList, renameList, fetchListsByUser, removeSong, fetchListById } = useList(token);
    const { followers, followersCount, followedLists, followL, unfollow, fetchFollowers, fetchFollowersCount, fetchFollowedLists, setFollowedLists } = useListFollowers(token);
    const [searchTermSong, setSearchTermSong] = useState("");
    const [songResults, setSongResults] = useState([]);
    const { addFavorite, removeFavorite, isFavorite, getFavoriteCount } = useFavorites(token);
    const { getUserById } = useUser(token);
    const [creatorNames, setCreatorNames] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ type: '', data: null });
    const ratingProps = useRatings(token);
    const favoriteProps = useFavorites(token);
    const [selectedList, setSelectedList] = useState(null);
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [favoriteCounts, setFavoriteCounts] = useState({
        artists: {},
        albums: {},
        songs: {},
      });
         const handleSearchListByUser = async () => {
          try {
            // Usa el user del contexto directamente
            if (!user || !user.userId) {
              showToast (t('errorFetchingUserId'), 'error');
              return;
            }
            const userId = user.userId;
            // Ya no necesitas getCurrentUser()
            await fetchListsByUser(userId);
            await fetchFollowedLists(userId);
          } catch (err) {
            console.error(t('errorFetchingListsByUser'), err);
            showToast(t('errorFetchingListsByUser'), 'error');
          }
        };
          
        useEffect(() => {
          if (token) {
            handleSearchListByUser(); // Llama a la función para buscar listas del usuario actual
            fetchAllLists(); // Llama a la función para obtener todas las listas
            fetchFollowedLists(user?.userId); // Opcional: cargar listas seguidas al cargar la página
          }
        }, [token]);




       const handleCreateList = async () => {
        try {
          const songArray = songs
            .split(',')
            .map(s => s.trim())
            .filter(s => s !== '')
            .map(id => ({ musicbrainzId: id }));

          await createNewList({ name: listName, songs: songArray });
          if (!user || !user.userId) return;
          fetchListsByUser(user.userId); // Actualiza la lista de listas
          showToast(t('createListGoFill'), 'success');
          setListName('');
          setSongs('');
        } catch (err) {
          showToast(t('errorCreatingList'), 'error');
          console.error(err);
        }
      };

            
      const handleDeleteList = async (listId) => {
        if (!window.confirm(t('confirmDeleteList'))) return;

        try {
          console.log('Deleting list with ID:', listId);
          await removeList(listId);
          if (!user || !user.userId) return;
          fetchListsByUser(user.userId); // Actualiza la lista de listas
        } catch (err) {
          showToast(t('errorDeletingList'), 'error');
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
          showToast(t('listUpdated'), 'success');
          setOpen(false);
          if (!user || !user.userId) return;
          fetchListsByUser(user.userId); // Actualiza la lista de listas
        } catch (err) {
          console.error('Error updating list:', err);
          if (err.response && err.response.status === 400) {
            showToast(t('errorUpdatingListFields'), 'error');
          } else if (err.response && err.response.status === 403) {
            showToast(t('errorAccessDenied'), 'error');
          } else if (err.response && err.response.status === 404) {
            showToast(t('errorListNotFound'), 'error');
          } else {
            showToast(t('errorUpdatingList'), 'error');
          }
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

      const handleDeleteSongList = async (listId, musicbrainzId) => {
        try {
          await removeSong(listId, musicbrainzId);
          alert('Canción eliminada correctamente de la lista');
          showToast(t('songDeletedFromList'), 'success');
          if (!user || !user.userId) return;
          setSelectedListSongs(prevSongs =>
        prevSongs.filter(song => song.musicbrainzId !== musicbrainzId)
      );
          await fetchListsByUser(user.userId);
        } catch (err) {
          showToast(t('errorDeletingListSong'), 'error');
          console.error(err);
        }
      };

      const fetchListWithSongs = async (listId) => {
        try {
          const list = await fetchListById(listId);
          return list && list.songs ? list.songs : [];
        } catch (err) {
          console.error('Error fetching list songs:', err);
          return [];
        }
      };

      const handleGetCreatorName = async (creatorId) => {
        if (!creatorId || creatorNames[creatorId]) return;
        const user = await getUserById(creatorId);
        if (user && user.name) {
          setCreatorNames(prev => ({ ...prev, [creatorId]: user.name }));
        }
      };

      const closeDetail = () => {
        setInfoModalOpen(false);
      };

      const favoritePropsFallback = {
        favoriteCounts: {},
        isFavorite: () => false,
        handleFavoriteToggle: () => {},
        setFavoriteCounts: () => {},
        getFavoriteCount: () => 0,
        addFavorite: () => {},
        removeFavorite: () => {},
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
          item?.duration || ""
        );
        setFavoriteCounts(prev => ({
          ...prev,
          [id]: (prev[id] || 0) + 1
        }));
      }
    };



 return (
  <Box sx={{ display: 'flex', flexDirection: 'column', width: "100%", minHeight:'100vh',  }}>
    <Menu /> 
        <Box sx={{  display: 'flex',  justifyContent: 'start', flexDirection: 'column', p: 4, flexWrap:'wrap', width:'100%', backgroundColor: theme.palette.background.secondary }}>
          <Typography variant="h4" sx={{ mb: 2 }}>{t('yourLists')}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%' }}>
              <ListCard >
                <ListCardContent >
                  <Typography variant="h5">{t('createList')}</Typography>
                  <CustomTextField  label={t('listName')} value={listName} onChange={e => setListName(e.target.value)} margin="normal" />
                  <Button variant="contained" onClick={handleCreateList} sx={{ mt: 2, backgroundColor: '#d63b1f'  }}>{ t('createListButton')}</Button>
                </ListCardContent>
              </ListCard>   
              {userLists.map(l => {
              handleGetCreatorName(l.creator);
              return (
                <ListCard key={l._id} sx={{cursor: 'pointer' }} onClick={(e) => {
                          setModalData({ type: 'list', data: { ...l } }); // fuerza nueva referencia
                          setInfoModalOpen(true);
                        }}>
                  <ListCardContent>
                    <Typography
                        variant="h6"
                        
                      >
                        {l.name}
                      </Typography>
                      <Divider/>
                      <Typography variant="body2" color="text.secondary">
                        {t('numberSongs')}: {l.songs.length} {t('songs')}
                      </Typography>
                      {l.isFavoriteList !== true && l.isRatingList !== true && (
                        <>
                      <Typography variant="body2" color="text.secondary">
                        {t('creatorOfList')}: {creatorNames[l.creator] || l.creator || t('unknown')}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                         {t('dateofcreation')}: {l.createdAt.slice(0, 10)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('lastupdate')}: {l.updatedAt.slice(0, 10)}
                      </Typography>
                      </>
                      )}
                      

                   {l.isFavoriteList !== true && l.isRatingList !== true && (
                    <ButtonBox>
                      <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        onClick={(e ) => {handleOpenListModal(l);  e.stopPropagation();}}
                      >
                        {t('edit')}
                      </Button>
                      <Button
                        onClick={(e) => {handleDeleteList(l._id);  e.stopPropagation();}}
                        color="error"
                        variant="contained"
                      >
                        {t('delete')}
                      </Button>
                    </ButtonBox>
                  )}
                </ListCardContent>
               </ListCard>
                );
              })}
            </Box>
        </Box>            
                
        <Box sx={{  display: 'flex',  flexDirection: 'column', p: 4, width:'100%', backgroundColor: theme.palette.background.tertiary }}>
          <Typography variant="h4" sx={{ mb: 2 }}>{t('listfollowed')}</Typography>
          <Box sx={{ display: 'flex', gap: 2, width: '100%', flexWrap: 'wrap' }}>
            {followedLists.map(l => {
              handleGetCreatorName(l.creator);
              return (
                <ListCard key={l._id} sx={{cursor: 'pointer' }} onClick={(e) => { e.stopPropagation();
                          setModalData({ type: 'list', data: { ...l } }); // fuerza nueva referencia
                          setInfoModalOpen(true);
                        }}>
                <ListCardContent>
                  <Typography
                      variant="h6"
                      sx={{ mb: 1, cursor: 'pointer' }}
                      onClick={() => {
                        setModalData({ type: 'list', data: { ...l } }); // fuerza nueva referencia
                        setInfoModalOpen(true);
                      }}
                      >
                      {l.name}
                    </Typography>
                  <Divider sx={{ my: 1 }} />  
                  <Typography variant="body2" color="text.secondary">
                        {t('numberSongs')}: {l.songs.length} {t('songs')}
                      </Typography>
                  <Typography variant="body2" color="text.secondary">
                      {t('creatorOfList')}: {creatorNames[l.creator] || l.creator || t('unknown')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                         {t('dateofcreation')}: {l.createdAt.slice(0, 10)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('lastupdate')}: {l.updatedAt.slice(0, 10)}
                      </Typography>  
                             
                  
                    <ButtonBox>
                      <Button onClick={(e) => {(handleUnfollowList(l._id));  e.stopPropagation();}} variant= "contained" color="error">{t('unfollow')}</Button>
                    </ButtonBox>
               
                </ListCardContent>
               </ListCard>
              );
            })}
          </Box>
        </Box>     

        <Box sx={{ display: 'flex',  flexDirection: 'column', p: 4, width:'100%', backgroundColor: theme.palette.background.secondary }}>
          <Typography variant="h4" sx={{ mb: 2 }}>{t('allLists')}</Typography>              
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%' }}>
            {lists && lists.length > 0 ? (
              lists
                .filter(l => l.creator && user && l.creator._id !== user.userId) // <-- Filtra las listas que no son tuyas
                .map(l => (
                  <ListCard key={l._id} sx={{cursor: 'pointer' }} onClick={(e) => { e.stopPropagation();
                          setModalData({ type: 'list', data: { ...l } }); // fuerza nueva referencia
                          setInfoModalOpen(true);
                        }}>
                    <ListCardContent>
                      <Typography
                        variant="h6"
                        sx={{ mb: 1, cursor: 'pointer' }}
                        onClick={() => {
                          setModalData({ type: 'list', data: { ...l } }); // fuerza nueva referencia
                          setInfoModalOpen(true);
                        }}
                      >
                        {l.name}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {t('numberSongs')}: {l.songs.length} {t('songs')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('creatorOfList')}: {l.creator?.name || t('unknown')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                         {t('dateofcreation')}: {l.createdAt.slice(0, 10)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('lastupdate')}: {l.updatedAt.slice(0, 10)}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        {followedLists.some(followed => followed._id === l._id) ? (
                          <ButtonBox>
                            <Typography color="success.main">{t('following')}</Typography>
                          </ButtonBox>
                          
                        ) : (
                          <ButtonBox>
                            <Button onClick={(e) => {handlefollowList(l._id);  e.stopPropagation();}} sx={{backgroundColor: '#d63b1f', color: 'white'}}>{t('follow')}</Button>
                          </ButtonBox>
                        )}
                      </Box>
                    </ListCardContent>
                  </ListCard>
                ))
            ) : (
              <Typography variant="body2" color="text.secondary">{t('noLists')}</Typography>
            )}
          </Box>
        </Box>
      {/* Modal para renombrar la lista */}
        <Dialog open={open} onClose={handleCloseListModal}>
          <DialogTitle>{t('editList')}</DialogTitle>
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

        <Dialog open={openSongsModal} onClose={() => setOpenSongsModal(false)}>
          <DialogTitle>
            {t('songs')} - {
              // Busca la lista seleccionada en todas las listas disponibles
              (() => {
                const all = [...userLists, ...followedLists, ...lists];
                const found = all.find(l => l._id === selectedListId);
                return found ? found.name : '';
              })()
            }
          </DialogTitle>
          <DialogContent>
            <ul>
              {selectedListSongs.length === 0 && (
                <Typography variant="body2" color="text.secondary">{t('noSongs')}</Typography>
              )}
              {selectedListSongs.map((song, index) => (
                <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {song.title} - {song.artistName}
                  {/* Solo muestra el botón X si la lista es del usuario */}
                {userLists.some(list => list._id === selectedListId) &&
                  userLists.find(list => list._id === selectedListId)?.name !== "Favoritos" && (
                    <Button
                      size="small"
                      color="error"
                    
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
            <Button onClick={() => setOpenSongsModal(false)} color="primary">{t('close')}</Button>
          </DialogActions>
        </Dialog>
        <InfoModal
          open={infoModalOpen}
          onClose={closeDetail}
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
export default ListPage;           