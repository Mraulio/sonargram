import { useEffect, useState, useContext, useCallback } from "react";
import { UserContext } from "../context/UserContext";
import { useTranslation } from 'react-i18next';
import RatingDisplay from "../components/RatingDisplay";
import useRatings from "../hooks/useRatings";
import { Box, Typography, Button, TextField, IconButton, Divider, Dialog, DialogTitle, DialogContent, DialogActions, styled, Card, CardContent } from "@mui/material";
import Menu from "../components/Menu";
import { searchArtists, searchAlbums, searchSongs, getAlbumsByArtist, getSongsByRelease, getReleasesByReleaseGroup } from "../api/external/apiMB";
import useFavorites from "../hooks/useFavorites";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import useUser from '../hooks/useUser';
import useList from '../hooks/useList';
import useFollow from '../hooks/useFollow';
import useListFollowers from '../hooks/useListFollowers';

const CustomTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    
    '& fieldset': {
      border: 'none',
      borderBottom: '2px solid #3e4a4c', // solo borde abajo, cambia el color si quieres
      borderRadius: 0,
    },
    '&:hover fieldset': {
      border: 'none',
      borderBottom: '2px solid #3e4a4c',
    },
    '&.Mui-focused fieldset': {
      border: 'none',
      borderBottom: '2px solid #3e4a4c',
    },
  },
  '& label': {
    color: '#3e4a4c',
  },
  '& label.Mui-focused': {
    color: '#3e4a4c',
  },
  width: '20vw',
});

function Search() {
  const { token } = useContext(UserContext);
  const { t } = useTranslation();  // Hook para obtener las traducciones
  const {
    rateItem,
    deleteRating,
    getItemStats,
    getRatingFor,
    fetchMultipleItemRatings,
  } = useRatings(token);
  const { addFavorite, removeFavorite, isFavorite, getFavoriteCount } =
    useFavorites(token);

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
  const [open, setOpen] = useState(false); // Estado para controlar el modal
  const [selectedSong, setSelectedSong] = useState(null); //canciones dentro del modal
  const { users, fetchAllUsers, getCurrentUser } = useUser(token);
  const { lists, userLists, fetchAllLists, createNewList, removeList, renameList, fetchListsByUser, addSong } = useList(token);
  const [selectedListId, setSelectedListId] = useState("");
  const [searchResults, setSearchResults] = useState([]); // Resultados de búsqueda
  const { followers, followersCount, followedLists, followL, unfollowList, fetchFollowers, fetchFollowersCount, fetchFollowedLists, setFollowedLists } = useListFollowers(token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
        // Aquí buscamos el item en la lista correcta para sacar título, artista, cover
        let item;

        if (type === "artist") {
          item = artistResults.find((a) => a.id === id);
        } else if (type === "album") {
          item =
            albumResults.find((a) => a.id === id) ||
            selectedArtistAlbums.find((a) => a.id === id);
        } else if (type === "song") {
          item =
            songResults.find((s) => s.id === id) ||
            selectedAlbumSongsFromArtist.find((s) => s.id === id) ||
            selectedAlbumSongs.find((s) => s.id === id);
        }

        await addFavorite(
          id,
          type,
          item?.title || item?.name || "", // título o nombre
          item?.artist || item?.artistName || "", // nombre artista
          item?.coverUrl || "", // url de portada si tienes
          item?.releaseDate || "",
          item?.duration || "",
        );
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
        maxHeight: "30vh",
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
          {type === "album" && item.coverUrl && (
            <img
              src={item.coverUrl}
              alt="Cover"
              style={{
                width: 40,
                height: 40,
                objectFit: "cover",
                marginRight: 8,
                borderRadius: 4,
              }}
            />
          )}
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
              ? `${item.title}${item.album ? " — " + item.album : ""}${
                  item.artist ? " — " + item.artist : ""
                }`
              : item.name || item.title}
          </span>
          <Typography
            variant="body2"
            sx={{ mr: 3, minWidth: 60, textAlign: "right" }}
          >
            {type === "song"
              ? formatDuration(item.duration)
              : type === "album"
              ? item?.releaseDate?.split("-")[0] || "" // Año de release
              : ""}
          </Typography>
          <RatingDisplay
            mbid={item.id}
            type={type}
            getItemStats={getItemStats}
            getRatingFor={getRatingFor}
            rateItem={rateItem}
            deleteRating={deleteRating}
            title={item.title || item.name}
            artistName={item.artist || item.artistName || ""}
            coverUrl={item.coverUrl || ""}
            releaseDate={item.releaseDate || ""}
            duration={item.duration || ""}
          />

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
  const formatDuration = (ms) => {
    if (!ms) return "";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  const handleOpenListModal = async (song) => {
    const user = await getCurrentUser();
    await fetchListsByUser(user._id);
    setSelectedSong(song); // Guarda el id de la canción
    setOpen(true);
  };

  const handleCloseListModal = () => {
    setOpen(false); // Cierra el modal
  };

  const handleAddSong = async () => {
  try {
    await addSong(selectedListId, selectedSong.id, selectedSong.title, selectedSong.artist, selectedSong.coverUrl, selectedSong.releaseDate, selectedSong.duration);
    alert('Canción añadida correctamente');
    setOpen(false); // Cierra el modal si quieres
  } catch (err) {
    alert('Error al añadir la canción');
    console.error(err);
  }
};
useEffect(() => {
  fetchAllLists();
  fetchAllUsers(token);
}, [fetchAllLists, fetchAllUsers, token]);
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{display: 'flex', width: '50vw'}}>  
        <CustomTextField
          fullWidth
          label="Buscar artistas, álbumes o canciones"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGeneralSearch()}
          margin="normal"
        />
        <Button onClick={() => { handleGeneralSearch(); handleSearchListByName(); }}><FontAwesomeIcon style={{fontSize: 24, color: '#3e4a4c'}} icon={faMagnifyingGlass} />
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          px: 2,
          gap: 2,
          overflow: "auto",
          
        }}
      >
        {/* COLUMNA ARTISTAS */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            borderRadius: 1,
            p: 2,
            overflowY: "auto",
          }}
        >

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
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            borderRadius: 1,
            p: 2,
            overflowY: "auto",
          }}
        >
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
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            borderRadius: 1,
            p: 2,
            overflowY: "auto",
          }}
        >

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
          <Box sx={{ display: "flex", flexDirection:'column', gap: 2 }}>
            {searchResults.length > 0 && (
                <>
                <Typography>Listas</Typography>
                {searchResults.map(l => (
                    <Card key={l._id} sx={{ width: "80%", mb: 2,  }}>
                    <CardContent>
                        <Typography variant="h5" sx={{ mb: 1 }}>{l.name}</Typography>
                        <Divider/>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {t('songs')}: {l.songs.join(', ')}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {t('creator')}: {l.creator.name || t('unknown')}
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
      </Box>
    </Box>
  );
}

export default Search;
