import { useEffect, useState, useContext } from "react";
import { Box, Typography, Divider, Card, CardContent } from "@mui/material";
import Menu from "./Menu";
import { UserContext } from "../context/UserContext";
import { getTopFavorites } from "../api/internal/favoriteApi";

function TopFavoritosList(limit = 5, title = "Items Más Gustados") {
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
        const data = await getTopFavorites(limit, token);

        // Transformar a objeto con claves:
        const formattedData = data.reduce(
          (acc, curr) => {
            acc[curr._id] = curr.favorites;
            return acc;
          },
          { artist: [], album: [], song: [] }
        );

        setTopFavorites(formattedData);
      } catch (error) {
        console.error("Error cargando favoritos populares", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopFavorites();
  }, [token, limit]);

  if (loading) {
    return (
        <Typography>Cargando favoritos populares...</Typography>
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
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
    </Box>
  );
}

export default TopFavoritosList;
