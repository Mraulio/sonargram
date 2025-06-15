import { useEffect, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Avatar, Box, Typography, Card, CardContent, Button, TextField, Container, Divider, FormControl, InputLabel, Select, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, styled } from '@mui/material';
import useUser from '../hooks/useUser';
import useFollow from '../hooks/useFollow';
import useList from '../hooks/useList';
import useListFollowers from '../hooks/useListFollowers';
import RatingDisplay from "./RatingDisplay";
import useRatings from "../hooks/useRatings";
import { searchArtists, searchAlbums, searchSongs, getAlbumsByArtist, getSongsByRelease, getReleasesByReleaseGroup } from "../api/external/apiMB";
import useFavorites from "../hooks/useFavorites";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const CustomTextField = styled(TextField)`
border:none;
width: 3vw;
`;

function Search() {
  const { t } = useTranslation();  // Hook para obtener las traducciones
  //Estados de usuario
  const [userUsername, setUserUsername] = useState('');
  const { token, role, logout, user} = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { follower, follow, following, fetchFollowing } = useFollow(token);
  const { users, fetchAllUsers, getCurrentUser } = useUser(token);
  const [searches, setSearches] = useState([]);
  const [open, setOpen] = useState(false); // Estado para controlar el modal
  const [selectedSong, setSelectedSong] = useState(null); //canciones dentro del modal
  const [selectedListId, setSelectedListId] = useState("");
  //estados de me gusta y ratings
  const {
      rateItem,
      deleteRating,
      getItemStats,
      getRatingFor,
      fetchMultipleItemRatings,
    } = useRatings(token);
  const { addFavorite, removeFavorite, isFavorite, getFavoriteCount } = useFavorites(token);

      // Estados para búsquedas
  const [searchTermArtist, setSearchTermArtist] = useState("");
  const [searchTermAlbum, setSearchTermAlbum] = useState("");
  const [searchTermSong, setSearchTermSong] = useState("");

 // Resultados búsqueda
  const [artistResults, setArtistResults] = useState([]);
  const [albumResults, setAlbumResults] = useState([]);
  const [songResults, setSongResults] = useState([]);

  // Selecciones para cargar info relacionada
  const [selectedArtistAlbums, setSelectedArtistAlbums] = useState([]);
  const [selectedAlbumSongsFromArtist, setSelectedAlbumSongsFromArtist] =
    useState([]);

  const [selectedAlbumSongs, setSelectedAlbumSongs] = useState([]);

  //Estados para listas
  const { lists, userLists, fetchAllLists, createNewList, removeList, renameList, fetchListsByUser, addSong } = useList(token);
  const [searchResults, setSearchResults] = useState([]); // Resultados de búsqueda
  const [searchListName, setSearchListName] = useState('');
  const [ followLists, setFollowLists ] = useState('');
  const { followers, followersCount, followedLists, followL, unfollowList, fetchFollowers, fetchFollowersCount, fetchFollowedLists, setFollowedLists } = useListFollowers(token);

  // Resultados generales
  const [searchTerm, setSearchTerm] = useState("");
  const handleGeneralSearch = async () => {
    try {
      const [artists, albums, songs] = await Promise.all([
        searchArtists(searchTerm),
        searchAlbums(searchTerm),
        searchSongs(searchTerm),
      ]);
      setArtistResults(artists);
      setAlbumResults(albums);
      setSongResults(songs);
      setSelectedArtistAlbums([]);
      setSelectedAlbumSongs([]);
      setSelectedAlbumSongsFromArtist([]);

      // Contadores favoritos (puedes mover esto a una función auxiliar si prefieres)
      const artistCounts = {};
      const albumCounts = {};
      const songCounts = {};

      await Promise.all([
        ...artists.map(async (a) => {
          artistCounts[a.id] = (await getFavoriteCount(a.id)) || 0;
        }),
        ...albums.map(async (a) => {
          albumCounts[a.id] = (await getFavoriteCount(a.id)) || 0;
        }),
        ...songs.map(async (s) => {
          songCounts[s.id] = (await getFavoriteCount(s.id)) || 0;
        }),
      ]);

      setFavoriteCounts({
        artists: artistCounts,
        albums: albumCounts,
        songs: songCounts,
      });
    } catch (e) {
      alert("Error en la búsqueda general");
      console.error(e);
    }
  };

  // Favoritos contadores
  const [favoriteCounts, setFavoriteCounts] = useState({
    artists: {},
    albums: {},
    songs: {},
  });

  // Funciones de búsqueda y carga datos

  // --- ARTISTAS ---
  const handleSearchArtist = async () => {
    try {
      const results = await searchArtists(searchTermArtist);
      setArtistResults(results);
      setSelectedArtistAlbums([]);
      setSelectedAlbumSongsFromArtist([]);
      // Fetch favoritos en paralelo
      const counts = {};
      await Promise.all(
        results.map(async (artist) => {
          counts[artist.id] = (await getFavoriteCount(artist.id)) || 0;
        })
      );
      setFavoriteCounts((prev) => ({ ...prev, artists: counts }));
    } catch (e) {
      alert("Error al buscar artistas");
      console.error(e);
    }
  };

  // Cuando pulsas un artista: cargar sus álbumes y limpiar canciones
  const handleSelectArtist = async (artistId) => {
    try {
      const albums = await getAlbumsByArtist(artistId);
      setSelectedArtistAlbums(albums);
      setSelectedAlbumSongsFromArtist([]);
      // Favoritos álbumes en paralelo
      const counts = {};
      await Promise.all(
        albums.map(async (album) => {
          counts[album.id] = (await getFavoriteCount(album.id)) || 0;
        })
      );
      setFavoriteCounts((prev) => ({ ...prev, albums: counts }));
    } catch (e) {
      alert("Error al obtener álbumes del artista");
      console.error(e);
    }
  };

  // Cuando pulsas un álbum (de artista): cargar canciones
  const handleSelectAlbumFromArtist = async (releaseGroupId) => {
    try {
      const releases = await getReleasesByReleaseGroup(releaseGroupId);
      if (releases.length === 0) {
        setSelectedAlbumSongsFromArtist([]);
        return;
      }
      const songs = await getSongsByRelease(releases[0].id);
      setSelectedAlbumSongsFromArtist(songs);
      // Favoritos canciones
      const counts = {};
      await Promise.all(
        songs.map(async (song) => {
          counts[song.id] = (await getFavoriteCount(song.id)) || 0;
        })
      );
      setFavoriteCounts((prev) => ({ ...prev, songs: counts }));
    } catch (e) {
      alert("Error al obtener canciones del álbum");
      console.error(e);
    }
  };

  // --- ÁLBUMES ---
  const handleSearchAlbums = async () => {
    try {
      const results = await searchAlbums(searchTermAlbum);
      setAlbumResults(results);
      setSelectedAlbumSongs([]);
      // Favoritos álbumes
      const counts = {};
      await Promise.all(
        results.map(async (album) => {
          counts[album.id] = (await getFavoriteCount(album.id)) || 0;
        })
      );
      setFavoriteCounts((prev) => ({ ...prev, albums: counts }));
    } catch (e) {
      alert("Error al buscar álbumes");
      console.error(e);
    }
  };

  // Cuando pulsas un álbum (buscador álbumes), carga canciones
  const handleSelectAlbumFromAlbumSearch = async (releaseGroupId) => {
    try {
      const releases = await getReleasesByReleaseGroup(releaseGroupId);
      if (releases.length === 0) {
        setSelectedAlbumSongs([]);
        return;
      }
      const songs = await getSongsByRelease(releases[0].id);
      setSelectedAlbumSongs(songs);
      // Favoritos canciones
      const counts = {};
      await Promise.all(
        songs.map(async (song) => {
          counts[song.id] = (await getFavoriteCount(song.id)) || 0;
        })
      );
      setFavoriteCounts((prev) => ({ ...prev, songs: counts }));
    } catch (e) {
      alert("Error al obtener canciones del álbum");
      console.error(e);
    }
  };

  // --- CANCIONES ---
  const handleSearchSongs = async () => {
    try {
      const results = await searchSongs(searchTermSong);
      setSongResults(results);
      // Favoritos canciones
      const counts = {};
      await Promise.all(
        results.map(async (song) => {
          counts[song.id] = (await getFavoriteCount(song.id)) || 0;
        })
      );
      setFavoriteCounts((prev) => ({ ...prev, songs: counts }));
    } catch (e) {
      alert("Error al buscar canciones");
      console.error(e);
    }
  };

  // Toggle favorito para cualquier tipo
  const handleFavoriteToggle = async (id, type) => {
    try {
      if (isFavorite(id)) {
        await removeFavorite(id);
      } else {
        await addFavorite(id, type);
      }
      const newCount = await getFavoriteCount(id);
      setFavoriteCounts((prev) => ({
        ...prev,
        [`${type}s`]: {
          ...prev[`${type}s`],
          [id]: newCount,
        },
      }));
    } catch (e) {
      console.error("Error alternando favorito", e);
    }
  };

  // Fetch ratings para todos los mbids visibles
  useEffect(() => {
    const allMbids = [
      ...artistResults.map((a) => a.id),
      ...selectedArtistAlbums.map((a) => a.id),
      ...selectedAlbumSongsFromArtist.map((s) => s.id),
      ...albumResults.map((a) => a.id),
      ...selectedAlbumSongs.map((s) => s.id),
      ...songResults.map((s) => s.id),
    ];
    if (token && allMbids.length > 0) {
      fetchMultipleItemRatings(allMbids).catch((err) =>
        console.error("Error obteniendo ratings", err)
      );
    }
    fetchAllLists();
    fetchAllUsers(token);
  }, [
    artistResults,
    selectedArtistAlbums,
    selectedAlbumSongsFromArtist,
    albumResults,
    selectedAlbumSongs,
    songResults,
    token,
    fetchMultipleItemRatings,
  ]);

  // Helper para mostrar lista con rating y favorito
  const renderItemList = (items, type, onClickItem, highlightColor) => (
    <ul
      style={{
        paddingLeft: 0,
        listStyle: "none",
        maxminminHeight: "30vh",
        overflowY: "auto",
      }}
    >
      {items.map((item) => (
        <li
          key={item.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #ddd",
            padding: "6px 0",
            cursor: onClickItem ? "pointer" : "default",
          }}
        >
          <span
            onClick={onClickItem ? () => onClickItem(item.id) : undefined}
            style={{
              color: highlightColor || "black",
              textDecoration: onClickItem ? "underline" : "none",
              flexGrow: 1,
            }}
          >
            {type === "album" && item.title
              ? `${item.title}${item.artist ? " — " + item.artist : ""}`
              : type === "song" && item.title
              ? `${item.title}${item.album ? " — " + item.album : ""}${item.artist ? " — " + item.artist : ""}`
              : item.name || item.title}
          </span>
          <RatingDisplay
            mbid={item.id}
            type={type}
            getItemStats={getItemStats}
            getRatingFor={getRatingFor}
            rateItem={rateItem}
            deleteRating={deleteRating} />

          <IconButton
            onClick={() => handleFavoriteToggle(item.id, type)}
            color={isFavorite(item.id) ? "error" : "default"}
            size="small"
          >
            <FontAwesomeIcon
              icon={isFavorite(item.id) ? solidHeart : regularHeart}
            />
          </IconButton>
          <Typography variant="body2" sx={{ ml: 1, minWidth: 25 }}>
            {favoriteCounts[`${type}s`][item.id] || 0}
          </Typography>
          {/* Botón + solo para canciones */}
          {type === "song" && (
            <Button
              variant="contained"
              size="small"
              sx={{ ml: 1, backgroundColor:'#ff6600'}}
              onClick={() => handleOpenListModal(item)}
            >
              +
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
  /*Buscar listas */
  const handleSearchListByName = useCallback(async () => {
          setLoading(true);
          setError(null);
          try {
            const currentUser = await getCurrentUser(); // Asegúrate de obtener el usuario actual
            if (!currentUser || !currentUser._id) {
              alert(t('errorFetchingUserId'));
              return;
            }
            await fetchListsByUser(currentUser._id);
            await fetchFollowedLists(currentUser._id);

            const filteredLists = lists.filter(list =>
              list.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
              list.creator._id !== currentUser._id // Filtra las listas que no son del usuario actual
            );

            setSearchResults(filteredLists);
            console.log('Filtered lists (excluding user-owned):', filteredLists);
          } catch (err) {
            setError(err.message || 'Error fetching lists');
          } finally {
            setLoading(false);
          }
        }, [lists, searchTerm, getCurrentUser, t]);

        const handlefollowList = async (listId) => {
              try {
                console.log('List followed successfully:', listId);
                await followL(listId);
                
                const currentUser= await getCurrentUser();
                await fetchFollowedLists(currentUser._id);
                alert(t('listFollowed')); // Muestra un mensaje de éxito
              } catch (err) {
                console.error('Error following list:', err);
                alert(t('errorFollowingList')); // Muestra un mensaje de error
              }
            }
    // Buscar usuarios
    const handleSearchUser = async () => {
    try {
      const user = await getCurrentUser();
      await fetchFollowing(user._id);
      if (users.length > 0) {
      const filtered = users
        .filter(u => u._id !== user._id)
        .filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()));
         
        setSearches(filtered);
        console.log('Filtered users:', filtered);
      };
    } catch (err) {
      setError(err.message || 'Error fetching users');
    }
  };

  const isFollowing = useCallback((userId) => {
    return following.some(f => f.followed && f.followed._id === userId);
  }, [following]);
  
 

  const handleFollow = async (followedId) => {
    try {
      await follow(followedId); // Llama a la función follow
      const user = await getCurrentUser()
      await fetchFollowing(user._id);
      alert(t('userFollowed')); // Muestra un mensaje de éxito
    } catch (err) {
      console.error('Error following user:', err);
      alert(t('errorFollowingUser')); // Muestra un mensaje de error
    }
  };
  const handleOpenListModal = async (song) => {
    const user = await getCurrentUser();
    await fetchListsByUser(user._id);
    setSelectedSong(song); // Guarda el id de la canción
    setOpen(true);
  };

  const handleAddSong = async () => {
  try {
    console.log('SELECTED SONG:', selectedSong);
    await addSong(selectedListId, selectedSong.id, selectedSong.title, selectedSong.artist, selectedSong.coverUrl, selectedSong.releaseDate, selectedSong.duration);
    alert('Canción añadida correctamente');
    setOpen(false); // Cierra el modal si quieres
  } catch (err) {
    alert('Error al añadir la canción');
    console.error(err);
  }
};

  const handleCloseListModal = () => {
    setOpen(false); // Cierra el modal
  };

 


  return (
        <Container >
          <Box sx={{ display: 'flex', justifyContent:'center', alignItems: "center", gap: 2, width: '100%' }}>
          <CustomTextField
            label="Buscar artistas, álbumes, canciones, listas, usuarios "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleGeneralSearch();
                handleSearchListByName();
                handleSearchUser();
              }
            }}
            margin="normal"/>
          <Button variant="contained"   onClick={() => { handleGeneralSearch(); handleSearchListByName(); handleSearchUser(); }}> <FontAwesomeIcon icon= {faMagnifyingGlass} /> </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 2, overflow: "auto", flexWrap: "wrap" }} >
          {/* COLUMNA ARTISTAS */}
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: 'center', alignItems:'center', gap: 2, width:'100%' }} >
            {artistResults.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Artistas encontrados</Typography>
              {renderItemList(
                artistResults,
                "artist",
                handleSelectArtist,
                "blue"
              )}
            </>
          )}
            {selectedArtistAlbums.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Álbumes del artista</Typography>
              {renderItemList(
                selectedArtistAlbums,
                "album",
                handleSelectAlbumFromArtist,
                "darkgreen"
              )}
            </>
          )}

            {selectedAlbumSongsFromArtist.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Canciones del álbum</Typography>
              {renderItemList(selectedAlbumSongsFromArtist, "song", null, null)}
            </>
          )}
            
          </Box>

          {/* COLUMNA ALBUMES */}
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: 'center', alignItems:'center', gap: 2, width:'100%' }} >
            {albumResults.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Álbumes encontrados</Typography>
              {renderItemList(
                albumResults,
                "album",
                handleSelectAlbumFromAlbumSearch,
                "blue"
              )}
            </>
          )}

          {selectedAlbumSongs.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Canciones del álbum</Typography>
              {renderItemList(selectedAlbumSongs, "song", null, null)}
            </>
          )}
          </Box>

          {/* COLUMNA CANCIONES */}
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: 'center', alignItems:'center', gap: 2, width:'100%'}} >
            {songResults.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Canciones encontradas</Typography>
              {renderItemList(songResults, "song", null, null)}
            </>
          )}
            <Dialog open={open} onClose={handleCloseListModal}>
              <DialogTitle>{t('addsong')}</DialogTitle>
              <DialogContent>
                <select
                  value={selectedListId}
                  onChange={e => setSelectedListId(e.target.value)}>
                    <option value="" disabled>{t('selectAList') || 'Selecciona una lista'}</option>
                    {userLists.map((list) => (
                    <option key={list._id} value={list._id}>
                    {list.name}
                    </option>
                  ))}
                </select>
              </DialogContent>
              <DialogActions>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddSong}
                  disabled={!selectedSong || !selectedListId}>
                  {t('save')}
                </Button>
                <Button onClick={handleCloseListModal} color="secondary">
                  {t('cancel')}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>


          {/* COLUMNA LISTAS */}
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: 'center', alignItems:'center', gap: 2, width:'100%'}} >
          {searchResults.length > 0 && (
              <>
                  {searchResults.map(l => (
                    <Card key={l._id} sx={{ width: "45%" }}> 
                      <CardContent>
                        <Typography variant="h6" color="primary">{t('list')}</Typography>
                        <Divider />
                        <Typography variant="h5" sx={{ mb: 1 }}>{l.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {t('Canciones')}: {l.songs.join(', ')}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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
                   </>
                )}     
          </Box>
          { /* COLUMNA USUARIOS */}
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: 'center', alignItems:'center', gap: 2, width:'100%'}} >
                {searches.map(user => (
                  <Card key={user._id} sx={{ width: "45%" }}>
                  <CardContent>
                  <Typography variant="h6" color="primary">{t('user')}</Typography>
                    <Divider />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={user.profilePic ? `http://localhost:5000/uploads/${user.profilePic}` : '/default-avatar.png'}
                       alt={user.name}
                       sx={{ width: 56, height: 56, mr: 2 }}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h5" color="primary">{user.name} </Typography>
                    <Typography variant="h6" color="primary">({user.username}) </Typography>
                    <Typography>{t('bio')}:{user.bio} </Typography>
                    </Box>
                    
                    {isFollowing(user._id) ? (
                      <Typography sx={{ ml: 2, color: 'green', display: 'inline-block' }}>
                        {t('following')}
                      </Typography>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleFollow(user._id)}
                        sx={{ ml: 2 }}
                      >
                        {t('follow')}
                      </Button>
                    )}
                    </Box>
                    </CardContent>
                  </Card>
                ))}
          </Box>
    </Box>
    </Container>

  );
}


export default Search;