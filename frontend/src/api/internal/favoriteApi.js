import createApiClient from "./apiClient";

// Agregar a favoritos
export const addFavorite = async (
  favoriteId,
  favoriteType,
  title,
  artistName,
  coverUrl,
  releaseDate,
  duration,
  spotifyUrl = "",
  youtubeUrl = "",
  token
) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.post('/favorites', {
    favoriteId,
    favoriteType,
    title,
    artistName,
    coverUrl,
    releaseDate,
    duration,
    spotifyUrl,
    youtubeUrl,
  });
  return response.data;
};


// Eliminar de favoritos
export const removeFavorite = async (favoriteId, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.delete(`/favorites/${favoriteId}`);
  return response.data;
};

// Obtener todos los favoritos de un usuario
export const getFavoritesByUser = async (token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.get('/favorites');
  return response.data;
};

// Obtener el número de favoritos (me gusta) para un ítem
export const getFavoriteCount = async (favoriteId, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.get(`/favorites/count/${favoriteId}`);
  return response.data;
};

// Obtener los favoritos más populares por tipo, con límite opcional (default 5)
export const getTopFavorites = async (limit = 5, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.get(`/favorites/top?limit=${limit}`);
  return response.data;
};
