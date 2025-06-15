import { useEffect, useState, useContext, useCallback } from "react";
import { UserContext } from "../context/UserContext";
import { useTranslation } from 'react-i18next';
import RatingDisplay from "../components/RatingDisplay";
import useRatings from "../hooks/useRatings";
import { Avatar, Box, Typography, Button, TextField, IconButton, Divider, Dialog, DialogTitle, DialogContent, DialogActions, styled, Card, CardContent } from "@mui/material";
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
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Menu2 from '../components/Menu2'
import { Link } from 'react-router-dom'; // Asegúrate de importar Link
<<<<<<< HEAD
import InfoModal from '../components/InfoModal';


=======
import baseUrl from "../config.js";
>>>>>>> develop

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

const FollowBox = styled(Box)`
    display: flex;
    flex-wrap: wrap; 
    justify-content: center; 
    gap: 2;
    width: 100%;

    @media (max-width: 960px) {
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    width: 100vw;
  }

    `;

  const FollowBoxContent = styled(Box)`
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    margin-top: 10px; 
    width: 45%; 
    height: 40vh;
    overflow-y: auto;
    
    @media (max-width: 960px) {
    width: 95%
    }

`;
const FollowCard = styled(Card)`
    width: 650px; 
    padding: 15px; 
    display: flex; 
   
    align-items: center;

    @media (max-width: 960px) {
    width: 95%
    }
`;

const ButtonBox= styled(Box)`
  width:100%;
  display: flex;
  justify-content:end;
  gap: 15px;
  padding: 10px 20px 0 0;
`;

