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

function ArtistPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token, role, logout } = useContext(UserContext);
   const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { users, fetchAllUsers, getUserById, getCurrentUser, registerNewUser, uploadProfilePic } =
    useUser(token);

  const { lists, fetchAllLists, createNewList, removeList } = useList(token);

 
  const [currentUser, setCurrentUser] = useState(null);
 
  const [favoriteCounts, setFavoriteCounts] = useState({
    artists: {},
    albums: {},
    songs: {}
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [resizedImage, setResizedImage] = useState(null);
  const fileInputRef = useRef(null);
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
      const artistFavorites = data.filter(item => item.favoriteType === "artist");
      console.log('artistFavorites', artistFavorites)
      setFavorites(artistFavorites);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (token) fetchFavorites();
}, [token]);

  return (
    <Box sx={{ backgroundColor: "#f0f0f0", minHeight: "100vh", width: "100vw" }}>
      <Menu />
      <Box sx={{ p: 4, fontFamily: "sans-serif", maxWidth: 600, mx: "auto" }}>

        {/* MusicBrainz búsqueda canciones */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Buscar Artista
            </Typography>
            <TextField
              fullWidth
              label="Nombre del artista"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              margin="normal"
            />
            <Button variant="contained" onClick={handleSearchArtist}>
              Buscar
            </Button>

            {artistResults.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mt: 3 }}>Resultados:</Typography>
                <ul>
                  {artistResults.map((artist) => (
                    <li
                      key={artist.id}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                    >
                      <span
                        onClick={() => handleSelectArtist(artist.id)}
                        style={{ color: "blue", textDecoration: "underline" }}
                      >
                        {artist.name}
                      </span>                      
                      <IconButton onClick={() => handleFavoriteToggle(artist.id, "artist")}>
                        <FontAwesomeIcon
                          icon={isFavorite(artist.id) ? solidHeart : regularHeart}
                          style={{ color: isFavorite(artist.id) ? "red" : "gray" }}
                        />
                      <span>
                        ({favoriteCounts.artists?.[artist.id] || 0})
                      </span>
                      </IconButton>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>

        {selectedAlbums.length > 0 && (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6">Álbumes del artista</Typography>
              <ul>
                {selectedAlbums.map((album) => (
                  <li
                    key={album.id}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                  >
                    <span
                      onClick={() => handleSelectAlbum(album.id)}
                      style={{ color: "green", textDecoration: "underline" }}
                    >
                      {album.title}
                    </span>
                    <IconButton onClick={() => handleFavoriteToggle(album.id, "album")}>

                      <FontAwesomeIcon
                        icon={isFavorite(album.id) ? solidHeart : regularHeart}
                        style={{ color: isFavorite(album.id) ? "red" : "gray" }}
                      />
                      <span>
                        ({favoriteCounts.albums?.[album.id] || 0})
                      </span>
                    </IconButton>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {albumSongs.length > 0 && (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6">Canciones del álbum {}</Typography>
              <ol>
                {albumSongs.map((song) => (
                  <li
                    key={song.id}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  >
                    {song.title}
                    <IconButton onClick={() => handleFavoriteToggle(song.id, "song")}>

                      <FontAwesomeIcon
                        icon={isFavorite(song.id) ? solidHeart : regularHeart}
                        style={{ color: isFavorite(song.id) ? "red" : "gray" }}
                      />
                      <span>
                        ({favoriteCounts.songs?.[song.id] || 0})
                      </span>
                    </IconButton>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}
      </Box>  
      
        </Box>

    
  );
}

export default ArtistPage;
