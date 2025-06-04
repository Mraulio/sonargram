import { useContext } from "react";
import { Box, Typography, Divider, Card, CardContent, IconButton } from "@mui/material";
import { UserContext } from "../context/UserContext";
import useFavorites from "../hooks/useFavorites";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";

function TopFavoritesUser({ limit = 5, title = "Tus favoritos" }) {
  const { token } = useContext(UserContext);
  const {
    favorites,
    loading,
    error,
    removeFavorite,
    isFavorite,
  } = useFavorites(token);

  // Agrupa los favoritos por tipo
  const grouped = {
    artist: [],
    album: [],
    song: [],
  };
  favorites.forEach(fav => {
    if (grouped[fav.favoriteType]) grouped[fav.favoriteType].push(fav);
  });
  Object.keys(grouped).forEach(type => {
    grouped[type] = grouped[type].slice(0, limit);
  });

  function getItemName(item, type) {
    if (!item.data) return "Sin nombre";
    switch (type) {
      case "artist":
        return item.data.name || "Sin nombre";
      case "album":
        return item.data.title || item.data.name || "Sin nombre";
      case "song":
        return item.data.title || "Sin nombre";
      default:
        return item.name || "Sin nombre";
    }
  }

  if (loading) {
    return <Typography>Cargando tus favoritos...</Typography>;
  }
  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  // Handler para quitar favorito
  const handleFavoriteToggle = async (id) => {
    if (isFavorite(id)) {
      await removeFavorite(id);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h5" mb={2}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, flexWrap: 'wrap' }}>
        {["artist", "album", "song"].map((type) => (
          <Box key={type} mb={4} sx={{ width: "30%", display: 'flex' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={1} textTransform="capitalize">
                  {type === "song" ? "Tus canciones" : `Tus ${type}s`} favoritas
                </Typography>
                <Divider />
                {grouped[type].length === 0 && (
                  <Typography mt={1}>No hay datos disponibles.</Typography>
                )}
                {grouped[type].map((item) => (
                  <Box
                    key={item.favoriteId}
                    mt={1}
                    p={1}
                    borderRadius={1}
                    bgcolor="#f5f5f5"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography>{getItemName(item, type)}</Typography>
                    <IconButton
                      onClick={() => handleFavoriteToggle(item.favoriteId)}
                      color={isFavorite(item.favoriteId) ? "error" : "default"}
                      size="small"
                    >
                      <FontAwesomeIcon
                        icon={isFavorite(item.favoriteId) ? solidHeart : regularHeart}
                      />
                    </IconButton>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default TopFavoritesUser;