function ResultsPage() {
  const { token, user } = useContext(UserContext);
  console.log("USER CONTEXT:", user.userId);
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
  const [searches, setSearches] = useState([]);
  const { follower, follow, following, fetchFollowing } = useFollow(token);
  //parámetro de búsqueda que viene desde menú
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get('query') || '';

  // Resultados búsqueda
  const [artistResults, setArtistResults] = useState([]);
  const [albumResults, setAlbumResults] = useState([]);
  const [songResults, setSongResults] = useState([]);
  //estados listas
  const [openSongsModal, setOpenSongsModal] = useState(false);
  const [selectedListSongs, setSelectedListSongs] = useState([]);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ type: '', data: null });
  const favoriteProps = useFavorites(token);
  const ratingProps = useRatings(token);

  // Selecciones para cargar info relacionada
  const [selectedArtistAlbums, setSelectedArtistAlbums] = useState([]);
  const [selectedAlbumSongsFromArtist, setSelectedAlbumSongsFromArtist] =
    useState([]);

  const [selectedAlbumSongs, setSelectedAlbumSongs] = useState([]);
  const [open, setOpen] = useState(false); // Estado para controlar el modal
  const [selectedSong, setSelectedSong] = useState(null); //canciones dentro del modal
  const { users, fetchAllUsers, getCurrentUser } = useUser(token);
  const { lists, userLists, fetchAllLists, createNewList, removeList, renameList, fetchListsByUser, addSong, fetchListById } = useList(token);
  const [selectedListId, setSelectedListId] = useState("");
  const [searchResults, setSearchResults] = useState([]); // Resultados de búsqueda
  const { followers, followersCount, followedLists, followL, unfollowList, fetchFollowers, fetchFollowersCount, fetchFollowedLists, setFollowedLists } = useListFollowers(token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Resultados generales
  const [searchTerm, setSearchTerm] = useState("");

  const handleGeneralSearch = async (term = searchTerm) => {
  if (!term || !term.trim()) return;
  try {
    const [artists, albums, songs] = await Promise.all([
      searchArtists(term).catch(e => { console.error("Error searchArtists", e); return []; }),
      searchAlbums(term).catch(e => { console.error("Error searchAlbums", e); return []; }),
      searchSongs(term).catch(e => { console.error("Error searchSongs", e); return []; }),
    ]);
    setArtistResults(artists);
    setAlbumResults(albums);
    setSongResults(songs);
    setSelectedArtistAlbums([]);
    setSelectedAlbumSongs([]);
    setSelectedAlbumSongsFromArtist([]);

    // Contadores favoritos
    const artistCounts = {};
    const albumCounts = {};
    const songCounts = {};

    await Promise.all([
      ...artists.map(async (a) => {
        try {
          artistCounts[a.id] = (await getFavoriteCount(a.id)) || 0;
        } catch (e) {
          console.error("Error getFavoriteCount artist", a.id, e);
          artistCounts[a.id] = 0;
        }
      }),
      ...albums.map(async (a) => {
        try {
          albumCounts[a.id] = (await getFavoriteCount(a.id)) || 0;
        } catch (e) {
          console.error("Error getFavoriteCount album", a.id, e);
          albumCounts[a.id] = 0;
        }
      }),
      ...songs.map(async (s) => {
        try {
          songCounts[s.id] = (await getFavoriteCount(s.id)) || 0;
        } catch (e) {
          console.error("Error getFavoriteCount song", s.id, e);
          songCounts[s.id] = 0;
        }
      }),
    ]);

    setFavoriteCounts({
      artists: artistCounts,
      albums: albumCounts,
      songs: songCounts,
    });
  } catch (e) {
    alert("Error en la búsqueda general");
    console.error("Error en la búsqueda general:", e);
  }
};

  // Favoritos contadores
  const [favoriteCounts, setFavoriteCounts] = useState({
    artists: {},
    albums: {},
    songs: {},
  });
  

  // Funciones de búsqueda y carga datos
  useEffect(() => {
    if (query && query.trim()) {
      setSearchTerm(query);
      handleGeneralSearch(query);
      handleSearchListByName(query);
      handleSearchUser(query);
    }
    // eslint-disable-next-line
  }, [query, users, lists]);
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
  const handleFavoriteToggleResult = async (id, type) => {
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
          <Typography
            onClick={onClickItem ? () => onClickItem(item.id) : undefined}
            sx={{
              color: "text.primary",
              textDecoration: onClickItem ? "underline" : "none",
              flexGrow: 1,
              fontWeight: "bold", // negrita
              cursor: onClickItem ? "pointer" : "default",
            }}
          >
            {type === "album" && item.title
              ? `${item.title}${item.artist ? " — " + item.artist : ""}`
              : type === "song" && item.title
              ? `${item.title}${item.album ? " — " + item.album : ""}${
                  item.artist ? " — " + item.artist : ""
                }`
              : item.name || item.title}
          </Typography>
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
            onClick={() => handleFavoriteToggleResult(item.id, type)}
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
  
//cargar listas y usuarios
useEffect(() => {
  fetchAllLists();
  fetchAllUsers(token);
  fetchFollowedLists(user.userId);
  // eslint-disable-next-line
}, []);

//funciones para buscar listas
const handleSearchListByName = useCallback((term = searchTerm) => {
  setLoading(true);
  setError(null);
  try {
    if (!user || !user.userId) {
      alert(t('errorFetchingUserId'));
      return;
    }
    // Filtra en memoria
    const filteredLists = lists.filter(list =>
      list.name.toLowerCase().includes(term.toLowerCase()) &&
      list.creator._id !== user.userId
    );
    setSearchResults(filteredLists);
    console.log('Filtered lists (excluding user-owned):', filteredLists);
    console.log("followedLists:", followedLists);
    console.log("searchResults:", searchResults);
  } catch (err) {
    setError(err.message || 'Error fetching lists');
  } finally {
    setLoading(false);
  }
}, [lists, searchTerm, t, user]);

const handlefollowList = async (listId) => {
  try {
    await followL(listId);
    if (!user || !user.userId) return;
    await fetchFollowedLists(user.userId); // <-- Esto refresca el estado
    alert(t('listFollowed'));
  } catch (err) {
    console.error('Error following list:', err);
    alert(t('errorFollowingList'));
  }
};

const handleOpenListModal = async (song) => {
    await fetchListsByUser(user.userId);
    setSelectedSong(song); // Guarda el id de la canción
    setOpen(true);
  };

  const handleCloseListModal = () => {
    setOpen(false); // Cierra el modal
  };

  const handleAddSong = async () => {
  try {
    console.log('SELECTED SONG')
    await addSong(selectedListId, selectedSong.id, selectedSong.title, selectedSong.artist, selectedSong.coverUrl, selectedSong.releaseDate, selectedSong.duration);
    alert('Canción añadida correctamente');
    setOpen(false); // Cierra el modal si quieres
  } catch (err) {
    alert('Error al añadir la canción');
    console.error(err);
  }
};

const handleOpenSongsModal = async (list) => {
  let songs = list.songs;
  // Si las canciones no tienen título, intenta obtenerlas (si tienes fetchListById, úsala aquí)
  if (!songs.length || !songs[0].title) {
    // Si tienes fetchListById, úsala aquí. Si no, busca en lists:
    const found = lists.find(l => l._id === list._id);
    songs = found && found.songs ? found.songs : [];
  }
  setSelectedListSongs(songs);
  setSelectedListId(list._id);
  setOpenSongsModal(true);
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
  const updateFavoriteCount = async (id) => {
  try {
    const count = await favoriteProps.getFavoriteCount(id);
    setFavoriteCounts(prev => ({ ...prev, [id]: count }));
  } catch (err) {
    console.error("Error updating favorite count", err);
  }
};
const [favoriteCountSongList, setFavoriteCountSongList] = useState({});
const closeDetail = () => {
        setInfoModalOpen(false);
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


//funciones para buscar usuarios 
const handleSearchUser = async (term = searchTerm) => {
    try {
      await fetchFollowing(user.userId);
      if (users.length > 0) {
      const filtered = users
        .filter(u => u._id !== user.userId)
        .filter(u => u.username.toLowerCase().includes(term.toLowerCase()));
         
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
      await fetchFollowing(user.userId);
      alert(t('userFollowed')); // Muestra un mensaje de éxito
    } catch (err) {
      console.error('Error following user:', err);
      alert(t('errorFollowingUser')); // Muestra un mensaje de error
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Menu2/>
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
              <Typography variant="h4">{t('artistsFound')}</Typography>
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
              <Typography variant="h5">{t('artistsAlbumFound')}</Typography>
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
              <Typography variant="h5">{t('albumSongsFound')}</Typography>
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
              <Typography variant="h4">{t('albumFound')}</Typography>
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
              <Typography variant="h5">{t('albumSongsFound')}</Typography>
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
              <Typography variant="h4">{t('songsFound')}</Typography>
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
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                {t('foundLists')}
              </Typography>)}
            {searchResults.map(l => (
              <ListCard key={l._id} >
                <ListCardContent>
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
                  <Divider/>
                
                    <Typography variant="body2" color="text.secondary">
                      {t('creator')}: {l.creator.name || t('unknown')}
                    </Typography>
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
                    {followedLists.some(followed => String(followed._id) === String(l._id)) ? (
                      <ButtonBox>
                        <Typography color="success.main">{t('following')}</Typography>
                      </ButtonBox>
                    ) : (
                      <ButtonBox>
                      <Button onClick={() => handlefollowList(l._id)} sx={{backgroundColor: '#d63b1f', color: 'white'}}>
                        {t('follow')}
                      </Button>
                      </ButtonBox>
                    )}
                  </Box>
                </ListCardContent>
              </ListCard>
            ))}
            </Box>
            {/* COLUMNA Usuarios */}
              {searches.length > 0 && (
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                {t('foundUsers')}
              </Typography>
            )}
            <FollowBoxContent>
              {searches.map(user => (
<<<<<<< HEAD
                
                  <FollowCard key={user._id} >
                    <Avatar
                      src={user.profilePic ? `http://localhost:5000/uploads/${user.profilePic}` : '/assets/images/profilepic_default.png'}
                      alt={user.name}
                      sx={{ width: 100, height: 100, mr: 2 }}
                    />
                  <CardContent sx={{ width: '100%' }}>
                      <Typography
                        variant="h5"
                        component={Link}
                        to={`/userresult/${user._id}`}
                        sx={{
                          color: 'text.primary',
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {user.name}
                      </Typography>
                      <Divider/>
                      <Box sx={{ display: 'flex', gap: 3, mt: 1, justifyContent:'space-between'}}>
                        <Box >
                          <Typography variant="body2" color="text.secondary">email: {user.email}</Typography>
                          <Typography variant="body2" color="text.secondary">{t('since')}: {new Date(user.createdAt).toLocaleDateString()}</Typography>
                          <Typography variant="body2" color="text.secondary">{t('bio')}: {user.bio || t('noBio')}</Typography>
                        </Box>
                      
                      {/* Botón Follow/Following */}
                      {isFollowing(user._id) ? (
                        <Typography color="success.main">{t('following')}</Typography>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleFollow(user._id)}
                          sx={{ mt: 1 }}
                        >
                          {t('follow')}
                        </Button>
                      )}
                      </Box>
                    </CardContent>
                  </FollowCard>
                
=======
                <Card key={user._id} sx={{ width: 400, display: 'flex', alignItems: 'center', p: 2, mb: 2 }}>
                  <Avatar
                    src={user.profilePic ? `${baseUrl}/uploads/${user.profilePic}` : '/assets/images/profilepic_default.png'}
                    alt={user.name}
                    sx={{ width: 100, height: 100, mr: 2 }}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      component={Link}
                      to={`/userresult/${user._id}`}
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        '&:hover': { color: 'secondary.main' }
                      }}
                    >
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                    <Typography variant="body2" color="text.secondary">{t('bio')}: {user.bio || t('noBio')}</Typography>
                  </CardContent>
                </Card>
>>>>>>> develop
              ))}
              </FollowBoxContent>
              
          
      </Box>
      <Dialog open={openSongsModal} onClose={() => setOpenSongsModal(false)}>
        <DialogTitle>{t('songs')}</DialogTitle>
        <DialogContent>
          <ul>
            {selectedListSongs.length === 0 && (
              <Typography variant="body2" color="text.secondary">{t('noSongs')}</Typography>
            )}
            {selectedListSongs.map((song, index) => (
              <li key={index}>
                {song.title
                  ? `${song.title} - ${song.artistName || ''}`
                  : song.musicbrainzId || song._id || t('noTitle')}
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
              />
           
    </Box>
  );
}

export default ResultsPage;
