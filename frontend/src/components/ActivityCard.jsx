// src/components/ActivityCard.js
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Box,
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
import InfoModal from "./InfoModal";

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
      single: `Canción: ${mbidData.title || "Desconocida"}${mbidData.artistName ? ` - ${mbidData.artistName}` : ""
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
  const { user, action, createdAt, activityRef, mbidData } = activity;
  const icon = iconMap[action];
  const iconColor = iconColors[action] || "#666";

  const profilePicUrl =
    user && user.profilePic
      ? `http://localhost:5000/uploads/${user.profilePic}`
      : "/assets/images/profilepic_default.png";

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ type: null, data: null });

  const openModal = (type, data) => {
    setModalData({ type, data });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const relatedContent = getRelatedContent(action, activity);
  const actionDesc = getActionDescription(action, user?.username, activity);

  return (
    <>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
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

      <InfoModal
        open={modalOpen}
        onClose={closeModal}
        type={modalData.type}
        data={modalData.data}
      />
    </>
  );
};

export default ActivityCard;
