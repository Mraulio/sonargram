// src/api/activityApi.js
import createApiClient from "./apiClient";

export const getTimeline = async (token, page = 1, limit = 20) => {
  const apiClient = createApiClient(token);
  const response = await apiClient.get('/activities/timeline', {
    params: { page, limit },
  });
  return response.data;
};
