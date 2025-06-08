import React, { useState, useEffect, useContext } from "react";
import {
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Button,
} from "@mui/material";
import RatingDisplay from "./RatingDisplay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart, faPlus } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import useList from "../hooks/useList";
import { UserContext } from "../context/UserContext";

function formatDuration(ms) {
  if (!ms) return "";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const ItemList = ({
  items = [],
  type,
  onClickItem,
  highlightColor,
  ratingProps,
  favoriteCounts,
  isFavorite,
  onToggleFavorite,
}) => {
    const { token, user } = useContext(UserContext);
  const { fetchListsByUser, userLists, addSong, loading } = useList(token);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    console.log('user', user);
    if (modalOpen && user?.userId) {
      fetchListsByUser(user.userId);
      console.log('lists', userLists)
    }
  }, [modalOpen, user, fetchListsByUser]);

  const handleAddClick = (song) => {
    setSelectedSong(song);
    setMessage("");
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedSong(null);
    setMessage("");
  };

  const handleAddToList = async (list) => {
    if (!selectedSong) return;
    setAdding(true);
    try {
      await addSong(
        list._id,
        selectedSong.id,
        selectedSong.title,
        selectedSong.artist,
        selectedSong.coverUrl,
        selectedSong.releaseDate,
        selectedSong.duration
      );
      setMessage("Canción añadida correctamente.");
    } catch (err) {
      setMessage("Error al añadir la canción.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <ul style={{ paddingLeft: 0, listStyle: "none", maxHeight: "30vh", overflowY: "auto" }}>
        {items.map((item) => (
          <li
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #ddd",
              padding: "6px 0",
            }}
          >
            {type === "album" && item.coverUrl && (
              <img
                src={item.coverUrl}
                alt="Cover"
                style={{
                  width: 40,
                  height: 40,
                  objectFit: "cover",
                  marginRight: 8,
                  borderRadius: 4,
                }}
              />
            )}

            <span
              onClick={onClickItem ? () => onClickItem(item.id) : undefined}
              style={{
                color: highlightColor || "black",
                textDecoration: onClickItem ? "underline" : "none",
                flexGrow: 1,
                cursor: onClickItem ? "pointer" : "default",
              }}
            >
              {type === "album"
                ? `${item.title}${item.artist ? " — " + item.artist : ""}`
                : type === "song"
                ? `${item.title}${item.album ? " — " + item.album : ""}${
                    item.artist ? " — " + item.artist : ""
                  }`
                : item.name || item.title}
            </span>

            <Typography variant="body2" sx={{ mr: 3, minWidth: 60, textAlign: "right" }}>
              {type === "song"
                ? formatDuration(item.duration)
                : type === "album"
                ? item?.releaseDate?.split("-")[0] || ""
                : ""}
            </Typography>

            <RatingDisplay
              mbid={item.id}
              type={type}
              getItemStats={ratingProps.getItemStats}
              getRatingFor={ratingProps.getRatingFor}
              rateItem={ratingProps.rateItem}
              deleteRating={ratingProps.deleteRating}
              title={item.title || item.name}
              artistName={item.artist || item.artistName || ""}
              coverUrl={item.coverUrl || ""}
              releaseDate={item.releaseDate || ""}
              duration={item.duration || ""}
            />

            {type === "song" && (
              <IconButton
                onClick={() => handleAddClick(item)}
                size="small"
                title="Añadir a lista"
                sx={{ ml: 1 }}
              >
                <FontAwesomeIcon icon={faPlus} />
              </IconButton>
            )}

            <IconButton
              onClick={() => onToggleFavorite(item.id, type)}
              color={isFavorite(item.id) ? "error" : "default"}
              size="small"
            >
              <FontAwesomeIcon icon={isFavorite(item.id) ? solidHeart : regularHeart} />
            </IconButton>
            <Typography variant="body2" sx={{ ml: 1, minWidth: 25 }}>
              {favoriteCounts[`${type}s`][item.id] || 0}
            </Typography>
          </li>
        ))}
      </ul>

      <Dialog open={modalOpen} onClose={handleClose}>
        <DialogTitle>Añadir "{selectedSong?.title}" a una lista</DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <CircularProgress />
          ) : (
            <List>
              {userLists.map((list) => (
                <ListItem key={list._id} disablePadding>
                  <ListItemButton onClick={() => handleAddToList(list)} disabled={adding}>
                    <ListItemText primary={list.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
          {message && (
            <Typography sx={{ mt: 2, color: message.includes("Error") ? "error.main" : "success.main" }}>
              {message}
            </Typography>
          )}
          <Button onClick={handleClose} disabled={adding} sx={{ mt: 2 }}>
            Cerrar
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ItemList;
