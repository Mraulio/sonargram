import createApiClient from '../config/apiClient'; // Ajustá el path según tu estructura

// Agregar a favoritos
export const addFavorite = async (favoriteId, favoriteType, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.post('/favorites', {
    favoriteId,
    favoriteType
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
