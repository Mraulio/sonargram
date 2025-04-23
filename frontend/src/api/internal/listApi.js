import createApiClient from './apiClient';

// Función para obtener el apiClient con el token
const getApiClientWithToken = (token) => {
  return createApiClient(token); // Usamos el apiClient con el token
};

// Función para obtener todas las listas
export const getAllLists = async (token) => {
  try {
    const apiClient = getApiClientWithToken(token); // Usamos el apiClient con el token
    const response = await apiClient.get('/lists');
    return response.data; // Devuelve las listas obtenidas
  } catch (error) {
    console.error('Error fetching lists:', error);
    throw error; // Lanza el error para que pueda ser manejado en el componente
  }
};

// Función para crear una nueva lista
export const createList = async (listData, token) => {
  console.log(listData)
  try {
    const apiClient = getApiClientWithToken(token); // Usamos el apiClient con el token
    const response = await apiClient.post('/lists', listData);
    return response.data; // Devuelve la lista creada
  } catch (error) {
    console.error('Error creating list:', error);
    throw error; // Lanza el error para que pueda ser manejado en el componente
  }
};
