// proxyApi.js
import createApiClient from "./apiClient";

export const getMusicBrainzDataFromProxy = async (path, token) => {
  const apiClient = createApiClient(token);
  try {
    const response = await apiClient.get(`/proxy/musicbrainz/${path}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener datos MusicBrainz desde proxy:", error);
    throw error;
  }
};

export const getCoverFromProxy = async (mbid, type = "release-group", token) => {
  const apiClient = createApiClient(token);
  try {
    const response = await apiClient.get(`/proxy/coverartarchive.org/${type}/${mbid}`);
    if (response.data.notFound) {
      return null;
    }
    return response.data.images?.[0]?.thumbnails?.small || response.data.images?.[0]?.image || null;
  } catch (error) {
    // Aquí ignoramos el 404 porque es esperado
    if (error.response?.status !== 404) {
      console.error("Error al obtener imagen desde proxy:", error);
    }
    return null;
  }
};
