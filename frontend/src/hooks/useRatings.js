import { useState, useEffect, useCallback } from 'react';
import * as api from '../api/internal/ratingApi';

export default function useRatings(token) {
  const [ratings, setRatings] = useState([]);
  const [topRatingsByType, setTopRatingsByType] = useState({ artist: [], album: [], song: [] });
  const [loading, setLoading] = useState(true);
  const [loadingTop, setLoadingTop] = useState(true);
  const [error, setError] = useState(null);
  const [itemStats, setItemStats] = useState({}); // { [mbid]: { average, count, userRating, type } }

  const refreshItemStats = async (mbid) => {
    try {
      const data = await api.getRatingsByMbids([mbid], token);
      setItemStats(prev => ({ ...prev, ...data }));
    } catch (err) {
      console.error("Error refreshing item stats", err);
    }
  };

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

  // NUEVO: función para obtener top ratings por tipo
  const fetchTopRatingsByType = async (limit = 5) => {
    if (!token) return;
    setLoadingTop(true);
    try {
      const data = await api.getTopRatingsByType(limit, token);

      // Transformar respuesta para usarla fácilmente en UI
      const formatted = data.reduce((acc, curr) => {
        acc[curr._id] = curr.favorites;
        return acc;
      }, { artist: [], album: [], song: [] });

      setTopRatingsByType(formatted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTop(false);
    }
  };

  // Si quieres que se cargue automáticamente al montar:
  useEffect(() => {
    fetchTopRatingsByType(5);
  }, [token]);

  const rateItem = async (
    mbid,
    type,
    rating,
    title,
    artistName,
    coverUrl,
    releaseDate,
    duration,
    spotifyUrl = "",
    youtubeUrl = ""
  ) => {
    try {
      const response = await api.rateItem(
        mbid,
        type,
        rating,
        title,
        artistName,
        coverUrl,
        releaseDate,
        duration,
        spotifyUrl,
        youtubeUrl,
        token
      );
      const updated = response.rating;

      setRatings(prev => {
        const exists = prev.find(r => r.mbid === mbid && r.type === type);
        if (exists) {
          return prev.map(r =>
            r.mbid === mbid && r.type === type ? updated : r
          );
        }
        return [...prev, updated];
      });

      refreshItemStats(mbid);
    } catch (err) {
      setError(err.message);
    }
  };


  const deleteRating = async (mbid) => {
    try {
      await api.deleteRating(mbid, token);
      setRatings(prev => prev.filter(r => r.mbid !== mbid));
      refreshItemStats(mbid);
    } catch (err) {
      setError(err.message);
    }
  };

  const getRatingFor = (mbid, type) =>
    ratings.find(r => r.mbid === mbid && r.type === type)?.rating ?? null;

  const fetchMultipleItemRatings = useCallback(async (mbids) => {
    try {
      const data = await api.getRatingsByMbids(mbids, token);

      setItemStats(prev => ({ ...prev, ...data }));

      const updatedUserRatings = Object.entries(data)
        .filter(([_, stats]) => stats.userRating != null)
        .map(([mbid, stats]) => ({
          mbid,
          rating: stats.userRating,
          type: stats.type || 'unknown'
        }));

      setRatings(prev => {
        const key = r => `${r.mbid}-${r.type}`;
        const map = new Map(prev.map(r => [key(r), r]));
        for (const r of updatedUserRatings) {
          map.set(key(r), r);
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
    topRatingsByType,    // <-- aquí expongo el nuevo estado
    loading,
    loadingTop,           // <-- indicador separado para top ratings
    error,
    rateItem,
    deleteRating,
    getRatingFor,
    fetchMultipleItemRatings,
    fetchTopRatingsByType, // <-- expongo función para recargar top ratings
    getItemStats,
  };
}
