// src/components/InfoModal.js
import React from "react";
import {
  Modal,
  Paper,
  Stack,
  Typography,
  Divider,
  Avatar,
  IconButton,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

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

const InfoModal = ({ open, onClose, type, data }) => {
  if (!type) return null;

  const renderContent = () => {
    switch (type) {
      case "user":
        return (
          <>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Avatar
                alt={data.username}
                src={
                  data.profilePic
                    ? `http://localhost:5000/uploads/${data.profilePic}`
                    : "/assets/images/profilepic_default.png"
                }
                sx={{ width: 64, height: 64 }}
              />
              <Typography variant="h6">{data.username}</Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Typography><strong>Email:</strong> {data.email || "No disponible"}</Typography>
            <Typography><strong>Registrado:</strong> {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "No disponible"}</Typography>
          </>
        );

      case "song":
        return (
          <>
            <Typography variant="h6" mb={2}>Canción: {data.title || "Desconocida"}</Typography>
            <Typography><strong>Artista:</strong> {data.artistName || "Desconocido"}</Typography>
            <Typography><strong>Álbum:</strong> {data.albumName || "Desconocido"}</Typography>
            <Typography><strong>Rating:</strong> {data.ratingDisplay || "No disponible"}</Typography>
          </>
        );

      case "list":
        return (
          <>
            <Typography variant="h6" mb={2}>Lista: {data.name || "Sin nombre"}</Typography>
            <Typography><strong>Descripción:</strong> {data.description || "No disponible"}</Typography>
            <Typography><strong>Cantidad de canciones:</strong> {data.songsCount || 0}</Typography>
          </>
        );

      case "comment":
        return (
          <>
            <Typography variant="h6" mb={2}>Comentario</Typography>
            <Typography sx={{ fontStyle: "italic" }}>"{data.text || "Sin texto"}"</Typography>
            <Typography><strong>Autor:</strong> {data.authorName || "Desconocido"}</Typography>
          </>
        );

      default:
        return <Typography>No hay información disponible.</Typography>;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="dynamic-modal-title"
      aria-describedby="dynamic-modal-description"
    >
      <Paper sx={styleModal}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography id="dynamic-modal-title" variant="h6" component="h2">
            Información
          </Typography>
          <IconButton onClick={onClose} size="small" aria-label="Cerrar">
            <FontAwesomeIcon icon={faTimes} />
          </IconButton>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {renderContent()}
      </Paper>
    </Modal>
  );
};

export default InfoModal;
