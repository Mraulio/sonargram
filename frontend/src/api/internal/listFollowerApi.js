import createApiClient from './apiClient'; // Asegurate de ajustar el path si cambia

// Seguir una lista
export const followList = async (listId, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.post(`listfollow/${listId}/follow`);
  return response.data;
};

// Dejar de seguir una lista
export const unfollowList = async (listId, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.delete(`listfollow/${listId}/unfollow`);
  return response.data;
};

// Obtener seguidores de una lista
export const getFollowersOfList = async (listId, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.get(`${listId}`);
  return response.data;
};

// Obtener número de seguidores de una lista
export const getFollowersCount = async (listId, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.get(`${listId}`);
  return response.data;
};

// Obtener todas las listas que sigue un usuario
export const getListsFollowedByUser = async (userId, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.get(`/listfollow/${userId}/followed-lists`);
  return response.data;
};
