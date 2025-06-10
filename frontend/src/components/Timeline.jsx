/* src/components/Timeline.js */
import React, { useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import useActivity from '../hooks/useActivity';
import ActivityCard from './ActivityCard';
import { Typography, Box } from '@mui/material';
import useRatings from '../hooks/useRatings';
import useFavorites from '../hooks/useFavorites';
import { useTranslation } from 'react-i18next';

const Timeline = () => {
  const { token } = useContext(UserContext);
  const { activities, loading, error, fetchTimeline } = useActivity(token);
  const ratingProps = useRatings(token);
  const favoriteProps = useFavorites(token);
  const { t } = useTranslation();  // Hook para obtener las traducciones

  useEffect(() => {
    if (token) fetchTimeline();
  }, [token, fetchTimeline]);

  if (loading) return <Typography>Cargando actividades...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box>
      {activities.length === 0 ? (
        <Typography>No hay actividades recientes.</Typography>
      ) : (
        <>
          <Typography variant="h5" gutterBottom>{t('timeline')}</Typography>
          {activities.map((activity) => (
            <ActivityCard
              key={activity._id}
              activity={activity}
              ratingProps={ratingProps}
              favoriteProps={favoriteProps}
            />
          ))}
        </>
      )}
    </Box>
  );
};

export default Timeline;