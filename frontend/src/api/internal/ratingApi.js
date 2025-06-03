import createApiClient from './apiClient';

// Crear o actualizar una valoración
export const rateItem = async (mbid, type, rating, title, artistName, coverUrl, releaseDate, duration, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.post('/rating/rate', {
    mbid,
    type,
    rating, 
    title,
    artistName,
    coverUrl,
    releaseDate,
    duration,
  });
  return response.data;
};

// Eliminar una valoración propia
export const deleteRating = async (mbid, token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.delete(`/rating/rate/${mbid}`);
  return response.data;
};

// Obtener todas las valoraciones del usuario actual
export const getUserRatings = async (token) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.get('/rating/my-ratings');
  return response.data;
};

/* No hace falta porque se usa el otro pasando la lista y ya devuelve la media y el count
// Obtener todas las valoraciones de un ítem específico (por mbid)
export const getRatingsByItem = async (mbid) => {
  const apiClient = createApiClient(); // no requiere token
  const response = await apiClient.get(`/ratings/${mbid}`);
  return response.data;
};
*/

export const getRatingsByMbids = async (mbidList, token) => {
    const apiClient = createApiClient(token);
    const query = mbidList.join(',');
    const response = await apiClient.get(`/rating/ratings?mbids=${query}`);
    return response.data; // → { mbid1: { average, count }, mbid2: {...}, ... }
  };

  /**
 * Obtiene los items con mejor rating para un tipo específico (artist, album, song)
 * @param {string} type - Tipo del item ('artist', 'album', 'song')
 * @param {number} limit - Cantidad máxima de resultados
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de objetos con la info de los items y sus ratings
 */
export const getTopRatingsByType = async (limit = 5, token) => {
  const apiClient = createApiClient(token);
  // Suponiendo que el endpoint es así:
  const response = await apiClient.get(`/rating/top?limit=${limit}`);
  return response.data;
};