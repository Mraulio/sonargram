// components/TopRatingsList.jsx
import { useEffect, useState, useContext } from "react";
import { Box, Typography, Divider, Card, CardContent } from "@mui/material";
import { UserContext } from "../context/UserContext";
import { getTopRatingsByType } from "../api/internal/ratingApi";

function TopRatingsList({ limit = 5, title = "Items con Mejor Rating" }) {
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
        const data = await getTopRatingsByType(limit, token);
        const formattedData = data.reduce(
          (acc, curr) => {
            acc[curr._id] = curr.ratings || [];
            return acc;
          },
          { artist: [], album: [], song: [] }
        );

        setTopRatings(formattedData);
      } catch (error) {
        console.error("Error cargando ratings más altos", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopRatings();
  }, [token, limit]);

  function getItemName(item, type) {
    switch (type) {
      case "artist":
        return item.title || item.data?.name || "Sin nombre";
      case "album":
        return item.title || item.data?.title || item.data?.name || "Sin nombre";
      case "song":
        return item.title || item.data?.title || "Sin nombre";
      default:
        return item.name || "Sin nombre";
    }
  }

  if (loading) {
    return <Typography>Cargando ratings más altos...</Typography>;
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
                {type === "song" ? "Canciones" : `${type}s`} mejor valoradas
              </Typography>
              <Divider />
              {topRatings[type].length === 0 && (
                <Typography mt={1}>No hay datos disponibles.</Typography>
              )}
              {topRatings[type].map((item) => (
                <Box
                  key={item.mbid || item._id}
                  mt={1}
                  p={1}
                  borderRadius={1}
                  bgcolor="#f5f5f5"
                >
                  <Typography>{getItemName(item, type)}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Rating promedio: {item.average?.toFixed(2) ?? "N/A"}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    display="block"
                  >
                    Cantidad de votos: {item.count ?? 0}
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

export default TopRatingsList;
