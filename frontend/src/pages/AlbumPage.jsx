import { useEffect, useState, useContext, useRef, use } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserContext } from "../context/UserContext";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Divider,
  Modal,
  IconButton,
  ButtonBase
} from "@mui/material";
import Menu from "../components/Menu";
import useUser from "../hooks/useUser";
import useList from "../hooks/useList";
import { searchArtists, getAlbumsByArtist, getSongsByRelease, getReleasesByReleaseGroup } from "../api/external/apiMB";
import useFavorites from '../hooks/useFavorites';
import { getFavoritesByUser } from "../api/internal/favoriteApi";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';

function AlbumPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token, role, logout } = useContext(UserContext);
   const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getCurrentUser} = useUser(token);

  const [currentUser, setCurrentUser] = useState(null);
 
  const [favoriteCounts, setFavoriteCounts] = useState({
    artists: {},
    albums: {},
    songs: {}
  });

  const { 
    addFavorite, 
    removeFavorite, 
    isFavorite,
    getFavoriteCount
  } = useFavorites(token); // o el nombre de tu variable/token
  const [searchTerm, setSearchTerm] = useState("");
  const [artistResults, setArtistResults] = useState([]);
  const [selectedAlbums, setSelectedAlbums] = useState([]);
  const [albumSongs, setAlbumSongs] = useState([]);

  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error("Error fetching current user", err);
      }
    };

    if (token) fetchCurrent();
  }, [token, getCurrentUser]);


const handleSearchArtist = async () => {
  try {
    const results = await searchArtists(searchTerm);
    setArtistResults(results);

    // Crear un objeto para los conteos de artistas
    const artistCounts = {};
    for (const artist of results) {
      try {
        const count = await getFavoriteCount(artist.id);
        console.log('count artista', count)
        artistCounts[artist.id] = count || 0;
      } catch {
        artistCounts[artist.id] = 0;
      }
    }

    // Actualizamos solo la parte de artistas de favoriteCounts
    setFavoriteCounts((prevCounts) => ({
      ...prevCounts, // Mantener los conteos anteriores
      artists: artistCounts // Actualizar solo los conteos de los artistas
    }));

    setSelectedAlbums([]);
    setAlbumSongs([]);
  } catch (err) {
    alert("Error al buscar artistas");
    console.error(err);
  }
};

const handleSelectArtist = async (artistId) => {
  try {
    const albums = await getAlbumsByArtist(artistId);

     // Crear un objeto para los conteos de artistas
     const albumCounts = {};
     for (const album of albums) {
       try {
         const count = await getFavoriteCount(album.id);
         albumCounts[album.id] = count || 0;
       } catch {
        albumCounts[album.id] = 0;
       }
     }
 
     // Actualizamos solo la parte de artistas de favoriteCounts
     setFavoriteCounts((prevCounts) => ({
       ...prevCounts, // Mantener los conteos anteriores
       albums: albumCounts // Actualizar solo los conteos de los artistas
     }));
    setSelectedAlbums(albums);
    setAlbumSongs([]);
  } catch (err) {
    alert("Error al obtener álbumes");
    console.error(err);
  }
};

const handleSelectAlbum = async (releaseGroupId) => {
  try {
    const releases = await getReleasesByReleaseGroup(releaseGroupId);
    if (releases.length > 0) {
      const releaseId = releases[0].id;
      const songs = await getSongsByRelease(releaseId);

       // Crear un objeto para los conteos de artistas
     const songCounts = {};
     for (const song of songs) {
       try {
         const count = await getFavoriteCount(song.id);
         songCounts[song.id] = count || 0;
       } catch {
        songCounts[song.id] = 0;
       }
     }
 
     // Actualizamos solo la parte de artistas de favoriteCounts
     setFavoriteCounts((prevCounts) => ({
       ...prevCounts, // Mantener los conteos anteriores
       songs: songCounts // Actualizar solo los conteos de los artistas
     }));

      setAlbumSongs(songs);
    }
  } catch (err) {
    alert("Error al obtener canciones del álbum");
    console.error(err);
  }
};

const handleFavoriteToggle = async (id, type) => {
  try {
    if (isFavorite(id)) {
      await removeFavorite(id);
    } else {
      await addFavorite(id, type);
    }

    const newCount = await getFavoriteCount(id);

    setFavoriteCounts(prev => ({
      ...prev,
      [type + "s"]: {
        ...prev[type + "s"],
        [id]: newCount
      }
    }));
  } catch (err) {
    console.error("Error toggling favorite", err);
  }
};

useEffect(() => {
  const fetchFavorites = async () => {
    try {
      const data = await getFavoritesByUser(token);
      console.log('data', data)
      const albumFavorites = data.filter(item => item.favoriteType === "album");
      console.log('albumFavorites', albumFavorites)
      setFavorites(albumFavorites);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (token) fetchFavorites();
}, [token]);

  return (  
    
    <Box sx={{ padding: 2 }}>
        <Menu/>
        <Typography variant="h4" gutterBottom>Hola! aquí aparecerán los álbumes favoritos del usuario.</Typography>
    </Box>
    
  );
}

export default AlbumPage;
