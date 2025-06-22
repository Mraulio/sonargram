/* src/components/ActivityCard.js */
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
import {
  getActionDescription,
  getRelatedContent,
} from "../utils/activityHelpers";
import { useNavigate } from "react-router-dom";
import baseUrl from "../config.js";

import { useTranslation } from 'react-i18next';
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

const ActivityCard = ({ activity, ratingProps, favoriteProps }) => {
  const { t } = useTranslation();  // Hook para obtener las traducciones
  const { user, action, createdAt } = activity;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ type: null, data: null });
  //console.log('favorite props card', favoriteProps);
  const openDetail = (type, data) => {
    setModalData({ type, data });
    setModalOpen(true);
  };
  const closeDetail = () => setModalOpen(false);
  const navigate = useNavigate();
  const icon = iconMap[action];
  const iconColor = iconColors[action] || "#666";
  const related = getRelatedContent(action, activity, t);

  return (
    <>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box
              position="relative"
              onClick={() => navigate(`/userresult/${user._id}`)}
              sx={{ cursor: "pointer", color: "primary.main" }}
            >
              <Avatar
                alt={user?.username}
                src={
                  user?.profilePic
                    ? `${baseUrl}/uploads/${user.profilePic}`
                    : "/assets/images/profilepic_default.png"
                }
                sx={{ width: 48, height: 48 }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: -4,
                  right: -4,
                  p: "2px",
                }}
              >
                <FontAwesomeIcon icon={icon} color={iconColor} />
              </Box>
            </Box>
            <Box flexGrow={1}>
              <Typography variant="body1">
                <Box
                  component="span"
                  onClick={() => navigate(`/userresult/${user._id}`)}
                  sx={{
                    fontWeight: "bold",
                    cursor: "pointer",
                    color: "#d63b1f",
                  }}
                >
                  {user?.username || "Alguien"}
                </Box>{" "}
                {getActionDescription(action, activity, t)}{" "}
                {related && related.type === "compound" ? (
                  <>
                    <Box
                      component="span"
                      onClick={() =>
                        openDetail(related.items[0].type, related.items[0].data)
                      }
                      sx={{
                        fontWeight: "bold",
                        cursor: "pointer",
                        color: "#d63b1f",
                      }}
                    >
                      {related.items[0].single}
                    </Box>{" "}
                    {t('toList')}{" "}
                    <Box
                      component="span"
                      onClick={() =>
                        openDetail(related.items[1].type, related.items[1].data)
                      }
                      sx={{
                        fontWeight: "bold",
                        cursor: "pointer",
                        color: "#d63b1f",
                      }}
                    >
                      {related.items[1].single}
                    </Box>
                  </>
                ) : related && related.single ? (
                  <Box
                    component="span"
                    onClick={() =>
                      action === "followUser"
                        ? navigate(`/userresult/${user._id}`)
                        : openDetail(related.type, {
                          ...related.data,
                          id:
                            activity.targetId ||
                            related.data?.mbid ||
                            related.data?._id,
                        })
                    }
                    sx={{
                      fontWeight: "bold",
                      cursor: "pointer",
                      color: '#d63b1f',
                    }}
                  >
                    {related.single}
                  </Box>
                ) : null}
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
        onClose={closeDetail}
        type={modalData.type}
        data={modalData.data}
        ratingProps={ratingProps}
        favoriteProps={favoriteProps}
      />
    </>
  );
};

export default ActivityCard;
