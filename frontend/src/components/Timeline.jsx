// src/components/Timeline.js
import React, { useContext, useEffect } from 'react';
import useActivity from '../hooks/useActivity';
import { UserContext } from "../context/UserContext";

const Timeline = () => {
    const { token } = useContext(UserContext);
    const { activities, loading, error, fetchTimeline } = useActivity(token);

  useEffect(() => {
    if (token) {
      fetchTimeline();
    }
  }, [token, fetchTimeline]);

  const renderActivity = (activity) => {
    const { user, action, targetType, createdAt } = activity;

    let description = `${user.username} hizo una acción`;

    switch (action) {
      case 'createList':
        description = `${user.username} creó una lista`;
        break;
      case 'addListSong':
        description = `${user.username} agregó una canción a una lista`;
        break;
      case 'followUser':
        description = `${user.username} siguió a otro usuario`;
        break;
      case 'followList':
        description = `${user.username} siguió una lista`;
        break;
      default:
        break;
    }

    return (
      <div key={activity._id} className="border-b py-2">
        <p className="text-sm">{description}</p>
        <span className="text-xs text-gray-500">
          {new Date(createdAt).toLocaleString()}
        </span>
      </div>
    );
  };

  if (loading) return <p>Cargando actividades...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-3">
      {activities.length === 0 ? (
        <p>No hay actividades recientes.</p>
      ) : (
        activities.map(renderActivity)
      )}
    </div>
  );
};

export default Timeline;
