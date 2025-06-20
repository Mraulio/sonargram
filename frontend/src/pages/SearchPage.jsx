import { useEffect, useState, useContext, useCallback } from "react";
import { UserContext } from "../context/UserContext";
import RatingDisplay from "../components/RatingDisplay";
import useRatings from "../hooks/useRatings";
import useFavorites from "../hooks/useFavorites";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Divider,
  styled,
  Card,
  CardContent,
  Avatar,
  Link
} from "@mui/material";
import Menu from "../components/Menu";
import {
  searchArtists,
  searchAlbums,
  searchSongs,
  getAlbumsByArtist,
  getSongsByRelease,
  getReleasesByReleaseGroup,
} from "../api/external/apiMB";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import ItemList from "../components/ItemList";
import { useTranslation } from 'react-i18next';
import useList from "../hooks/useList";
import useListFollowers from "../hooks/useListFollowers";
import { showToast } from "../utils/toast.js";
import useFollow from "../hooks/useFollow";
import useUser from "../hooks/useUser";
import InfoModal from '../components/InfoModal';



const ResultBox = styled(Box)`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    width: 100%;
  
    @media (max-width: 960px) {
        flex-direction: column;

    }
`;

const ListCard= styled(Card)`
  width: 100%;
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
    width: 100% 
    padding: 15px; 
    display: flex; 
    justify-content: space-around;
   
    align-items: center;

    @media (max-width: 960px) {
    width: 100%
    }
`;

const ButtonBox= styled(Box)`
  width:100%;
  display: flex;
  justify-content:end;
  gap: 15px;
  padding: 10px 20px 0 0;
`;

const ResultBoxUL = styled(Box)`
  display: flex; 
  flex-direction: column; 
  gap: 15px; 
  width: 40%;
  padding: 10px;
  justify-content: center;
  @media (max-width: 960px) {
    width: 100%;
  }
  `;

function SearchPage() {
    const { t } = useTranslation();  // Hook para obtener las traducciones
  const { token, user } = useContext(UserContext);
  const {
    rateItem,
    deleteRating,
    getItemStats,
    getRatingFor,
    fetchMultipleItemRatings,
  } = useRatings(token);
  const { addFavorite, removeFavorite, isFavorite, getFavoriteCount } =
    useFavorites(token);
 const { lists, userLists, fetchAllLists, createNewList, removeList, renameList, fetchListsByUser, addSong, fetchListById } = useList(token);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermArtist, setSearchTermArtist] = useState("");
  const [searchTermAlbum, setSearchTermAlbum] = useState("");
  const [searchTermSong, setSearchTermSong] = useState("");
  const [searchTermList, setSearchTermList] = useState("");
  const [searchTermUser, setSearchTermUser] = useState("");
  const [selectedListId, setSelectedListId] = useState("");
  const [searchResults, setSearchResults] = useState([]); // Resultados de búsqueda
   const { followers, followersCount, followedLists, followL, unfollowList, fetchFollowers, fetchFollowersCount, fetchFollowedLists, setFollowedLists } = useListFollowers(token);
const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [artistResults, setArtistResults] = useState([]);
  const [albumResults, setAlbumResults] = useState([]);
  const [songResults, setSongResults] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null); //canciones dentro del modal
    const [openSongsModal, setOpenSongsModal] = useState(false);
    const [selectedListSongs, setSelectedListSongs] = useState([]);
    const favoriteProps = useFavorites(token);
    const [modalData, setModalData] = useState({ type: '', data: null });
 const [infoModalOpen, setInfoModalOpen] = useState(false);
 const { follower, follow, following, fetchFollowing } = useFollow(token);
   const { users, fetchAllUsers, getCurrentUser } = useUser(token);
