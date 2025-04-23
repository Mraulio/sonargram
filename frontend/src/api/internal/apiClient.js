import axios from 'axios';

const createApiClient = (token) => {
  const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
  });

  // Interceptor para incluir el token en cada solicitud
  apiClient.interceptors.request.use(
    config => {
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  return apiClient;
};

export default createApiClient;
