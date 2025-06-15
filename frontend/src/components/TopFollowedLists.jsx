import { useEffect, useState, useContext } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { UserContext } from "../context/UserContext";
import useList from "../hooks/useList";

function TopFollowedLists({ limit = 5, title = "Listas más seguidas" }) {
  const { token } = useContext(UserContext);
  const { fetchMostFollowedLists } = useList(token);
  const [topLists, setTopLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTopLists() {
      try {
        const data = await fetchMostFollowedLists(limit);
        setTopLists(data);
      } catch (error) {
        console.error("Error cargando listas más seguidas:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTopLists();
  }, [fetchMostFollowedLists, limit]);

  if (loading) {
    return <Typography>Cargando listas más seguidas...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        {title}
      </Typography>
      <Card>
        <CardContent>
          {topLists.length === 0 && (
            <Typography>No hay listas con seguidores.</Typography>
          )}

          {topLists.map((list) => (
            <Box
              key={list._id}
              mt={1}
              p={1}
              borderRadius={1}
              bgcolor="#f5f5f5"
            >
              <Typography fontWeight="bold">{list.name}</Typography>
              <Typography variant="caption" color="textSecondary">
                Seguidores: {list.followersCount ?? 0}
              </Typography>
              {list.owner?.username && (
                <Typography variant="caption" color="textSecondary" display="block">
                  Creador: {list.owner.username}
                </Typography>
              )}
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
}

export default TopFollowedLists;
