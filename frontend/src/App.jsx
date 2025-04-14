import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, UserContext } from './context/UserContext';
import { ThemeProviderCustom, ThemeContext } from './context/ThemeContext';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { useContext } from 'react';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import i18n from './i18n';

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
  const { theme, toggleTheme, mode } = useContext(ThemeContext);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Header con botón de cambio de tema */}
      <div className="header">
        <button className="theme-button" onClick={toggleTheme}>
          <FontAwesomeIcon icon={mode === 'light' ? faMoon : faSun} size="lg" />
        </button>
        <button onClick={() => i18n.changeLanguage('en')}>EN</button>
      <button onClick={() => i18n.changeLanguage('es')}>ES</button>
      </div>
      <App />
    </ThemeProvider>
  );
}
