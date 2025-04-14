// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, UserContext } from './context/UserContext';
import { ThemeProviderCustom, ThemeContext } from './context/ThemeContext';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { useContext } from 'react';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

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
      <ThemeProviderCustom>
        <ThemeWrapper />
      </ThemeProviderCustom>
    </UserProvider>
  );
}

// Componente para aplicar el tema
function ThemeWrapper() {
  const { theme } = useContext(ThemeContext);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}
