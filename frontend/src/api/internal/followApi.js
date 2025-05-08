import createApiClient from './apiClient'; // Ajustá la ruta si es diferente

// Seguir a un usuario
export const followUser = async (followedId, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.post(`/follow/${followedId}`);
  return response.data;
};

// Dejar de seguir a un usuario
export const unfollowUser = async (followedId, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.delete(`/follows/${followedId}`);
  return response.data;
};

// Obtener los seguidores de un usuario
export const getFollowers = async (userId, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.get(`/follows/followers/${userId}`);
  return response.data;
};

// Obtener los usuarios que un usuario está siguiendo
export const getFollowing = async (userId, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.get(`/follows/following/${userId}`);
  return response.data;
};
