import { useEffect, useState, useContext } from "react";
import { Box, Typography, Divider } from "@mui/material";
import Menu from "../components/Menu";
import { UserContext } from "../context/UserContext";
import { getTopRatingsByType } from "../api/internal/ratingApi"; // <-- API para ratings

function TestTopRatings() {
  const { token } = useContext(UserContext);
  const [topRatings, setTopRatings] = useState({
    artist: [],
    album: [],
    song: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopRatings() {
      try {
        const data = await getTopRatingsByType(5, token);

        // Transformar a objeto con claves:
        const formattedData = data.reduce((acc, curr) => {
          acc[curr._id] = curr.ratings || []; // Aquí asumo que el campo es ratings
          return acc;
        }, { artist: [], album: [], song: [] });

        setTopRatings(formattedData);
      } catch (error) {
        console.error("Error cargando ratings más altos", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopRatings();
  }, [token]);

  if (loading) {
    return (
      <Box p={2}>
        <Menu />
        <Typography>Cargando ratings más altos...</Typography>
      </Box>
    );
  }

  // Helper para obtener el nombre o título según el tipo
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

  return (
    <Box p={2}>
      <Menu />
      <Typography variant="h4" mb={2}>
        Items con Mejor Rating
      </Typography>

      {["artist", "album", "song"].map((type) => (
        <Box key={type} mb={4}>
          <Typography variant="h5" mb={1} textTransform="capitalize">
            {type === "song" ? "Canciones" : `${type}s`} con mejor rating
          </Typography>
          <Divider />
          {topRatings[type].length === 0 && (
            <Typography mt={1}>No hay datos disponibles.</Typography>
          )}
          {topRatings[type].map((item) => (
            <Box
              key={item.ratingId || item._id || item.mbid} // usa una clave única, depende de cómo venga el objeto
              mt={1}
              p={1}
              borderRadius={1}
              bgcolor="#f5f5f5"
            >
              <Typography>{getItemName(item, type)}</Typography>
              <Typography variant="caption" color="textSecondary">
                Rating promedio: {item.average?.toFixed(2) ?? item.average ?? "N/A"}
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block">
                Cantidad de votos: {item.count ?? 0}
              </Typography>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

export default TestTopRatings;
