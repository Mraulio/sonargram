import { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import RatingDisplay from "../components/RatingDisplay";
import useRatings from "../hooks/useRatings";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import Menu from "../components/Menu";
import { searchArtists, getAlbumsByArtist, getSongsByRelease, getReleasesByReleaseGroup } from "../api/external/apiMB";
import useFavorites from "../hooks/useFavorites";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";

function TestBuscador() {
  const { token } = useContext(UserContext);
  const {
    rateItem,
    deleteRating,
    getItemStats,
    getRatingFor,
    fetchMultipleItemRatings,
  } = useRatings(token);
  const {
    addFavorite,
    removeFavorite,
    isFavorite,
    getFavoriteCount,
  } = useFavorites(token);

  const [searchTerm, setSearchTerm] = useState("");
  const [artistResults, setArtistResults] = useState([]);
  const [selectedAlbums, setSelectedAlbums] = useState([]);
  const [albumSongs, setAlbumSongs] = useState([]);
  const [visibleMbids, setVisibleMbids] = useState([]);
  const [favoriteCounts, setFavoriteCounts] = useState({
    artists: {},
    albums: {},
    songs: {},
  });

  const handleSearchArtist = async () => {
    try {
      const results = await searchArtists(searchTerm);
      setArtistResults(results);

      const artistCounts = {};
      for (const artist of results) {
        try {
          const count = await getFavoriteCount(artist.id);
          artistCounts[artist.id] = count || 0;
        } catch {
          artistCounts[artist.id] = 0;
        }
      }

      setFavoriteCounts((prev) => ({
        ...prev,
        artists: artistCounts,
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

      const albumCounts = {};
      for (const album of albums) {
        try {
          const count = await getFavoriteCount(album.id);
          albumCounts[album.id] = count || 0;
        } catch {
          albumCounts[album.id] = 0;
        }
      }

      setFavoriteCounts((prev) => ({
        ...prev,
        albums: albumCounts,
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
        const songs = await getSongsByRelease(releases[0].id);

        const songCounts = {};
        for (const song of songs) {
          try {
            const count = await getFavoriteCount(song.id);
            songCounts[song.id] = count || 0;
          } catch {
            songCounts[song.id] = 0;
          }
        }

        setFavoriteCounts((prev) => ({
          ...prev,
          songs: songCounts,
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

      setFavoriteCounts((prev) => ({
        ...prev,
        [`${type}s`]: {
          ...prev[`${type}s`],
          [id]: newCount,
        },
      }));
    } catch (err) {
      console.error("Error al alternar favorito", err);
    }
  };

  useEffect(() => {
    const allMbids = [
      ...artistResults.map((a) => a.id),
      ...selectedAlbums.map((a) => a.id),
      ...albumSongs.map((s) => s.id),
    ];

    setVisibleMbids(allMbids);

    if (token && allMbids.length > 0) {
      fetchMultipleItemRatings(allMbids).catch((err) =>
        console.error("Error al obtener ratings", err)
      );
    }
  }, [artistResults, selectedAlbums, albumSongs, token, fetchMultipleItemRatings]);

  return (
    <Box sx={{ backgroundColor: "#f0f0f0", minHeight: "100vh", width: "100vw" }}>
      <Menu />
      <Box sx={{ p: 4, fontFamily: "sans-serif", maxWidth: 600, mx: "auto" }}>
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
                <Typography variant="h6" sx={{ mt: 3 }}>
                  Resultados:
                </Typography>
                <ul>
                  {artistResults.map((artist) => (
                    <li key={artist.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                      <span
                        onClick={() => handleSelectArtist(artist.id)}
                        style={{ color: "blue", textDecoration: "underline" }}
                      >
                        {artist.name}
                      </span>
                      <RatingDisplay
                        mbid={artist.id}
                        type="artist"
                        getItemStats={getItemStats}
                        getRatingFor={getRatingFor}
                        rateItem={rateItem}
                        deleteRating={deleteRating}
                      />
                      <IconButton onClick={() => handleFavoriteToggle(artist.id, "artist")}>
                        <FontAwesomeIcon icon={isFavorite(artist.id) ? solidHeart : regularHeart} style={{ color: isFavorite(artist.id) ? "red" : "gray" }} />
                        <span>({favoriteCounts.artists?.[artist.id] || 0})</span>
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
                  <li key={album.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                    <span onClick={() => handleSelectAlbum(album.id)} style={{ color: "green", textDecoration: "underline" }}>
                      {album.title}
                    </span>
                    <RatingDisplay
                      mbid={album.id}
                      type="album"
                      getItemStats={getItemStats}
                      getRatingFor={getRatingFor}
                      rateItem={rateItem}
                      deleteRating={deleteRating}
                    />
                    <IconButton onClick={() => handleFavoriteToggle(album.id, "album")}>
                      <FontAwesomeIcon icon={isFavorite(album.id) ? solidHeart : regularHeart} style={{ color: isFavorite(album.id) ? "red" : "gray" }} />
                      <span>({favoriteCounts.albums?.[album.id] || 0})</span>
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
              <Typography variant="h6">
                Canciones del álbum {selectedAlbums.find(a => a.id === albumSongs[0]?.releaseId)?.title || ""}
              </Typography>
              <ol>
                {albumSongs.map((song) => {
                  const stats = getItemStats(song.id) || {};
                  return (
                    <li key={song.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      {song.title}
                      <RatingDisplay
                        mbid={song.id}
                        type="song"
                        getItemStats={getItemStats}
                        getRatingFor={getRatingFor}
                        rateItem={rateItem}
                        deleteRating={deleteRating}
                      />
                      <IconButton onClick={() => handleFavoriteToggle(song.id, "song")}>
                        <FontAwesomeIcon icon={isFavorite(song.id) ? solidHeart : regularHeart} style={{ color: isFavorite(song.id) ? "red" : "gray" }} />
                        <span>({favoriteCounts.songs?.[song.id] || 0})</span>
                      </IconButton>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}

export default TestBuscador;
