import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

const PrivateRoute = ({ children }) => {
  const { token, isLoading } = useContext(UserContext);

  if (isLoading) {
    return <div>Loading...</div>; // o un spinner si querés
  }

  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
