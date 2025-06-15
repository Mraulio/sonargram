import createApiClient from "./apiClient";

// Agregar comentario
export const addComment = async (targetId, targetType, title, artistName, coverUrl, releaseDate, duration, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.post('/comments/add', targetId, targetType, title, artistName, coverUrl, releaseDate, duration);
  return response.data;
};

// Eliminar comentario
export const deleteComment = async (commentId, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.delete(`/comments/${commentId}`);
  return response.data;
};

// Obtener comentarios de un usuario (opcional targetType)
export const getCommentsByUser = async (userId, token, targetType = null) => {
  const apiClient = createApiClient(token);
  const params = targetType ? { user: userId, targetType } : { user: userId };
  const response = await apiClient.get('/comments/user', { params });
  return response.data;
};

// Obtener comentarios por targetId
export const getCommentsByTarget = async (targetId, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.get(`/comments/${targetId}`);
  return response.data;
};

// Agregar recomendación a un comentario
export const addRecommendation = async (commentId, userId, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.post('/comments/recommend', { commentId, userId });
  return response.data;
};

// Eliminar recomendación de un comentario
export const deleteRecommendation = async (commentId, userId, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.delete('/comments/recommend', { data: { commentId, userId } });
  return response.data;
};

// Obtener recomendaciones de un comentario
export const getRecommendations = async (commentId, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.get(`/comments/${commentId}/recommendations`);
  return response.data;
};
