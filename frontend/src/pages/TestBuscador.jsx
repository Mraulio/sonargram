import { useEffect, useState, useContext } from "react";
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

function TestBuscador() {
  const { token } = useContext(UserContext);
  const {
    rateItem,
    deleteRating,
    getItemStats,
    getRatingFor,
    fetchMultipleItemRatings,
  } = useRatings(token);
  const { addFavorite, removeFavorite, isFavorite, getFavoriteCount } =
    useFavorites(token);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermArtist, setSearchTermArtist] = useState("");
  const [searchTermAlbum, setSearchTermAlbum] = useState("");
  const [searchTermSong, setSearchTermSong] = useState("");

  const [artistResults, setArtistResults] = useState([]);
  const [albumResults, setAlbumResults] = useState([]);
  const [songResults, setSongResults] = useState([]);

  const [selectedArtistAlbums, setSelectedArtistAlbums] = useState([]);
  const [selectedAlbumSongsFromArtist, setSelectedAlbumSongsFromArtist] =
    useState([]);
  const [selectedAlbumSongs, setSelectedAlbumSongs] = useState([]);

  const [favoriteCounts, setFavoriteCounts] = useState({});

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

  return (
    <Box
      sx={{ backgroundColor: "#f0f0f0", minHeight: "100vh", width: "100vw" }}
    >
      <Menu />
      <Box sx={{ p: 2, backgroundColor: "#fff" }}>
        <Typography variant="h4" gutterBottom>
          Búsqueda general
        </Typography>
        <TextField
          fullWidth
          label="Buscar artistas, álbumes o canciones"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGeneralSearch()}
          margin="normal"
        />
        <Button variant="contained" onClick={handleGeneralSearch}>
          Buscar
        </Button>
      </Box>

      <Box sx={{ display: "flex", px: 2, gap: 2 }}>
        {/* ARTISTAS */}
        <Box sx={{ flex: 1, p: 2, backgroundColor: "#fff", borderRadius: 1 }}>
          <Typography variant="h5" gutterBottom>
            Buscar Artista
          </Typography>
          <TextField
            fullWidth
            label="Nombre del artista"
            value={searchTermArtist}
            onChange={(e) => setSearchTermArtist(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchArtist()}
            margin="normal"
          />
          <Button variant="contained" onClick={handleSearchArtist}>
            Buscar
          </Button>

          {artistResults.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Artistas encontrados</Typography>
              <ItemList
                items={artistResults}
                type="artist"
                onClickItem={handleSelectArtist}
                ratingProps={ratingProps}
                favoriteCounts={favoriteCounts}
                isFavorite={isFavorite}
                onToggleFavorite={handleFavoriteToggle}
              />
            </>
          )}

          {selectedArtistAlbums.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Álbumes del artista</Typography>
              <ItemList
                items={selectedArtistAlbums}
                type="album"
                onClickItem={handleSelectAlbumFromArtist}
                ratingProps={ratingProps}
                favoriteCounts={favoriteCounts}
                isFavorite={isFavorite}
                onToggleFavorite={handleFavoriteToggle}
              />
            </>
          )}

          {selectedAlbumSongsFromArtist.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Canciones del álbum</Typography>
              <ItemList
                items={selectedAlbumSongsFromArtist}
                type="song"
                ratingProps={ratingProps}
                favoriteCounts={favoriteCounts}
                isFavorite={isFavorite}
                onToggleFavorite={handleFavoriteToggle}
              />
            </>
          )}
        </Box>

        {/* ÁLBUMES */}
        <Box sx={{ flex: 1, p: 2, backgroundColor: "#fff", borderRadius: 1 }}>
          <Typography variant="h5" gutterBottom>
            Buscar Álbum
          </Typography>
          <TextField
            fullWidth
            label="Nombre del álbum"
            value={searchTermAlbum}
            onChange={(e) => setSearchTermAlbum(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchAlbums()}
            margin="normal"
          />
          <Button variant="contained" onClick={handleSearchAlbums}>
            Buscar
          </Button>

          {albumResults.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Álbumes encontrados</Typography>
              <ItemList
                items={albumResults}
                type="album"
                onClickItem={handleSelectAlbumFromAlbumSearch}
                ratingProps={ratingProps}
                favoriteCounts={favoriteCounts}
                isFavorite={isFavorite}
                onToggleFavorite={handleFavoriteToggle}
              />
            </>
          )}

          {selectedAlbumSongs.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Canciones del álbum</Typography>
              <ItemList
                items={selectedAlbumSongs}
                type="song"
                ratingProps={ratingProps}
                favoriteCounts={favoriteCounts}
                isFavorite={isFavorite}
                onToggleFavorite={handleFavoriteToggle}
              />
            </>
          )}
        </Box>

        {/* CANCIONES */}
        <Box sx={{ flex: 1, p: 2, backgroundColor: "#fff", borderRadius: 1 }}>
          <Typography variant="h5" gutterBottom>
            Buscar Canción
          </Typography>
          <TextField
            fullWidth
            label="Nombre de la canción"
            value={searchTermSong}
            onChange={(e) => setSearchTermSong(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSongs()}
            margin="normal"
          />
          <Button variant="contained" onClick={handleSearchSongs}>
            Buscar
          </Button>

          {songResults.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Canciones encontradas</Typography>
              <ItemList
                items={songResults}
                type="song"
                ratingProps={ratingProps}
                favoriteCounts={favoriteCounts}
                isFavorite={isFavorite}
                onToggleFavorite={handleFavoriteToggle}
              />
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default TestBuscador;
