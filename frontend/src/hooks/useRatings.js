import { useState, useEffect, useCallback } from 'react';
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

  const fetchMultipleItemRatings = useCallback (async (mbids) => {
    try {
      const data = await api.getRatingsByMbids(mbids, token);
      console.log(data); // Para verificar la estructura
      setItemStats(prev => ({ ...prev, ...data }));
      // Actualizar ratings del usuario autenticado
      const updatedUserRatings = Object.entries(data)
        .filter(([_, stats]) => stats.userRating != null)
        .map(([mbid, stats]) => ({ mbid, rating: stats.userRating }));
  
      setRatings(prev => {
        const map = new Map(prev.map(r => [`${r.mbid}`, r]));
        for (const r of updatedUserRatings) {
          map.set(r.mbid, r);
        }
        return Array.from(map.values());
      });
  
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [token]);
  

  const getItemStats = (mbid) =>
    itemStats[mbid] || { average: null, count: 0, userRating: null };
  
  return {
    ratings,
    rateItem,
    deleteRating,
    getRatingFor,
    fetchMultipleItemRatings,
    getItemStats,
    loading,
    error,
  };
}
