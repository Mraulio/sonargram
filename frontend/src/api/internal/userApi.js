import createApiClient from './apiClient';

// Función para login
export const loginUser = async (email, password) => {
  const apiClient = createApiClient(); // Usamos el apiClient sin token

  try {
    const res = await apiClient.post('/users/login', {
      email,
      password,
    });

    const { token } = res.data;
    return token; // Devolvemos el token al componente para que se gestione allí
  } catch (err) {
    throw new Error('Error logging in');
  }
};
