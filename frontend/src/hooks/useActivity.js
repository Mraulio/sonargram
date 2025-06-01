// src/hooks/useActivity.js
import { useState, useCallback } from 'react';
import { getTimeline } from '../api/internal/activityApi';

export default function useActivity(token) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener el timeline del usuario
  const fetchTimeline = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTimeline(token, page, limit);
      console.log('data', data)
      setActivities(data);
    } catch (err) {
      setError(err.message || 'Error fetching timeline');
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    activities,
    loading,
    error,
    fetchTimeline,
  };
}
