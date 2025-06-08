// src/components/ActivityCard.js
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Box,
  Modal,
  Paper,
  IconButton,
  Divider,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faStar,
  faList,
  faUser,
  faComment,
  faThumbsUp,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const iconMap = {
  favorite: faHeart,
  rate: faStar,
  createList: faList,
  addListSong: faList,
  followList: faList,
  followUser: faUser,
  comment: faComment,
  recommendComment: faThumbsUp,
};

const iconColors = {
  favorite: "red",
  rate: "#FFD700",
  createList: "#1976d2",
  addListSong: "#1976d2",
  followList: "#1976d2",
  followUser: "#6a1b9a",
  comment: "#555",
  recommendComment: "#43a047",
};

const styleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 380,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 3,
  maxHeight: "80vh",
  overflowY: "auto",
};

const getActionDescription = (action, username, activity) => {
  switch (action) {
    case "favorite":
      return "marcó como favorito";
    case "rate":
      return `calificó con nota ${activity.rating}`;
    case "createList":
      return "creó la lista";
    case "addListSong":
      return "agregó la canción";
    case "followList":
      return "siguió la lista";
    case "followUser":
      return "siguió al usuario";
    case "comment":
      return "comentó";
    case "recommendComment":
      return "recomendó un comentario";
    default:
      return "hizo una actividad";
  }
};

const getRelatedContent = (action, activity) => {
  if (!activity) return null;

  const { activityRef, mbidData, targetType } = activity;

  if (action === "addListSong") {
    return {
      song: mbidData?.title && mbidData?.artistName
        ? `${mbidData.title} - ${mbidData.artistName}`
        : null,
      list: activity.list?.name || null,
    };
  }

  if (["song", "album", "artist"].includes(targetType) && mbidData) {
    return {
      single: `Canción: ${mbidData.title || "Desconocida"}${
        mbidData.artistName ? ` - ${mbidData.artistName}` : ""
      }`,
      type: targetType,
    };
  }

  switch (action) {
    case "createList":
    case "followList":
      return { single: activityRef?.name || null, type: "list" };

    case "followUser":
      return { single: activityRef?.username ? `@${activityRef.username}` : null, type: "user" };

    case "comment":
    case "recommendComment":
      return {
        single: activityRef?.text ? `"${activityRef.text.slice(0, 100)}"` : null,
        type: "comment",
      };

    default:
      return null;
  }
};


