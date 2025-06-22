import { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../context/UserContext.js";
import {
  Box,
  useTheme,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";

import Menu from "../components/Menu.jsx";
import TopRatingsList from "../components/TopRatingsList.jsx";
import TopFavoritosList from "../components/TopFavoritosList.jsx";
// import TopFollowedLists from "../components/TopFollowedLists.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";

import useFavorites from "../hooks/useFavorites.js";
import useRatings from "../hooks/useRatings.js";
import useList from "../hooks/useList.js";

const TopBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '10px',
  justifyContent: 'space-between',
  width: '100%',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.secondary,
  '@media (max-width: 920px)': {
    flexDirection: 'column',
    gap: '20px',
  },
}));

const ChildBox = styled(Box)`
  flex: 1;        /* Hace que cada hijo tome igual ancho */
  min-width: 0;   /* Para evitar overflow en flex */
`;

function TopsPage() {
  const { t } = useTranslation();
  const { token, user } = useContext(UserContext);
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [favoriteCounts, setFavoriteCounts] = useState({});

  const favoriteProps = useFavorites(token);
  const ratingProps = useRatings(token);

  const {
    fetchListsByUser,
    addSong,
    userLists,
    loading: listLoading,
  } = useList(token);

  const [topFavoritesData, setTopFavoritesData] = useState({
    artist: [],
    album: [],
    song: [],
  });

  const [topRatingsData, setTopRatingsData] = useState({
    artist: [],
    album: [],
    song: [],
  });

  const handleFavoritesDataUpdate = (data) => {
    setTopFavoritesData(data);
  };

  const handleRatingsDataUpdate = (data) => {
    setTopRatingsData(data);
  };

  useEffect(() => {
    async function fetchCounts() {
      if (!token) return;

      const allItems = [
        ...topFavoritesData.artist,
        ...topFavoritesData.album,
        ...topFavoritesData.song,
        ...topRatingsData.artist,
        ...topRatingsData.album,
        ...topRatingsData.song,
      ];

      const idsSet = new Set(
        allItems
          .map(
            (item) =>
              item.mbid || item._id || (item.data && (item.data.mbid || item.data._id))
          )
          .filter(Boolean)
      );

      if (idsSet.size === 0) return;

      const countsMap = {};
      await Promise.all(
        Array.from(idsSet).map(async (id) => {
          try {
            const count = await favoriteProps.getFavoriteCount(id);
            countsMap[id] = count || 0;
          } catch {
            countsMap[id] = 0;
          }
        })
      );

      setFavoriteCounts(countsMap);
    }

    fetchCounts();
  }, [topFavoritesData, topRatingsData, token]);

  useEffect(() => {
    const allItems = [
      ...topFavoritesData.artist,
      ...topFavoritesData.album,
      ...topFavoritesData.song,
      ...topRatingsData.artist,
      ...topRatingsData.album,
      ...topRatingsData.song,
    ];

    const ids = Array.from(
      new Set(
        allItems
          .map(
            (item) =>
              item.mbid || item._id || (item.data && (item.data.mbid || item.data._id))
          )
          .filter(Boolean)
      )
    );

    if (ids.length > 0) {
      ratingProps.fetchMultipleItemRatings(ids);
    }
  }, [topFavoritesData, topRatingsData, ratingProps.fetchMultipleItemRatings]);

  const handleFavoriteToggle = async (id, type, item) => {
    try {
      if (favoriteProps.isFavorite(id)) {
        await favoriteProps.removeFavorite(id);
      } else {
        await favoriteProps.addFavorite(
          id,
          type,
          item?.title || item?.name || "",
          item?.artist || item?.artistName || "",
          item?.coverUrl || "",
          item?.releaseDate || "",
          item?.duration || "",
          item?.spotifyUrl || "",
          item?.youtubeUrl || ""
        );
      }

      const newCount = await favoriteProps.getFavoriteCount(id);
      setFavoriteCounts((prev) => ({
        ...prev,
        [id]: newCount,
      }));
    } catch (e) {
      console.error("Error alternando favorito", e);
    }
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddClick = async (item) => {
    if (!user?.userId) return;
    setSelectedItem(item);
    setMessage("");
    setDialogOpen(true);
    await fetchListsByUser(user.userId);
  };

  const handleAddToList = async (list) => {
    if (!selectedItem) return;
    setAdding(true);
    try {
      await addSong(
        list._id,
        selectedItem.id,
        selectedItem.title,
        selectedItem.artist,
        selectedItem.coverUrl,
        selectedItem.releaseDate,
        selectedItem.duration
      );
      setMessage("Canción añadida correctamente.");
    } catch (err) {
      setMessage("Error al añadir la canción.");
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minHeight: "100vh",
        width: "100%",
  
      }}
    >
      <Menu />

      <TopBox>
        <ChildBox>
          <TopRatingsList
            limit={5}
            title={t("topRated")}
            setLoading={setLoading}
            ratingProps={ratingProps}
            favoriteProps={{
              ...favoriteProps,
              favoriteCounts,
              setFavoriteCounts,
              handleFavoriteToggle,
            }}
            onAddClick={handleAddClick}
            onRatingsDataUpdate={handleRatingsDataUpdate}
          />
        </ChildBox>
        <ChildBox>
          <TopFavoritosList
            limit={5}
            title={t("topLiked")}
            setLoading={setLoading}
            ratingProps={ratingProps}
            favoriteProps={{
              ...favoriteProps,
              favoriteCounts,
              setFavoriteCounts,
              handleFavoriteToggle,
            }}
            onAddClick={handleAddClick}
            onFavoritesDataUpdate={handleFavoritesDataUpdate}
          />
        </ChildBox>
      </TopBox>

      {/* <TopFollowedLists /> */}
      <LoadingScreen open={loading} />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Añadir "{selectedItem?.title}" a una lista</DialogTitle>
        <DialogContent dividers>
          {listLoading ? (
            <CircularProgress />
          ) : (
            <List>
              {userLists
                .filter(list => 
                  !list.isFavoriteList &&
                  !list.isRatingList).map((list) => (
                <ListItem key={list._id} disablePadding>
                  <ListItemButton onClick={() => handleAddToList(list)} disabled={adding}>
                    <ListItemText primary={list.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
          {message && (
            <Typography
              sx={{
                mt: 2,
                color: message.includes("Error") ? "error.main" : "success.main",
              }}
            >
              {message}
            </Typography>
          )}
          <Button onClick={() => setDialogOpen(false)} disabled={adding} sx={{ mt: 2 }}>
            {t("close")}
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default TopsPage;
