import { useEffect, useState, useContext } from "react";
import { Box, Typography, Divider } from "@mui/material";
import Menu from "../components/Menu";
import { UserContext } from "../context/UserContext";
import { getTopFavorites } from "../api/internal/favoriteApi";

function TestContadorPage() {
  const { token } = useContext(UserContext);
  const [topFavorites, setTopFavorites] = useState({
    artist: [],
    album: [],
    song: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopFavorites() {
      try {
        const data = await getTopFavorites(5, token);

        // Transformar a objeto con claves:
        const formattedData = data.reduce((acc, curr) => {
        acc[curr._id] = curr.favorites;
        return acc;
        }, { artist: [], album: [], song: [] });

        setTopFavorites(formattedData);

      } catch (error) {
        console.error("Error cargando favoritos populares", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopFavorites();
  }, [token]);

  if (loading) {
    return (
      <Box p={2}>
        <Menu />
        <Typography>Cargando favoritos populares...</Typography>
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
        // Para álbumes puede ser title o name, depende del backend, aquí intento title
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
        Favoritos Populares
      </Typography>

      {["artist", "album", "song"].map((type) => (
        <Box key={type} mb={4}>
          <Typography variant="h5" mb={1} textTransform="capitalize">
            {type === "song" ? "Canciones" : `${type}s`} más populares
          </Typography>
          <Divider />
          {topFavorites[type].length === 0 && (
            <Typography mt={1}>No hay datos disponibles.</Typography>
          )}
          {topFavorites[type].map((item) => (
            <Box
              key={item.favoriteId}
              mt={1}
              p={1}
              borderRadius={1}
              bgcolor="#f5f5f5"
            >
              <Typography>{getItemName(item, type)}</Typography>
              <Typography variant="caption" color="textSecondary">
                Cantidad: {item.count}
              </Typography>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

export default TestContadorPage;
