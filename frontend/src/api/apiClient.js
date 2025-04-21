// src/api/apiClient.js
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

  // Interceptor de respuesta para manejar expiración del token
  apiClient.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 403) {
        // Aquí no accedemos a localStorage, dejamos que el contexto lo maneje
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return apiClient;
};

export default createApiClient;
