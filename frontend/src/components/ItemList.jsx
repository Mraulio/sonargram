import React, { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Typography,
  Button,
} from "@mui/material";
import { UserContext } from "../context/UserContext";
import useList from "../hooks/useList";
import ItemRow from "./ItemRow";

const ItemList = ({
  items = [],
  type,
  onClickItem,
  highlightColor,
  ratingProps,
  favoriteCounts = {},
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
    if (modalOpen && user?.userId) {
      fetchListsByUser(user.userId);
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

      // Mapeo seguro con fallback de nombres alternativos
  const id = selectedSong.id || selectedSong.musicbrainzId;
  const artist = selectedSong.artist || selectedSong.artistName;
    try {
      await addSong(
        list._id,
        id,
        selectedSong.title,
        artist,
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
          <li key={item.id}>
            <ItemRow
              item={item}
              type={type}
              ratingProps={ratingProps}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
              favoriteCounts={favoriteCounts}
              onAddClick={handleAddClick}
              highlightColor={highlightColor}
              onClickItem={onClickItem}
            />
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
