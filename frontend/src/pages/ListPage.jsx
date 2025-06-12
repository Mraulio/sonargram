import { useEffect, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Box, Typography, Card, CardContent, Button, TextField, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Menu2 from '../components/Menu2';
import SearchBar from '../components/Search';
import useList from '../hooks/useList';
import useUser from '../hooks/useUser';
import useFavorites from '../hooks/useFavorites';
import useListFollowers from '../hooks/useListFollowers';
import { searchArtists, searchAlbums, searchSongs, getAlbumsByArtist, getSongsByRelease, getReleasesByReleaseGroup } from "../api/external/apiMB";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

function ListPage() {
    const { t } = useTranslation();  // Hook para obtener las traducciones
    const { token, role, logout, user } = useContext(UserContext);
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
    const { lists, userLists, fetchAllLists, createNewList, removeList, renameList, fetchListsByUser, removeSong, fetchListById } = useList(token);
    const { followers, followersCount, followedLists, followL, unfollow, fetchFollowers, fetchFollowersCount, fetchFollowedLists, setFollowedLists } = useListFollowers(token);
    const [searchTermSong, setSearchTermSong] = useState("");
    const [songResults, setSongResults] = useState([]);
    const { addFavorite, removeFavorite, isFavorite, getFavoriteCount } = useFavorites(token);
    const { getUserById } = useUser(token);
    const [creatorNames, setCreatorNames] = useState({});
    const [favoriteCounts, setFavoriteCounts] = useState({
        artists: {},
        albums: {},
        songs: {},
      });
         const handleSearchListByUser = async () => {
          try {
            // Usa el user del contexto directamente
            if (!user || !user.userId) {
              alert(t('errorFetchingUserId'));
              return;
            }
            const userId = user.userId;
            // Ya no necesitas getCurrentUser()
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
            fetchFollowedLists(user?.userId); // Opcional: cargar listas seguidas al cargar la página
          }
        }, [token]);

        

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

          alert(t('createListGoFill'));
          setListName('');
          setSongs('');
        } catch (err) {
          alert('Error creating list');
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
          alert('Canción eliminada correctamente de la lista');
          if (!user || !user.userId) return;
          await fetchListsByUser(user.userId);
        } catch (err) {
          alert('Error al eliminar la canción de la lista');
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

 return (
  <Box sx={{ display: 'flex', flexDirection: 'column', width: "100vw", minHeight:'100vh' }}>
    <Menu2 /> 
        <Box sx={{  display: 'flex',  justifyContent: 'start', flexDirection: 'column', p: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>{t('yourLists')}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '95vw' }}>
              <Card sx={{ width: '48%', height: '200px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                <CardContent sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                  <Typography variant="h5" gutterBottom>{t('createList')}</Typography>
                  <TextField fullWidth label={t('listName')} value={listName} onChange={e => setListName(e.target.value)} margin="normal" />
                  <Button variant="contained" onClick={handleCreateList} sx={{ mt: 2 }}>{ t('createListButton')}</Button>
                </CardContent>
              </Card>   
              {userLists.map(l => {
              handleGetCreatorName(l.creator);
              return (
                <Card key={l._id} sx={{ width: '48%', height: '200px', display: 'flex', flexDirection: 'column', justifyContent:'center' }}>
                  <CardContent>
                    <Typography
                      variant="h5"
                      sx={{ mb: 1, cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedListSongs(l.songs);
                        setSelectedListId(l._id); // <-- Añade esto
                        setOpenSongsModal(true);
                      }}
                    >
                      {l.name}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                       <Typography variant="body2" color="text.secondary">
                        {t('Creador de la lista')}: {creatorNames[l.creator] || l.creator || t('unknown')}
                      </Typography>
                      <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                       onClick={() => {
                          setSelectedListSongs(l.songs);
                          setSelectedListId(l._id);
                          setOpenSongsModal(true);
                        }}
                        sx={{ ml: 2 }}
                      >
                        {t('edit')}
                      </Button>
                      <Button onClick={() => (handleDeleteList(l._id))} color="error">{t('delete')}</Button>
                    </Box>
                </CardContent>
               </Card>
                );
              })}
            </Box>
        </Box>            
                
        <Box sx={{  display: 'flex',  flexDirection: 'column', p: 4 }}>
          <Typography variant="h6">{t('followLists')}</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '95vw' }}>
            {followedLists.map(l => {
              handleGetCreatorName(l.creator);
              return (
                <Card key={l._id} sx={{ width: '48%', height: '200px', display: 'flex', flexDirection: 'column', justifyContent:'center' }}>
                <CardContent>
                  <Typography
                    variant="h5"
                    sx={{ mb: 1, cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={async () => {
                      let songs = l.songs;
                      // Si las canciones no tienen título, haz fetch de la lista completa
                      if (!songs.length || !songs[0].title) {
                        songs = await fetchListWithSongs(l._id);
                      }
                      setSelectedListSongs(songs);
                      setSelectedListId(l._id);
                      setOpenSongsModal(true);
                    }}
                  >
                    {l.name}
                  </Typography>
                  <Divider sx={{ my: 1 }} />              
                  <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('Creador de la lista')}: {creatorNames[l.creator] || l.creator || t('unknown')}
                    </Typography>
                    <Button onClick={() => (handleUnfollowList(l._id))} color="error">{t('unfollow')}</Button>
                  </Box>
                </CardContent>
               </Card>
              );
            })}
          </Box>
        </Box>
                
                
            {searchResults.length > 0 && (
              <Box sx={{ p: 4, display: 'flex', width: '95vw',justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ mt: 2 }}>{t('searchResults')}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                  <Card sx={{ width: '48%', height: '300px'}}>
                  <CardContent>
                      <Typography variant="h5" gutterBottom>{t('showList')}</Typography>
                      <TextField
                          fullWidth
                          label={t('searchListName')}
                          value={searchListName}
                          onChange={e => setSearchListName(e.target.value)}
                          margin="normal"
                      />
                      <Button variant="contained" onClick={handleSearchListByName} sx={{ mt: 2 }}>
                          {t('searchListButton')}
                      </Button>
                  </CardContent>  
                </Card>  
                  {searchResults.map(l => (
                    <Card key={l._id} sx={{ width: '45%', height: '300px' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1 }}>{l.name}</Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {t('Canciones')}: {l.songs.join(', ')}
                        </Typography>
                        <Box sx={{  display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('Creador de la lista')}: {l.creator.name || t('unknown')}
                          </Typography>
                          {followedLists.some(followed => followed._id === l._id) ? (
                            <Typography color="success.main">{t('following')}</Typography>
                          ) : (
                            <Button onClick={() => handlefollowList(l._id)} color="error">{t('follow')}</Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}

                </Box>
              </Box>
              )}
              <Box sx={{ p: 4, display: 'flex', width: '95vw', flexDirection: 'column'}}>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('allLists')}</Typography>              
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '95vw' }}>
                  {lists && lists.length > 0 ? (
                    lists
                      .filter(l => l.creator && user && l.creator._id !== user.userId) // <-- Filtra las listas que no son tuyas
                      .map(l => (
                        <Card key={l._id} sx={{ width: '48%', height: '200px', display: 'flex', flexDirection: 'column', justifyContent:'center' }}>
                          <CardContent>
                            <Typography
                              variant="h5"
                              sx={{ mb: 1, cursor: 'pointer', textDecoration: 'underline' }}
                              onClick={async () => {
                                let songs = l.songs;
                                // Si las canciones no tienen título, haz fetch de la lista completa
                                if (!songs.length || !songs[0].title) {
                                  songs = await fetchListWithSongs(l._id);
                                }
                                setSelectedListSongs(songs);
                                setSelectedListId(l._id);
                                setOpenSongsModal(true);
                              }}
                            >
                              {l.name}
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {t('Creador de la lista')}: {l.creator?.name || t('unknown')}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                              {followedLists.some(followed => followed._id === l._id) ? (
                                <Typography color="success.main">{t('following')}</Typography>
                              ) : (
                                <Button onClick={() => handlefollowList(l._id)} color="error">{t('follow')}</Button>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
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
                        {userLists.some(list => list._id === selectedListId) && (
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
                  <Button onClick={() => setOpenSongsModal(false)} color="primary">{t('close') || 'Cerrar'}</Button>
                </DialogActions>
              </Dialog>
            </Box>

            );
          }             
export default ListPage;           