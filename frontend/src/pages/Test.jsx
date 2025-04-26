import { useEffect, useState, useContext } from "react";
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
  Modal
} from "@mui/material";
import Menu from "../components/Menu";
import useUser from "../hooks/useUser";
import useList from "../hooks/useList";

function Test() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token, role, logout } = useContext(UserContext);

  const { users, fetchAllUsers, getUserById, getCurrentUser, registerNewUser } =
    useUser(token);

  const { lists, fetchAllLists, createNewList, removeList } = useList(token);

  const [userName, setUserName] = useState("");
  const [userUsername, setUserUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [listName, setListName] = useState("");
  const [songs, setSongs] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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
      } catch (err) {
        console.error("Error fetching current user", err);
      }
    };

    if (token) fetchCurrent();
  }, [token, getCurrentUser]);

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

  return (
    <Box
      sx={{ backgroundColor: "#f0f0f0", minHeight: "100vh", width: "100vw" }}
    >
      <Menu />
      <Box sx={{ p: 4, fontFamily: "sans-serif", maxWidth: 600, mx: "auto" }}>
        <Card
          sx={{
            mb: 4,
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
              </>
            )}

            {token && (
              <Button variant="outlined" onClick={logout} sx={{ mt: 2 }}>
                {t("logout")}
              </Button>
            )}
          </CardContent>
        </Card>

        <div>
          <Button variant="outlined" onClick={() => navigate("/profile")}>
            {t("goToProfile")}
          </Button>
        </div>

        {role === "admin" && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {t("createUser")}
              </Typography>
              <TextField
                fullWidth
                label={t("name")}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label={t("username")}
                value={userUsername}
                onChange={(e) => setUserUsername(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label={t("email")}
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                type="password"
                label={t("password")}
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                margin="normal"
              />
              <Button
                variant="contained"
                onClick={handleCreateUser}
                sx={{ mt: 2 }}
              >
                {t("createUserButton")}
              </Button>

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">{t("existingUsers")}</Typography>
              <ul>
                {users.map((u) => (
                  <li
                    key={u._id}
                    style={{
                      cursor: "pointer",
                      textDecoration: "underline",
                      color: "blue",
                    }}
                    onClick={() => handleUserClick(u._id)}
                  >
                    {u.username} - {u.email}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Modal con los detalles del usuario */}
        {selectedUser && (
          <Modal
            open={openModal}
            onClose={handleCloseModal}
            aria-labelledby="user-details-modal"
            aria-describedby="user-details-description"
          >
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
              <Typography variant="h6" id="user-details-modal">
                {t("userDetails")}
              </Typography>
              <Typography variant="body1">
                <strong>{t("name")}:</strong> {selectedUser.name}
              </Typography>
              <Typography variant="body1">
                <strong>{t("username")}:</strong> {selectedUser.username}
              </Typography>
              <Typography variant="body1">
                <strong>{t("email")}:</strong> {selectedUser.email}
              </Typography>
              <Typography variant="body1">
                <strong>{t("bio")}:</strong> {selectedUser.bio}
              </Typography>
              <Typography variant="body1">
                <strong>{t("status")}:</strong> {selectedUser.status}
              </Typography>
              <Typography variant="body1">
                <strong>{t("role")}:</strong> {selectedUser.role}
              </Typography>
              <Typography variant="body1">
                <strong>{t("createdAt")}:</strong> {selectedUser.createdAt}
              </Typography>
              <img
                src={
                  selectedUser.profilePic
                    ? `http://localhost:5000/uploads/${selectedUser.profilePic}`
                    : '/assets/images/profilepic_default.png'  // Accede directamente a la carpeta public
                }
                alt="Profile Pic"
                style={{ width: '150px', height: '150px', borderRadius: '50%' }}
              />
              <Button
                variant="contained"
                onClick={handleCloseModal}
                sx={{ mt: 2 }}
              >
                {t("close")}
              </Button>
            </Box>
          </Modal>
        )}
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {t("createList")}
            </Typography>
            <TextField
              fullWidth
              label={t("listName")}
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label={t("songIds")}
              value={songs}
              onChange={(e) => setSongs(e.target.value)}
              margin="normal"
            />
            <Button
              variant="contained"
              onClick={handleCreateList}
              sx={{ mt: 2 }}
            >
              {t("createListButton")}
            </Button>

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">{t("existingLists")}</Typography>
            <ul>
              {lists.map((l) => (
                <li
                  key={l._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{l.name}</span>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteList(l._id)}
                    sx={{ ml: 2 }}
                  >
                    {t("delete")}
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {token && (
          <Typography sx={{ mt: 4 }} fontSize="small" color="text.secondary">
            {t("tokenLabel")}: {token}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default Test;
