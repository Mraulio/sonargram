import { jwtDecode } from 'jwt-decode';
import { createContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../api/internal/userApi';

// Crear el contexto
export const UserContext = createContext();

// Crear el provider
export const UserProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null); // Estado para guardar los datos del usuario
  const [isLoading, setIsLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(null);

  // Verificar si hay token en el localStorage al cargar la página
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');

    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken);
        const isExpired = decoded.exp * 1000 < Date.now();

        if (isExpired) {
          logout();
        } else {
          setToken(savedToken);
          setRole(savedRole);
          setUser(decoded); // <- Guarda los datos decodificados
        }
      } catch (err) {
        logout();
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = await getCurrentUser(token);
        if (currentUser) {
          setProfilePic(currentUser.profilePic);
        }
      } catch (err) {
        console.error('Error al coger la imagen de perfil', err)
      }
    };

    fetchUserData();
  }, [token]);

  // Función para iniciar sesión y actualizar el contexto
  const login = (token, role, user) => {
    setToken(token);
    setRole(role);

    const decoded = jwtDecode(token);
    setUser(decoded);

    // Guardar en localStorage para persistir entre recargas de página
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);

  };

  // Función para cerrar sesión y limpiar el contexto
  const logout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  return (
    <UserContext.Provider value={{ token, role, user, login, logout, isLoading, profilePic, setProfilePic }}>
      {children}
    </UserContext.Provider>
  );
};
