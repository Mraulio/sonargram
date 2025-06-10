import { useContext } from "react";
import { Box, Typography, Divider, Card, CardContent } from "@mui/material";
import { UserContext } from "../context/UserContext";
import useRatings from "../hooks/useRatings";
import RatingDisplay from "./RatingDisplay";

function TopRatingsUser({ limit = 5, title = "Tus ratings más altos" }) {
  const { token } = useContext(UserContext);
  const {
    ratings,
    loading,
    error,
    rateItem,
    deleteRating,
    getItemStats,
    getRatingFor,
  } = useRatings(token);

  // Agrupa los ratings por tipo y ordena por rating descendente
  const grouped = {
    artist: [],
    album: [],
    song: [],
  };
  ratings.forEach(r => {
    if (grouped[r.type]) grouped[r.type].push(r);
  });
  Object.keys(grouped).forEach(type => {
    grouped[type].sort((a, b) => b.rating - a.rating);
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
    return <Typography>Cargando tus ratings...</Typography>;
  }
  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

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
                  {type === "song" ? "Tus canciones" : `Tus ${type}s`} mejor valoradas
                </Typography>
                <Divider />
                {grouped[type].length === 0 && (
                  <Typography mt={1}>No hay datos disponibles.</Typography>
                )}
                {grouped[type].map((item) => (
                  <Box
                    key={item.mbid || item._id}
                    mt={1}
                    p={1}
                    borderRadius={1}
                    bgcolor="#f5f5f5"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography>{getItemName(item, type)}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Tu rating: {item.rating}
                      </Typography>
                    </Box>
                    <RatingDisplay
                      mbid={item.mbid}
                      type={type}
                      getItemStats={getItemStats}
                      getRatingFor={getRatingFor}
                      rateItem={rateItem}
                      deleteRating={deleteRating}
                    />
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

export default TopRatingsUser;