const ActivityCard = ({ activity }) => {
  const { user, action, createdAt, activityRef, mbidData, targetType } = activity;
  const icon = iconMap[action];
  const iconColor = iconColors[action] || "#666";

  const profilePicUrl =
    user && user.profilePic
      ? `http://localhost:5000/uploads/${user.profilePic}`
      : "/assets/images/profilepic_default.png";

  // Modal state: open + content type + data
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ type: null, data: null });

  // Abrir modal con tipo y datos
  const openModal = (type, data) => {
    setModalData({ type, data });
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  // Render modal content según tipo
  const renderModalContent = () => {
    if (!modalData.type) return null;

    switch (modalData.type) {
      case "user":
        const userData = modalData.data;
        return (
          <>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Avatar
                alt={userData.username}
                src={
                  userData.profilePic
                    ? `http://localhost:5000/uploads/${userData.profilePic}`
                    : "/assets/images/profilepic_default.png"
                }
                sx={{ width: 64, height: 64 }}
              />
              <Typography variant="h6">{userData.username}</Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Typography><strong>Email:</strong> {userData.email || "No disponible"}</Typography>
            <Typography><strong>Registrado:</strong> {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "No disponible"}</Typography>
            {/* Agrega más info de usuario que tengas */}
          </>
        );

      case "song":
        const songData = modalData.data;
        return (
          <>
            <Typography variant="h6" mb={2}>
              Canción: {songData.title || "Desconocida"}
            </Typography>
            <Typography><strong>Artista:</strong> {songData.artistName || "Desconocido"}</Typography>
            <Typography><strong>Álbum:</strong> {songData.albumName || "Desconocido"}</Typography>
            <Typography><strong>Rating:</strong> {songData.ratingDisplay || "No disponible"}</Typography>
            {/* Más detalles canción si quieres */}
          </>
        );

      case "list":
        const listData = modalData.data;
        return (
          <>
            <Typography variant="h6" mb={2}>
              Lista: {listData.name || "Sin nombre"}
            </Typography>
            <Typography><strong>Descripción:</strong> {listData.description || "No disponible"}</Typography>
            <Typography><strong>Cantidad de canciones:</strong> {listData.songsCount || 0}</Typography>
            {/* Más info lista */}
          </>
        );

      case "comment":
        const commentData = modalData.data;
        return (
          <>
            <Typography variant="h6" mb={2}>
              Comentario
            </Typography>
            <Typography sx={{ fontStyle: "italic" }}>
              "{commentData.text || "Sin texto"}"
            </Typography>
            <Typography><strong>Autor:</strong> {commentData.authorName || "Desconocido"}</Typography>
            {/* Más info comentario */}
          </>
        );

      default:
        return <Typography>No hay información disponible.</Typography>;
    }
  };

  const relatedContent = getRelatedContent(action, activity);
  const actionDesc = getActionDescription(action, user?.username, activity);

  return (
    <>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Avatar usuario clickeable */}
            <Box
              sx={{ position: "relative", display: "inline-block", cursor: "pointer" }}
              onClick={() => openModal("user", user)}
              title={`Ver info de ${user?.username || "usuario"}`}
            >
              <Avatar
                alt={user?.username}
                src={profilePicUrl}
                sx={{ width: 56, height: 56 }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  backgroundColor: "#fff",
                  borderRadius: "50%",
                  padding: "4px",
                }}
              >
                <FontAwesomeIcon icon={icon} color={iconColor} size="lg" />
              </Box>
            </Box>

            <Box>
              <Typography variant="body1" component="div">
                {/* Nombre usuario clickeable */}
                <Box
                  component="span"
                  onClick={() => openModal("user", user)}
                  sx={{
                    color: "primary.dark",
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                  }}
                  title={`Ver info de ${user?.username || "usuario"}`}
                >
                  {user?.username || "Alguien"}
                </Box>{" "}
                {actionDesc}{" "}
                {relatedContent && (
  <>
    {action === "addListSong" && relatedContent.song && (
      <>
        <Box
          component="span"
          onClick={() => openModal("song", mbidData)}
          sx={{
            color: "primary.dark",
            fontWeight: "bold",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
          title="Ver información de la canción"
        >
          {relatedContent.song}
        </Box>{" "}
        a la lista{" "}
        <Box
          component="span"
          onClick={() => openModal("list", activity.list)}
          sx={{
            color: "primary.dark",
            fontWeight: "bold",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
          title="Ver información de la lista"
        >
          {relatedContent.list}
        </Box>
      </>
    )}

    {relatedContent.single && (
      <Box
        component="span"
        onClick={() => openModal(relatedContent.type, activityRef || mbidData)}
        sx={{
          color: "primary.dark",
          fontWeight: "bold",
          fontSize: "0.875rem",
          cursor: "pointer",
        }}
        title="Ver información relacionada"
      >
        {relatedContent.single}
      </Box>
    )}
  </>
)}

              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(createdAt).toLocaleString()}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        aria-labelledby="dynamic-modal-title"
        aria-describedby="dynamic-modal-description"
      >
        <Paper sx={styleModal}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography id="dynamic-modal-title" variant="h6" component="h2">
              Información
            </Typography>
            <IconButton onClick={closeModal} size="small" aria-label="Cerrar">
              <FontAwesomeIcon icon={faTimes} />
            </IconButton>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          {renderModalContent()}
        </Paper>
      </Modal>
    </>
  );
};

export default ActivityCard;
