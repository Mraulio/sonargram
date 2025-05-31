import { useEffect, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { Avatar, Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material';
import Menu2 from '../components/Menu2';
import useUser from '../hooks/useUser';
import useFollow from '../hooks/useFollow';
import TopRatingsList from "../components/TopRatingsList";
import TopFavoritosList from "../components/TopFavoritosList";
import RatingDisplay from "../components/RatingDisplay";
import useRatings from "../hooks/useRatings";
import { searchArtists, searchAlbums, searchSongs, getAlbumsByArtist, getSongsByRelease, getReleasesByReleaseGroup } from "../api/external/apiMB";
import useFavorites from "../hooks/useFavorites";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import Search from '../components/Search';
function Test5() {
  const { t } = useTranslation();  // Hook para obtener las traducciones
  const [userUsername, setUserUsername] = useState('');
  const { token, role, logout, user} = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { follower, follow, following, fetchFollowing } = useFollow(token);
  const { users, fetchAllUsers, getCurrentUser } = useUser(token);
  const [searches, setSearches] = useState([]);
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
            deleteRating={deleteRating}
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
        </li>
      ))}
    </ul>
  );

  return (
    <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'end', width: "100vw" }}>
      <Menu2 />
      <Box sx={{ width: '95vw', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      

      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, p: 2  }}>
          <Box sx={{ flex: 1, display: "flex", flexDirection: "row", gap: 4  }}>
            <TopRatingsList limit={5} title="Top 5 por Rating" />        
          </Box>
          
          <Box sx={{ flex: 1, display: "flex", flexDirection: "row", gap: 4 }}>
            <TopFavoritosList limit={5}/>        
          </Box>
      </Box>

        <Search />
    </Box>
  </Box>
  );
}

export default Test5;