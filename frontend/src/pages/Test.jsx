import { useEffect, useState, useContext, useRef } from "react";
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
  ButtonBase,
} from "@mui/material";
import Menu from "../components/Menu";
import useUser from "../hooks/useUser";
import useList from "../hooks/useList";
import {
  searchArtists,
  getAlbumsByArtist,
  getSongsByRelease,
  getReleasesByReleaseGroup,
} from "../api/external/apiMB";
import useFavorites from "../hooks/useFavorites";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import TopRatingsList from "../components/TopRatingsList";
import TopFavoritosList from "../components/TopFavoritosList";
import TopFollowedLists from "../components/TopFollowedLists";
import Timeline from "../components/Timeline";

function Test() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token, role, logout } = useContext(UserContext);

  const {
    users,
    fetchAllUsers,
    getUserById,
    getCurrentUser,
    registerNewUser,
    uploadProfilePic,
    deleteProfilePic,
  } = useUser(token);

  const { lists, fetchAllLists, createNewList, removeList } = useList(token);

  const [userName, setUserName] = useState("");
  const [userUsername, setUserUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [listName, setListName] = useState("");
  const [songs, setSongs] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openProfilePicModal, setOpenProfilePicModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [favoriteCounts, setFavoriteCounts] = useState({
    artists: {},
    albums: {},
    songs: {},
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [resizedImage, setResizedImage] = useState(null);
  const fileInputRef = useRef(null);
  const { addFavorite, removeFavorite, isFavorite, getFavoriteCount } =
    useFavorites(token); // o el nombre de tu variable/token

  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    if (token && role === "admin") fetchAllUsers();
  }, [token, role, fetchAllUsers]);
  console.log(users);
  useEffect(() => {
    if (token) fetchAllLists();
  }, [token, fetchAllLists]);

  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        setProfilePic(
          user && user.profilePic
            ? `http://localhost:5000/uploads/${user.profilePic}`
            : "/assets/images/profilepic_default.png"
        );
      } catch (err) {
        console.error("Error fetching current user", err);
      }
    };

    if (token) fetchCurrent();
  }, [token, getCurrentUser]);

  useEffect(() => {
    setProfilePic(
      currentUser && currentUser.profilePic
        ? `http://localhost:5000/uploads/${currentUser.profilePic}`
        : "/assets/images/profilepic_default.png"
    );
  }, [currentUser]);

  const handleUserClick = async (userId) => {
    try {
      const user = await getUserById(userId);
      setSelectedUser(user);
      setOpenModal(true); // Abrimos el modal
    } catch (err) {
      alert("Error al obtener datos del usuario");
      console.error(err);
    }
  };

  const handleCreateUser = async () => {
    try {
      await registerNewUser({
        name: userName,
        username: userUsername,
        email: userEmail,
        password: userPassword,
      });

      setUserName("");
      setUserUsername("");
      setUserEmail("");
      setUserPassword("");
    } catch (err) {
      alert("Error creating user");
      console.error(err);
    }
  };

  const handleCreateList = async () => {
    try {
      const songArray = songs
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "")
        .map((id) => ({ musicbrainzId: id }));

      await createNewList({ name: listName, songs: songArray });

      alert("List created");
      setListName("");
      setSongs("");
    } catch (err) {
      alert("Error creating list");
      console.error(err);
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm(t("confirmDeleteList"))) return;

    try {
      await removeList(listId);
    } catch (err) {
      alert(t("errorDeletingList"));
      console.error(err);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false); // Cerramos el modal
    setSelectedUser(null); // Limpiamos los detalles del usuario
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [artistResults, setArtistResults] = useState([]);
  const [selectedAlbums, setSelectedAlbums] = useState([]);
  const [albumSongs, setAlbumSongs] = useState([]);

  const handleSearchArtist = async () => {
    try {
      const results = await searchArtists(searchTerm);
      setArtistResults(results);

      // Crear un objeto para los conteos de artistas
      const artistCounts = {};
      for (const artist of results) {
        try {
          const count = await getFavoriteCount(artist.id);
          artistCounts[artist.id] = count || 0;
        } catch {
          artistCounts[artist.id] = 0;
        }
      }

      // Actualizamos solo la parte de artistas de favoriteCounts
      setFavoriteCounts((prevCounts) => ({
        ...prevCounts, // Mantener los conteos anteriores
        artists: artistCounts, // Actualizar solo los conteos de los artistas
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
        albums: albumCounts, // Actualizar solo los conteos de los artistas
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
          songs: songCounts, // Actualizar solo los conteos de los artistas
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
        [type + "s"]: {
          ...prev[type + "s"],
          [id]: newCount,
        },
      }));
    } catch (err) {
      console.error("Error toggling favorite", err);
    }
  };

  // ****************** IMAGEN DE PERFIL ********************************* //
  const handleProfilePicClick = () => {
    fileInputRef.current.click(); // abre el file picker
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        resizeImage(reader.result);
        setOpenProfilePicModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const resizeImage = (dataUrl) => {
    const img = new Image();
    img.onload = () => {
      const maxSize = 200;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = maxSize;
      canvas.height = maxSize;

      // Calcular el tamaño redimensionado manteniendo proporción
      const ratio = Math.min(maxSize / img.width, maxSize / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;

      // Centrar la imagen en el canvas
      const offsetX = (maxSize - newWidth) / 2;
      const offsetY = (maxSize - newHeight) / 2;

      // Fondo blanco opcional (puedes cambiar a transparente si prefieres)
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, maxSize, maxSize);

      ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);
      const resizedDataUrl = canvas.toDataURL("image/jpeg");
      setResizedImage(resizedDataUrl);
    };
    img.src = dataUrl;
  };

  const handleSaveImage = async () => {
    try {
      const response = await fetch(resizedImage);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("profilePic", blob, "profile.jpg");

      // Subir la imagen usando el hook
      const resp = await uploadProfilePic(formData); // Esta es la llamada a la API

      // Crear URL temporal para previsualización
      const objectUrl = URL.createObjectURL(blob);
      setProfilePic(objectUrl); // Se mostrará mientras no recargues

      setCurrentUser({ ...currentUser, profilePic: resp.profilePic }); // Le meto una url con un tiempo aleatorio para que vea un cambio y se actualice

      setOpenProfilePicModal(false); // Cerrar el modal
    } catch (err) {
      console.error("Error updating profile picture", err);
      alert("Error al actualizar imagen");
    }
  };

  const handleDeleteProfilePic = async () => {
    try {
      const resp = await deleteProfilePic();
      setCurrentUser({
        ...currentUser,
        profilePic: resp.updatedUser.profilePic,
      });
    } catch (err) {
      alert("Error al eliminar foto de perfil");
      console.error(err);
    }
  };

  // ****************** FIN IMAGEN DE PERFIL ********************************* //

  return (
  <Box sx={{ backgroundColor: "#f0f0f0", minHeight: "100vh", width: "100vw" }}>
    <Menu />
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        p: 4,
        gap: 4,
        fontFamily: "sans-serif",
        mx: "auto",
      }}
    >
      {/* COLUMNA IZQUIERDA */}
      <Box sx={{ flex:2, display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Tarjeta Usuario */}
        <Card
          sx={{
            backgroundColor: token ? "#e8f5e9" : "#ffebee",
            border: "1px solid",
            borderColor: token ? "green" : "red",
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: token ? "green" : "red" }}>
              {token ? t("userLoggedIn", { role }) : t("noUserLoggedIn")}
            </Typography>
            {currentUser && (
              <>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>{t("name")}:</strong> {currentUser.name}
                </Typography>
                <Typography variant="body1">
                  <strong>{t("email")}:</strong> {currentUser.email}
                </Typography>
                <Typography variant="body1">
                  <strong>{t("username")}:</strong> {currentUser.username}
                </Typography>
                <ButtonBase
                  onClick={handleProfilePicClick}
                  sx={{
                    borderRadius: "50%",
                    overflow: "hidden",
                    width: 150,
                    height: 150,
                    display: "inline-block",
                  }}
                >
                  <img
                    src={profilePic}
                    alt="Profile Pic"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </ButtonBase>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                <Button
                  variant="outlined"
                  onClick={handleDeleteProfilePic}
                  sx={{ mt: 2 }}
                >
                  Delete profile pic
                </Button>
              </>
            )}
            {token && (
              <Button variant="outlined" onClick={logout} sx={{ mt: 2 }}>
                {t("logout")}
              </Button>
            )}
          </CardContent>
        </Card>        

        <Button variant="outlined" onClick={() => navigate("/profile")}>
          {t("goToProfile")}
        </Button>

        {/* Crear usuario (admin) */}
        {role === "admin" && (
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {t("createUser")}
              </Typography>
              <TextField fullWidth label={t("name")} value={userName} onChange={(e) => setUserName(e.target.value)} margin="normal" />
              <TextField fullWidth label={t("username")} value={userUsername} onChange={(e) => setUserUsername(e.target.value)} margin="normal" />
              <TextField fullWidth label={t("email")} value={userEmail} onChange={(e) => setUserEmail(e.target.value)} margin="normal" />
              <TextField fullWidth type="password" label={t("password")} value={userPassword} onChange={(e) => setUserPassword(e.target.value)} margin="normal" />
              <Button variant="contained" onClick={handleCreateUser} sx={{ mt: 2 }}>
                {t("createUserButton")}
              </Button>

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">{t("existingUsers")}</Typography>
              <ul>
                {users.map((u) => (
                  <li key={u._id} style={{ cursor: "pointer", textDecoration: "underline", color: "blue" }} onClick={() => handleUserClick(u._id)}>
                    {u.username} - {u.email}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Crear Lista */}
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {t("createList")}
            </Typography>
            <TextField fullWidth label={t("listName")} value={listName} onChange={(e) => setListName(e.target.value)} margin="normal" />
            <TextField fullWidth label={t("songIds")} value={songs} onChange={(e) => setSongs(e.target.value)} margin="normal" />
            <Button variant="contained" onClick={handleCreateList} sx={{ mt: 2 }}>
              {t("createListButton")}
            </Button>

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">{t("existingLists")}</Typography>
            <ul>
              {lists.map((l) => (
                <li key={l._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{l.name}</span>
                  <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteList(l._id)}>
                    {t("delete")}
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Buscar Artista
            </Typography>
            <TextField fullWidth label="Nombre del artista" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} margin="normal" />
            <Button variant="contained" onClick={handleSearchArtist}>
              Buscar
            </Button>

            {artistResults.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mt: 3 }}>Resultados:</Typography>
                <ul>
                  {artistResults.map((artist) => (
                    <li key={artist.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                      <span onClick={() => handleSelectArtist(artist.id)} style={{ color: "blue", textDecoration: "underline" }}>
                        {artist.name}
                      </span>
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

        {/* Álbumes del artista */}
        {selectedAlbums.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6">Álbumes del artista</Typography>
              <ul>
                {selectedAlbums.map((album) => (
                  <li key={album.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                    <span onClick={() => handleSelectAlbum(album.id)} style={{ color: "green", textDecoration: "underline" }}>
                      {album.title}
                    </span>
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

        {/* Canciones del álbum */}
        {albumSongs.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6">Canciones del álbum</Typography>
              <ol>
                {albumSongs.map((song) => (
                  <li key={song.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {song.title}
                    <IconButton onClick={() => handleFavoriteToggle(song.id, "song")}>
                      <FontAwesomeIcon icon={isFavorite(song.id) ? solidHeart : regularHeart} style={{ color: isFavorite(song.id) ? "red" : "gray" }} />
                      <span>({favoriteCounts.songs?.[song.id] || 0})</span>
                    </IconButton>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* COLUMNA 2 */}
      {/* <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <TopRatingsList limit={5} title="Top 5 por Rating" />        
      </Box> */}
      {/* COLUMNA 3 */}
      {/*  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <TopFavoritosList limit={5}/>        
      </Box> */}
      {/* <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <TopFollowedLists limit={5}/>        
      </Box> */}
       {/* COLUMNA 5 */}
      <Box sx={{ flex: 2, display: "flex", flexDirection: "column", gap: 4 }}>
        <Timeline limit={5}/>        
      </Box>
    </Box>

    {token && (
      <Typography sx={{ mt: 4 }} fontSize="small" color="text.secondary" textAlign="center">
        {t("tokenLabel")}: {token}
      </Typography>
    )}

    {/* Modal Imagen Perfil */}
    <Modal open={openProfilePicModal} onClose={() => setOpenProfilePicModal(false)}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: 4,
          borderRadius: 2,
          boxShadow: 24,
          width: 300,
          textAlign: "center",
        }}
      >
        <Typography variant="h6">Actualizar imagen de perfil</Typography>
        {previewImage && (
          <img
            src={resizedImage || previewImage}
            alt="Preview"
            style={{ width: 200, height: 200, borderRadius: "50%", marginTop: 16 }}
          />
        )}
        <Button variant="contained" sx={{ mt: 2 }} onClick={handleSaveImage}>
          Guardar Imagen
        </Button>
      </Box>
    </Modal>

    {/* Modal Detalle Usuario */}
    {selectedUser && (
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: 4,
            borderRadius: 2,
            boxShadow: 24,
            width: 400,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6">{t("userDetails")}</Typography>
          <Typography><strong>{t("name")}:</strong> {selectedUser.name}</Typography>
          <Typography><strong>{t("username")}:</strong> {selectedUser.username}</Typography>
          <Typography><strong>{t("email")}:</strong> {selectedUser.email}</Typography>
          <Typography><strong>{t("bio")}:</strong> {selectedUser.bio}</Typography>
          <Typography><strong>{t("status")}:</strong> {selectedUser.status}</Typography>
          <Typography><strong>{t("role")}:</strong> {selectedUser.role}</Typography>
          <Typography><strong>{t("createdAt")}:</strong> {selectedUser.createdAt}</Typography>
          <img
            src={
              selectedUser.profilePic
                ? `http://localhost:5000/uploads/${selectedUser.profilePic}`
                : "/assets/images/profilepic_default.png"
            }
            alt="Profile Pic"
            style={{ width: "150px", height: "150px", borderRadius: "50%" }}
          />
          <Button variant="contained" onClick={handleCloseModal} sx={{ mt: 2 }}>
            {t("close")}
          </Button>
        </Box>
      </Modal>
    )}
  </Box>
);

}

export default Test;
