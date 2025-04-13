import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserContext, UserProvider } from './context/UserContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import { useContext } from 'react';

function App() {
  const { token } = useContext(UserContext);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default function AppWrapper() {
  return (
    <UserProvider>
      <App />
    </UserProvider>
  );
}
