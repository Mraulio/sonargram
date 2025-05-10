import { useState, useEffect } from 'react';
import * as api from '../api/internal/ratingApi';

export default function useRatings(token) {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemStats, setItemStats] = useState({}); // { [mbid]: { average, count } }

  // Cargar valoraciones del usuario autenticado
  useEffect(() => {
    const fetchRatings = async () => {
      if (!token) return;

      try {
        const data = await api.getUserRatings(token);
        setRatings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [token]);

  const rateItem = async (mbid, type, rating) => {
    try {
      const response = await api.rateItem(mbid, type, rating, token);
      const updated = response.rating;

      setRatings(prev => {
        const exists = prev.find(r => r.mbid === mbid && r.type === type);
        if (exists) {
          return prev.map(r => r.mbid === mbid && r.type === type ? updated : r);
        }
        return [...prev, updated];
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteRating = async (mbid) => {
    try {
      await api.deleteRating(mbid, token);
      setRatings(prev => prev.filter(r => r.mbid !== mbid));
    } catch (err) {
      setError(err.message);
    }
  };

  const getRatingFor = (mbid, type) =>
    ratings.find(r => r.mbid === mbid && r.type === type)?.rating ?? null;

  const fetchItemRatings = async (mbid) => {
    try {
      const data = await api.getRatingsByItem(mbid);
      const sum = data.reduce((acc, r) => acc + r.rating, 0);
      const count = data.length;
      const average = count ? sum / count : null;

      setItemStats(prev => ({
        ...prev,
        [mbid]: { average, count },
      }));

      return { average, count };
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const getItemStats = (mbid) => itemStats[mbid] || { average: null, count: 0 };

  return {
    ratings,
    rateItem,
    deleteRating,
    getRatingFor,
    fetchItemRatings,
    getItemStats,
    loading,
    error,
  };
}
