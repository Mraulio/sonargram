// src/components/Timeline.js
import React, { useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import useActivity from '../hooks/useActivity';
import ActivityCard from './ActivityCard';
import { Typography } from '@mui/material';

const Timeline = () => {
  const { token } = useContext(UserContext);
  const { activities, loading, error, fetchTimeline } = useActivity(token);

  useEffect(() => {
    if (token) fetchTimeline();
  }, [token, fetchTimeline]);

  if (loading) return <p>Cargando actividades...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div>
  {activities.length === 0 ? (
    <Typography>No hay actividades recientes.</Typography>
  ) : (
    <>
      <Typography variant="h5" gutterBottom>Timeline</Typography>
      {activities.map((activity) => (
        <ActivityCard key={activity._id} activity={activity} />
      ))}
    </>
  )}
</div>


  );
};

export default Timeline;
