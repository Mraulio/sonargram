import createApiClient from './apiClient';

// Función para obtener el apiClient con el token
const getApiClientWithToken = (token) => {
  return createApiClient(token); // Usamos el apiClient con el token
};

// Función para login
export const loginUser = async (email, password) => {
  try {
    const apiClient = createApiClient(); // apiClient sin token
    const res = await apiClient.post('/users/login', { email, password });
    const { token } = res.data;
    return token; // Devolvemos el token al componente para que se gestione allí
  } catch (err) {
    throw new Error('Error logging in');
  }
};

// Registrar un nuevo usuario
export const registerUser = async (userData) => {
  try {
    const apiClient = createApiClient(); // apiClient sin token
    const response = await apiClient.post('/users/register', userData);
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error; // Propagar el error para manejarlo donde se llama
  }
};

// Actualizar un usuario (solo los campos permitidos)
export const updateUser = async (userId, userData, token) => {
  try {
    
    const apiClient = getApiClientWithToken(token); // Usamos el apiClient con el token
    const response = await apiClient.put(`/users/update/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error; // Propagar el error
  }
};

// Eliminar un usuario
export const deleteUser = async (userId, token) => {
  try {
    const apiClient = getApiClientWithToken(token); // Usamos el apiClient con el token
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error; // Propagar el error
  }
};

// Obtener todos los usuarios (solo admin)
export const getAllUsers = async (token) => {
  try {
    const apiClient = getApiClientWithToken(token); // Usamos el apiClient con el token
    const response = await apiClient.get('/users');
    return response.data;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error; // Propagar el error
  }
};

// Obtener un usuario logueado
export const getCurrentUser = async (token) => {
  try {
    const apiClient = getApiClientWithToken(token); // Usamos el apiClient con el token
    const response = await apiClient.get(`/users/me`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error; // Propagar el error
  }
};

// Obtener un usuario por correo electrónico
export const getUserById = async (id, token) => {
  try {
    const apiClient = getApiClientWithToken(token); // Usamos el apiClient con el token
    const response = await apiClient.get(`/users/id/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error; // Propagar el error
  }
};

// Obtener un usuario por correo electrónico
export const getUserByEmail = async (email, token) => {
  try {
    const apiClient = getApiClientWithToken(token); // Usamos el apiClient con el token
    const response = await apiClient.get(`/users/email/${email}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error; // Propagar el error
  }
};
