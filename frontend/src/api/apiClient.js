// src/api/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor para incluir el token en cada solicitud
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
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
      localStorage.removeItem('authToken');
      window.location.href = '/login'; // redirección al login
    }
    return Promise.reject(error);
  }
);

export default apiClient;
