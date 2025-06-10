/* src/components/Timeline.js */
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import useActivity from "../hooks/useActivity";
import ActivityCard from "./ActivityCard";
import { Typography, Box } from "@mui/material";
import useRatings from "../hooks/useRatings";
import useFavorites from "../hooks/useFavorites";

const Timeline = () => {
  const { token } = useContext(UserContext);
  const { activities, loading, error, fetchTimeline } = useActivity(token);

  const ratingProps = useRatings(token);
  const favoriteProps = useFavorites(token);
  //console.log('favorite props TIMELINE', favoriteProps);

  const [favoriteCounts, setFavoriteCounts] = useState({
    artists: {},
    albums: {},
    songs: {},
  });

  useEffect(() => {
    if (token) fetchTimeline();
  }, [token, fetchTimeline]);

  const handleFavoriteToggle = async (id, type, item) => {
    console.log('DATOS: ', id, type, item)
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
          item?.duration || ""
        );
      }

      const newCount = await favoriteProps.getFavoriteCount(id);
      setFavoriteCounts((prev) => ({
        ...prev,
        [`${type}s`]: {
          ...(prev[`${type}s`] || {}),
          [id]: newCount,
        },
      }));
    } catch (e) {
      console.error("Error alternando favorito", e);
    }
  };

  if (loading) return <Typography>Cargando actividades...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box>
      {activities.length === 0 ? (
        <Typography>No hay actividades recientes.</Typography>
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            Timeline
          </Typography>
          {activities.map((activity) => (
            <ActivityCard
              key={activity._id}
              activity={activity}
              ratingProps={ratingProps}
              favoriteProps={{
                ...favoriteProps,
                favoriteCounts,
                handleFavoriteToggle,
              }}
            />
          ))}
        </>
      )}
    </Box>
  );
};

export default Timeline;
