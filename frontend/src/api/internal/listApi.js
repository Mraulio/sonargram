import createApiClient from './apiClient';

// Crear una lista
export const createList = async (listData, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.post('/lists', listData);
  return response.data;
};

// Obtener todas las listas (admin)
export const getAllLists = async (token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.get('/lists');
  return response.data;
};

// Obtener listas por usuario
export const getListsByUser = async (userId, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.get(`/lists/user/${userId}`);
  return response.data;
};

// Obtener lista por ID
export const getListById = async (listId, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.get(`/lists/${listId}`);
  return response.data;
};

// Añadir canción a lista
export const addSongToList = async (listId, musicbrainzId, title, artistName, coverUrl, releaseDate, duration, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.post(`/lists/${listId}/songs`, { musicbrainzId, title, artistName, coverUrl, releaseDate, duration });
  return response.data;
};

// Eliminar canción de lista
export const removeSongFromList = async (listId, musicbrainzId, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.delete(`/lists/${listId}/songs/${musicbrainzId}`);
  return response.data;
};

// Actualizar nombre de lista
export const updateListName = async (listId, newName, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.put(`/lists/${listId}/name`, { name: newName } );
  return response.data;
};

// Eliminar lista
export const deleteList = async (listId, token) => {
  const apiClient = createApiClient(token);
  console.log('Deleting list with ID:', listId); // Debugging line
  const response = await apiClient.delete(`/lists/${listId}`);
  return response.data;
};

// Obtener las listas más seguidas
export const getMostFollowedLists = async (token, limit = 10) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.get(`/lists/most-followed?limit=${limit}`);
  return response.data;
};
