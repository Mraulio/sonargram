import { useState, useEffect } from 'react';
import * as api from '../api/internal/favoriteApi';

export default function useFavorites(token) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoriteCounts, setFavoriteCounts] = useState({}); // key: favoriteId, value: count

  // Obtener todos los favoritos del usuario al cargar el hook
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await api.getFavoritesByUser(token);
        setFavorites(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchFavorites();
  }, [token]);

  const addFavorite = async (
    id,
    type,
    title,
    artistName,
    coverUrl,
    releaseDate,
    duration,
    spotifyUrl = "",
    youtubeUrl = ""
  ) => {
    try {
      await api.addFavorite(
        id,
        type,
        title,
        artistName,
        coverUrl,
        releaseDate,
        duration,
        spotifyUrl,
        youtubeUrl,
        token
      );
      setFavorites(prev => [...prev, { favoriteId: id, favoriteType: type }]);
    } catch (err) {
      setError(err.message);
    }
  };


  const removeFavorite = async (id) => {
    try {
      await api.removeFavorite(id, token);
      setFavorites(prev => prev.filter(f => f.favoriteId !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const getFavoriteCount = async (id) => {
    try {
      const data = await api.getFavoriteCount(id, token);
      setFavoriteCounts(prev => ({ ...prev, [id]: data.count }));
      return data.count;
    } catch (err) {
      setError(err.message);
    }
  };

  const isFavorite = (id) => favorites.some(f => f.favoriteId === id);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    getFavoriteCount,
    favoriteCounts,
    loading,
    error,
  };
}