const [open, setOpen] = useState(false); // Estado para controlar el modal
  const [searches, setSearches] = useState([]);
  const [selectedArtistAlbums, setSelectedArtistAlbums] = useState([]);
  const [selectedAlbumSongsFromArtist, setSelectedAlbumSongsFromArtist] =
    useState([]);
  const [selectedAlbumSongs, setSelectedAlbumSongs] = useState([]);

  const [favoriteCounts, setFavoriteCounts] = useState({});

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

      const counts = {};

      await Promise.all([
        ...artists.map(async (a) => {
          counts[a.id] = (await getFavoriteCount(a.id)) || 0;
        }),
        ...albums.map(async (a) => {
          counts[a.id] = (await getFavoriteCount(a.id)) || 0;
        }),
        ...songs.map(async (s) => {
          counts[s.id] = (await getFavoriteCount(s.id)) || 0;
        }),
      ]);

      setFavoriteCounts(counts);
    } catch (e) {
      alert("Error en la búsqueda general");
      console.error(e);
    }
  };

  const handleSearchArtist = async () => {
    try {
      const results = await searchArtists(searchTermArtist);
      setArtistResults(results);
      setSelectedArtistAlbums([]);
      setSelectedAlbumSongsFromArtist([]);
      const counts = {};
      await Promise.all(
        results.map(async (artist) => {
          counts[artist.id] = (await getFavoriteCount(artist.id)) || 0;
        })
      );
      setFavoriteCounts((prev) => ({ ...prev, ...counts }));
    } catch (e) {
      alert("Error al buscar artistas");
      console.error(e);
    }
  };

  const handleSelectArtist = async (artistId) => {
    try {
      const albums = await getAlbumsByArtist(artistId);
      setSelectedArtistAlbums(albums);
      setSelectedAlbumSongsFromArtist([]);
      const counts = {};
      await Promise.all(
        albums.map(async (album) => {
          counts[album.id] = (await getFavoriteCount(album.id)) || 0;
        })
      );
      setFavoriteCounts((prev) => ({ ...prev, ...counts }));
    } catch (e) {
      alert("Error al obtener álbumes del artista");
      console.error(e);
    }
  };

  const handleSelectAlbumFromArtist = async (releaseGroupId) => {
    try {
      const releases = await getReleasesByReleaseGroup(releaseGroupId);
      if (releases.length === 0) {
        setSelectedAlbumSongsFromArtist([]);
        return;
      }
      const songs = await getSongsByRelease(releases[0].id);
      setSelectedAlbumSongsFromArtist(songs);
      const counts = {};
      await Promise.all(
        songs.map(async (song) => {
          counts[song.id] = (await getFavoriteCount(song.id)) || 0;
        })
      );
      setFavoriteCounts((prev) => ({ ...prev, ...counts }));
    } catch (e) {
      alert("Error al obtener canciones del álbum");
      console.error(e);
    }
  };

  const handleSearchAlbums = async () => {
    try {
      const results = await searchAlbums(searchTermAlbum);
      setAlbumResults(results);
      setSelectedAlbumSongs([]);
      const counts = {};
      await Promise.all(
        results.map(async (album) => {
          counts[album.id] = (await getFavoriteCount(album.id)) || 0;
        })
      );
      setFavoriteCounts((prev) => ({ ...prev, ...counts }));
    } catch (e) {
      alert("Error al buscar álbumes");
      console.error(e);
    }
  };

  const handleSelectAlbumFromAlbumSearch = async (releaseGroupId) => {
    try {
      const releases = await getReleasesByReleaseGroup(releaseGroupId);
      if (releases.length === 0) {
        setSelectedAlbumSongs([]);
        return;
      }
      const songs = await getSongsByRelease(releases[0].id);
      setSelectedAlbumSongs(songs);
      const counts = {};
      await Promise.all(
        songs.map(async (song) => {
          counts[song.id] = (await getFavoriteCount(song.id)) || 0;
        })
      );
      setFavoriteCounts((prev) => ({ ...prev, ...counts }));
    } catch (e) {
      alert("Error al obtener canciones del álbum");
      console.error(e);
    }
  };

  const handleSearchSongs = async () => {
    try {
      const results = await searchSongs(searchTermSong);
      setSongResults(results);
      const counts = {};
      await Promise.all(
        results.map(async (song) => {
          counts[song.id] = (await getFavoriteCount(song.id)) || 0;
        })
      );
      setFavoriteCounts((prev) => ({ ...prev, ...counts }));
    } catch (e) {
      alert("Error al buscar canciones");
      console.error(e);
    }
  };

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
  ]);

  const ratingProps = {
    getItemStats,
    getRatingFor,
    rateItem,
    deleteRating,
  };

  //funciones para buscar listas
  useEffect(() => {
  fetchAllLists();
  fetchAllUsers(token);
  fetchFollowedLists(user.userId);
  // eslint-disable-next-line
}, []);

  const handleSearchListByName = (term = searchTerm) => {

  try {
    if (!user || !user.userId) {
      alert(t('errorFetchingUserId'));
      return;
    }

    const filteredLists = lists.filter(list =>
      list.name.toLowerCase().includes(term.toLowerCase()) &&
      list.creator._id !== user.userId
    );
    setSearchResults(filteredLists);
    console.log('Filtered lists (excluding user-owned):', filteredLists);
    console.log('followedLists:', followedLists);
    console.log('searchResults:', searchResults);
  } catch (err) {
    setError(err.message || 'Error fetching lists');
  } finally {
    setLoading(false);
  }
};
  
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
      showToast('Canción añadida correctamente', 'success');
      setOpen(false); // Cierra el modal si quieres
    } catch (err) {
      showToast('Error al añadir la canción', 'error');
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
  
  const handleFavoriteToggle = async (id, type) => {
      try {
        if (isFavorite(id)) {
          await removeFavorite(id);
        } else {
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
            item?.title || item?.name || "",
            item?.artist || item?.artistName || "",
            item?.coverUrl || "",
            item?.releaseDate || "",
            item?.duration || "",
            item?.externalLinks?.spotifyUrl || "",
            item?.externalLinks?.youtubeUrl || ""
          );
        }
  
        const newCount = await getFavoriteCount(id);
        setFavoriteCounts((prev) => ({
          ...prev,
          [id]: newCount,
        }));
      } catch (e) {
        console.error("Error alternando favorito", e);
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
    <Box
      sx={{  minHeight: "100vh", width: "100%" }}
    >
      <Menu />
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          {t('generalSearch')}
        </Typography>
        <TextField
          fullWidth
          label={t('searchAnything')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGeneralSearch()}
          margin="normal"
        />
        <Button variant="contained" onClick={handleGeneralSearch} sx={{backgroundColor: '#d63b1f', color: 'white'}}>
          {t('search')}
        </Button>
      </Box>

      <ResultBox>
        {/* ARTISTAS */}
        <Box sx={{ flex: 1, p: 2,  borderRadius: 1 }}>
          <Typography variant="h5" gutterBottom>
            {t('searchArtist')}
          </Typography>
          <TextField
            fullWidth
            label={t('nameArtist')}
            value={searchTermArtist}
            onChange={(e) => setSearchTermArtist(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchArtist()}
            margin="normal"
          />
          <Button variant="contained" onClick={handleSearchArtist} sx={{backgroundColor: '#d63b1f', color: 'white'}}>
            {t('search')}
          </Button>

          {artistResults.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">{t('artistFound')}</Typography>
              <ItemList
                items={artistResults}
                type="artist"
                onClickItem={handleSelectArtist}
                ratingProps={ratingProps}
                favoriteCounts={favoriteCounts}
                isFavorite={isFavorite}
                onToggleFavorite={handleFavoriteToggleResult}
              />
            </>
          )}

          {selectedArtistAlbums.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">{t('artistAlbums')}</Typography>
              <ItemList
                items={selectedArtistAlbums}
                type="album"
                onClickItem={handleSelectAlbumFromArtist}
                ratingProps={ratingProps}
                favoriteCounts={favoriteCounts}
                isFavorite={isFavorite}
                onToggleFavorite={handleFavoriteToggleResult}
              />
            </>
          )}

          {selectedAlbumSongsFromArtist.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">{t('albumSongs')}</Typography>
              <ItemList
                items={selectedAlbumSongsFromArtist}
                type="song"
                ratingProps={ratingProps}
                favoriteCounts={favoriteCounts}
                isFavorite={isFavorite}
                onToggleFavorite={handleFavoriteToggleResult}
              />
            </>
          )}
        </Box>

        {/* ÁLBUMES */}
        <Box sx={{ flex: 1, p: 2,  borderRadius: 1 }}>
          <Typography variant="h5" gutterBottom>
            {t('searchAlbum')}
          </Typography>
          <TextField
            fullWidth
            label={t('nameAlbum')}
            value={searchTermAlbum}
            onChange={(e) => setSearchTermAlbum(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchAlbums()}
            margin="normal"
          />
          <Button variant="contained" onClick={handleSearchAlbums} sx={{backgroundColor: '#d63b1f', color: 'white'}} >
            Buscar
          </Button>

          {albumResults.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">{t('albumFound')}</Typography>
              <ItemList
                items={albumResults}
                type="album"
                onClickItem={handleSelectAlbumFromAlbumSearch}
                ratingProps={ratingProps}
                favoriteCounts={favoriteCounts}
                isFavorite={isFavorite}
                onToggleFavorite={handleFavoriteToggleResult}
              />
            </>
          )}

          {selectedAlbumSongs.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">{t('albumSongs')}</Typography>
              <ItemList
                items={selectedAlbumSongs}
                type="song"
                ratingProps={ratingProps}
                favoriteCounts={favoriteCounts}
                isFavorite={isFavorite}
                onToggleFavorite={handleFavoriteToggleResult}
              />
            </>
          )}
        </Box>

        {/* CANCIONES */}
        <Box sx={{ flex: 1, p: 2, borderRadius: 1 }}>
          <Typography variant="h5" gutterBottom>
            {t('searchSong')}
          </Typography>
          <TextField
            fullWidth
            label={t('nameSong')}
            value={searchTermSong}
            onChange={(e) => setSearchTermSong(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSongs()}
            margin="normal"
          />
          <Button variant="contained" onClick={handleSearchSongs} sx={{backgroundColor: '#d63b1f', color: 'white'}}>
            Buscar
          </Button>

          {songResults.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">{t('songsFound')}</Typography>
              <ItemList
                items={songResults}
                type="song"
                ratingProps={ratingProps}
                favoriteCounts={favoriteCounts}
                isFavorite={isFavorite}
                onToggleFavorite={handleFavoriteToggleResult}
              />
            </>
          )}
        </Box>
      
      </ResultBox>
      <ResultBox>
        {/* COLUMNA LISTAS */}
        <ResultBoxUL >
        <Typography variant="h5" gutterBottom>
            {t('searchLists')}
        </Typography>
        <TextField
            fullWidth
            label={t('nameList')}
            value={searchTermList}
            onChange={(e) => setSearchTermList(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchListByName(searchTermList)}
            margin="normal"
        />
        <Button variant="contained" onClick={() => handleSearchListByName(searchTermList)} sx={{ mt: 2, width: '20%', backgroundColor: '#d63b1f', color: 'white' }} >
            {t('search')}
        </Button>
        {searchResults.length > 0 && (
            <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
            {t('foundLists')}
            </Typography>)}
        {searchResults.map(l => (
            <ListCard key={l._id} >
            <ListCardContent>
                <Typography
                variant="h5"
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
                    <Button onClick={() => handlefollowList(l._id)} variant= 'contained'>
                    {t('follow')}
                    </Button>
                    </ButtonBox>
                )}
                </Box>
            </ListCardContent>
            </ListCard>
        ))}
        </ResultBoxUL>
        {/* COLUMNA Usuarios */}
        <ResultBoxUL>
        <Typography variant="h5" gutterBottom>
            {t('searchUsers')}
        </Typography>
        <TextField
            fullWidth
            label={t('nameUser')}
            value={searchTermUser}
            onChange={(e) => setSearchTermUser(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchUser(searchTermUser)}
            margin="normal"
        />
        <Button variant="contained" onClick={() => handleSearchUser(searchTermUser)} sx={{ mt: 2, width: '20%', backgroundColor: '#d63b1f', color: 'white' }}>
            {t('search')}
        </Button>
              {searches.length > 0 && (
              <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
                {t('foundUsers')}
              </Typography>
            )}
          
              {searches.map(user => (
                
                  <FollowCard key={user._id} >
                    <Avatar
                      src={user.profilePic ? `http://localhost:5000/uploads/${user.profilePic}` : '/assets/images/profilepic_default.png'}
                      alt={user.name}
                      sx={{ width: 60, height: 60, mr: 2 }}
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
                
              ))} 
              
          </ResultBoxUL>
          </ResultBox>

      </Box>

  );
}

export default SearchPage;
