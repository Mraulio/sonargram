// src/components/ActivityCard.js
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Box,
  Link,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faStar,
  faList,
  faUser,
  faComment,
  faThumbsUp,
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

const getActionDescription = (action, user, activity) => {
  const username = user || "Alguien";

  const StyledUsername = (
    <Typography
      component="span"
      color="primary.dark" // Azul oscuro, usa theme
      fontWeight="bold" // Negrita
      fontSize="0.875rem" // Tamaño pequeño (~14px)
    >
      {username}
    </Typography>
  );

  switch (action) {
    case "favorite":
      return <>{StyledUsername} marcó como favorito</>;
    case "rate":
      return <>{StyledUsername} calificó con nota {activity.rating}</>;
    case "createList":
      return <>{StyledUsername} creó la lista</>;
    case "addListSong":
      return <>{StyledUsername} agregó una canción a una lista</>;
    case "followList":
      return <>{StyledUsername} siguió la lista</>;
    case "followUser":
      return <>{StyledUsername} siguió al usuario</>;
    case "comment":
      return <>{StyledUsername} comentó</>;
    case "recommendComment":
      return <>{StyledUsername} recomendó un comentario</>;
    default:
      return <>{StyledUsername} hizo una actividad</>;
  }
};

const getRelatedContent = (action, activity) => {
  if (!activity) return null;

  const { activityRef, mbidData, targetType } = activity;

  // Para actividades sobre música (MBID cacheada)
  if (['song', 'album', 'artist'].includes(targetType) && mbidData) {
    switch (targetType) {
      case 'song':
        return (
          <Typography variant="body2">
            Canción: <strong>{mbidData.title || "Desconocida"}</strong> {mbidData.artistName && <>- {mbidData.artistName}</>}
          </Typography>
        );
      case 'album':
        return (
          <Typography variant="body2">
            Álbum: <strong>{mbidData.title || "Desconocido"}</strong> {mbidData.artistName && <>- {mbidData.artistName}</>}
          </Typography>
        );
      case 'artist':
        return (
          <Typography variant="body2">
            Artista: <strong>{mbidData.title || "Desconocido"}</strong>
          </Typography>
        );
      default:
        return null;
    }
  }

  // Para contenido Mongo referenciado (usuarios, listas, comentarios)
  switch (action) {
    case "createList":
    case "addListSong":
    case "followList":
      return activityRef?.name || null;

    case "followUser":
      return activityRef?.username ? (
        <Typography
          component="span"
          color="primary.dark"
          fontWeight="bold"
          fontSize="0.875rem"
        >
          @{activityRef.username}
        </Typography>
      ) : null;

    case "comment":
    case "recommendComment":
      return (
        <Typography variant="body2">
          Comentario: <em>"{activityRef?.text?.slice(0, 100) || ""}"</em>
        </Typography>
      );

    default:
      return null;
  }
};


const ActivityCard = ({ activity }) => {
  const { user, action, createdAt, activityRef, targetId } = activity;
  const icon = iconMap[action];
  const iconColor = iconColors[action] || "#666";

  const profilePicUrl =
    user && user.profilePic
      ? `http://localhost:5000/uploads/${user.profilePic}`
      : "/assets/images/profilepic_default.png";
  const description = getActionDescription(action, user?.username, activity);
  const relatedContent = getRelatedContent(action, activity);

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ position: "relative", display: "inline-block" }}>
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
            <Typography variant="body1">
              {description}{" "}
              <Typography
                component="span"
                color="primary.dark" // Azul oscuro, usa theme
                fontWeight="bold" // Negrita
                fontSize="0.875rem" // Tamaño pequeño (~14px)
              >
                {relatedContent}
              </Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(createdAt).toLocaleString()}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
