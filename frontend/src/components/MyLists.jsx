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

function MyLists() {
    const { t } = useTranslation();  // Hook para obtener las traducciones
    const { token, role, logout } = useContext(UserContext);
    const [editingList, setEditingList] = useState(null); // Estado para la lista en edición
    const [listName, setListName] = useState(''); // Estado para el nombre de la lista
    const [searchListName, setSearchListName] = useState(''); // Estado para el nombre de la lista a buscar
    const [editListName, setEditListName] = useState(''); // Estado para el nombre de la lista a editar
    const [songs, setSongs] = useState(''); // Estado para las canciones de la lista
    const [open, setOpen] = useState(false); // Estado para controlar el modal
    const [loading, setLoading] = useState(false);
    const {user, getCurrentUser} = useUser(token);
    const [error, setError] = useState(null);
    const [searchResults, setSearchResults] = useState([]); // Resultados de búsqueda
    const [ followLists, setFollowLists ] = useState('');
    const { lists, userLists, fetchAllLists, createNewList, removeList, renameList, fetchListsByUser, removeSong } = useList(token);
    const { followers, followersCount, followedLists, followL, unfollow, fetchFollowers, fetchFollowersCount, fetchFollowedLists, setFollowedLists } = useListFollowers(token);
    const [searchTermSong, setSearchTermSong] = useState("");
    const [songResults, setSongResults] = useState([]);
    const { addFavorite, removeFavorite, isFavorite, getFavoriteCount } = useFavorites(token);
    const [favoriteCounts, setFavoriteCounts] = useState({
        artists: {},
        albums: {},
        songs: {},
      });
         const handleSearchListByUser = async () => {
          try {
            // Obtén el usuario actual utilizando getCurrentUser
            const currentUser= await getCurrentUser();
            console.log('Current user:', currentUser); // Depuración
            if (!currentUser|| !currentUser._id) {
              alert(t('errorFetchingUserId')); // Mensaje de error si no se puede obtener el usuario
              return;
            }
        
            const userId = currentUser._id; // Obtén el ID del usuario actual
            console.log('Current user ID:', userId);
        
            // Llama a la función para buscar listas por el ID del usuario
            await fetchListsByUser(userId);
            await fetchFollowedLists(userId);
          } catch (err) {
            console.error('Error fetching lists by user:', err);
            alert(t('errorFetchingListsByUser')); // Mensaje de error genérico
          }
        };
          
        useEffect(() => {
          if (token) {
            handleSearchListByUser(); // Llama a la función para buscar listas del usuario actual
            fetchAllLists(); // Llama a la función para obtener todas las listas
          }
        }, [token]);

        const handleSearchListByName = useCallback(async () => {
          setLoading(true);
          setError(null);
          try {
            const currentUser = await getCurrentUser(); // Asegúrate de obtener el usuario actual
            if (!currentUser || !currentUser._id) {
              alert(t('errorFetchingUserId'));
              return;
            }

            const filteredLists = lists.filter(list =>
              list.name.toLowerCase().includes(searchListName.toLowerCase()) &&
              list.creator._id !== currentUser._id // Filtra las listas que no son del usuario actual
            );

            setSearchResults(filteredLists);
            console.log('Filtered lists (excluding user-owned):', filteredLists);
          } catch (err) {
            setError(err.message || 'Error fetching lists');
          } finally {
            setLoading(false);
          }
        }, [lists, searchListName, getCurrentUser, t]);


        const handleCreateList = async () => {
          try {
            const songArray = songs
              .split(',')
              .map(s => s.trim())
              .filter(s => s !== '')
              .map(id => ({ musicbrainzId: id }));
          
              await createNewList({ name: listName, songs: songArray });
              const currentUser= await getCurrentUser();
              fetchListsByUser(currentUser._id); // Actualiza la lista de listas
          
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
                  console.log('Deleting list with ID:', listId); // Debugging line
                  await removeList(listId);
                  const currentUser= await getCurrentUser();
                  fetchListsByUser(currentUser._id); // Actualiza la lista de listas
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
                // Convierte la cadena de canciones a un array de objetos (si es necesario)
                const updatedSongs = songs
                  .split(',')
                  .map(s => s.trim())
                  .filter(s => s !== '')
                  .map(id => ({ musicbrainzId: id }));
            
                // Llama a renameList con el ID de la lista y el nuevo nombre
                console.log('List updated:', editingList._id, editListName);
                await renameList(editingList._id, editListName);
                
                alert(t('listUpdated')); // Mensaje de éxito
                setOpen(false); // Cierra el modal
                const currentUser= await getCurrentUser();
                fetchListsByUser(currentUser._id); // Actualiza la lista de listas
              } catch (err) {
                console.error('Error updating list:', err);
            
                // Manejo de errores basado en la respuesta del backend
                if (err.response && err.response.status === 400) {
                  alert(t('errorUpdatingListFields')); // Mensaje para campos no permitidos
                } else if (err.response && err.response.status === 403) {
                  alert(t('errorAccessDenied')); // Mensaje para acceso denegado
                } else if (err.response && err.response.status === 404) {
                  alert(t('errorListNotFound')); // Mensaje para lista no encontrada
                } else {
                  alert(t('errorUpdatingList')); // Mensaje genérico
                }
              }
            };

            
            const handleDeleteSongList = async (listId, musicbrainzId) => {
              try {
                await removeSong(listId, musicbrainzId);
                alert('Canción eliminada correctamente de la lista');
                const user = await getCurrentUser();
                await fetchListsByUser(user._id)
                // Si necesitas refrescar la lista, llama aquí a fetchListById o fetchListsByUser
              } catch (err) {
                alert('Error al eliminar la canción de la lista');
                console.error(err);
              }
            };
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'center', gap: 3 }}>
                  
                    <Typography variant="h6" sx={{ mb: 2 }}>{t('yourLists')}</Typography>
                        
                      {userLists.map(l => (
                        <Card key={l._id} sx={{ width: '100%', minHeight: '300px' }}>
                          <CardContent>
                            <Typography variant="h5" sx={{ mb: 1 }}>{l.name}</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{t('songs')}:</Typography>
                            
                            <ul>
                              {l.songs.map((song, index) => (
                                <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'space-between'}}>
                                  {song.title} - {song.artistName}
                                  <Button
                                    size="small"
                                    color="error"
                                    variant="contained"
                                    sx={{ ml: 1 }}
                                    onClick={() => handleDeleteSongList(l._id, song.musicbrainzId)}
                                  >
                                    X
                                  </Button>
                                </li>
                              ))}
                            </ul>
                            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary">
                                {t('Creador de la lista')}: {l.creator.name || t('unknown')}
                              </Typography>
                              <Button
                                variant="outlined"
                                color="warning"
                                size="small"
                                onClick={() => handleOpenListModal(l)}
                                sx={{ ml: 2 }}
                              >
                                {t('edit')}
                              </Button>
                              <Button onClick={() => (handleDeleteList(l._id))} color="error">{t('delete')}
                              </Button>
                          
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    
                  
               
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
              </Box>
            );
          }
export default MyLists;