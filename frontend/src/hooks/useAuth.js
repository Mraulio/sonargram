import { useState } from 'react';
import { loginUser, registerUser } from '../api/internal/userApi';  // Importamos los métodos de login y register
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';  // Contexto para gestionar la sesión
import { jwtDecode } from 'jwt-decode';  // Para decodificar el token JWT
import { showToast } from '../utils/toast';

export default function useAuth() {
  const { login } = useContext(UserContext);  // Para guardar el token y rol en el contexto
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lógica para login
  const loginHandler = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const token = await loginUser(email, password);  // Llamamos al método loginUser
      const decodedToken = jwtDecode(token);  // Decodificamos el token
      login(token, decodedToken.role);  // Guardamos el token y el rol en el contexto
      showToast('Logueado correctamente', 'success');
      return true;  // Si el login es exitoso, devolvemos true
    } catch (err) {
      showToast('Error al loguearse', 'error');
      setError('Error logging in');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Lógica para el registro
  const registerHandler = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await registerUser(userData);  // Llamamos al método registerUser
      return response;  // Retornamos la respuesta que puede ser utilizada en el componente
    } catch (err) {
      setError('Error registering user');
      console.error(err);
      return null;  // Si ocurre un error, retornamos null
    } finally {
      setLoading(false);
    }
  };

  return {
    loginHandler,
    registerHandler,  // Ahora también exportamos el handler de registro
    loading,
    error
  };
}
