import { jwtDecode } from 'jwt-decode';
import { createContext, useState, useEffect } from 'react';

// Crear el contexto
export const UserContext = createContext();

// Crear el provider
export const UserProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
      }
    } catch (err) {
      logout();
    }
  }

  setIsLoading(false); // ✅ ya terminó de chequear
}, []);

  // Función para iniciar sesión y actualizar el contexto
  const login = (token, role) => {
    setToken(token);
    setRole(role);

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
    <UserContext.Provider value={{ token, role, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};
