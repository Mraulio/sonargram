import { useEffect, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Box, Typography, Card, CardContent, Button, TextField, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Menu from '../components/Menu';
import useList from '../hooks/useList';
import useUser from '../hooks/useUser';

function ListPage() {
    const { t } = useTranslation();  // Hook para obtener las traducciones
    const { token, role, logout } = useContext(UserContext);
    const [editingList, setEditingList] = useState(null); // Estado para la lista en edición
    const [listName, setListName] = useState(''); // Estado para el nombre de la lista
    const [songs, setSongs] = useState(''); // Estado para las canciones de la lista
    const [open, setOpen] = useState(false); // Estado para controlar el modal
    const [loading, setLoading] = useState(false);
    const {users, getCurrentUser} = useUser(token);
    const [error, setError] = useState(null);
    const [searchResults, setSearchResults] = useState([]); // Resultados de búsqueda
     const {
           lists,
           fetchAllLists,
           createNewList,
           removeList,
           renameList,
           fetchListsByUser,
           setLists
         } = useList(token);
          
         const handleSearchListByUser = async () => {
          try {
            // Obtén el usuario actual utilizando getCurrentUser
            const currentUser = await getCurrentUser();
            if (!currentUser || !currentUser._id) {
              alert(t('errorFetchingUserId')); // Mensaje de error si no se puede obtener el usuario
              return;
            }
        
            const userId = currentUser._id; // Obtén el ID del usuario actual
            console.log('Current user ID:', userId);
        
            // Llama a la función para buscar listas por el ID del usuario
            await fetchListsByUser(userId);
          } catch (err) {
            console.error('Error fetching lists by user:', err);
            alert(t('errorFetchingListsByUser')); // Mensaje de error genérico
          }
        };
          
        useEffect(() => {
          if (token) {
            handleSearchListByUser(); // Llama a la función para buscar listas del usuario actual
          }
        }, [token]);

        const handleSearchListByName = useCallback(async () => {
          setLoading(true);
          setError(null);
          try {
            // Obtén todas las listas
            const data = await fetchAllLists();
        
            // Filtra las listas cuyo nombre contenga el texto ingresado
            const filteredLists = data.filter(list =>
              list.name.toLowerCase().includes(listName.toLowerCase())
            );
        
            setSearchResults(filteredLists); // Actualiza el estado con las listas filtradas
            console.log('Filtered lists:', filteredLists); // Agrega esta línea para depurar
          } catch (err) {
            setError(err.message || 'Error fetching lists');
          } finally {
            setLoading(false);
          }
        }, [fetchAllLists, listName]);

            const handleCreateList = async () => {
              try {
                const songArray = songs
                  .split(',')
                  .map(s => s.trim())
                  .filter(s => s !== '')
                  .map(id => ({ musicbrainzId: id }));
          
                await createNewList({ name: listName, songs: songArray });
          
                alert('List created');
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
                } catch (err) {
                  alert(t('errorDeletingList'));
                  console.error(err);
                }
              };

            const handleOpenListModal = (list) => {
              setEditingList(list); // Establece la lista en edición
              setListName(list.name); // Establece el nombre de la lista en el estado
              setSongs(list.songs.map(song => song.musicbrainzId).join(', ')); // Convierte los IDs de canciones a una cadena separada por comas
              setOpen(true); // Abre el modal
            };
            
            const handleCloseListModal = () => {
              setOpen(false); // Cierra el modal
              setEditingList(null); // Limpia la lista en edición
            };
            
            const handleSaveListChanges = async () => {
              try {
                // Convierte la cadena de canciones a un array de objetos
                const updatedSongs = songs
                  .split(',')
                  .map(s => s.trim())
                  .filter(s => s !== '')
                  .map(id => ({ musicbrainzId: id }));
            
                // Solo enviar los campos permitidos por el backend
                const updates = {
                  name: listName,
                };
            
                await renameList(editingList._id, updates); // Llama a la función updateList con los datos permitidos
                alert(t('listUpdated')); // Mensaje de éxito
                setOpen(false); // Cierra el modal
                fetchAllLists(); // Actualiza la lista de listas
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
            return (
              <Box>
                <Menu />
                <Box sx={{ p: 4, fontFamily: 'sans-serif', maxWidth: '90vw', mx: 'auto' }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>{t('Listas')}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {lists.map(l => (
                      <Card key={l._id} sx={{ width: '500px', p: 2 }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 1 }}>{l.name}</Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {t('Canciones')}: {l.songs.join(', ')}
                          </Typography>
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
                  </Box>
                </Box>
                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>{t('createList')}</Typography>
                    <TextField fullWidth label={t('listName')} value={listName} onChange={e => setListName(e.target.value)} margin="normal" />
                    <TextField fullWidth label={t('songIds')} value={songs} onChange={e => setSongs(e.target.value)} margin="normal" />
                    <Button variant="contained" onClick={handleCreateList} sx={{ mt: 2 }}>
                      { t('createListButton')}
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>{t('showList')}</Typography>
                    <TextField
                        fullWidth
                        label={t('listName')}
                        value={listName}
                        onChange={e => setListName(e.target.value)}
                        margin="normal"
                    />
                    <Button variant="contained" onClick={handleSearchListByName} sx={{ mt: 2 }}>
                        {t('searchListButton')}
                    </Button>
                </CardContent>
                
            </Card>
            {searchResults.length > 0 && (
    <CardContent>
      <Typography variant="h6" sx={{ mt: 2 }}>{t('searchResults')}</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {searchResults.map(l => (
          <Card key={l._id} sx={{ width: '500px', p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>{l.name}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {t('Canciones')}: {l.songs.join(', ')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('Creador de la lista')}: {l.creator.name || t('unknown')}
                </Typography>
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  onClick={() => handleOpenListModal(l)}
                  sx={{ ml: 2 }}>
                  {t('edit')}
                </Button>
                <Button onClick={() => handleDeleteList(l._id)} color="error">{t('delete')}</Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </CardContent>
  )}     
                {/* Modal para renombrar la lista */}
                <Dialog open={open} onClose={handleCloseListModal}>
                  <DialogTitle>{t('editList')}</DialogTitle>
                  <DialogContent>
                    <TextField
                      fullWidth
                      label={t('listName')}
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
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
export default ListPage;