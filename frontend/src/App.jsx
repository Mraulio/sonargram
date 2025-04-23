import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, UserContext } from './context/UserContext';
import { ThemeProviderCustom, ThemeContext } from './context/ThemeContext';
import { ThemeProvider, CssBaseline, Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem, Link } from '@mui/material';

import { useContext } from 'react';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UserPage from './pages/UserPage';
import AlbumPage from './pages/AlbumPage';
import SongPage from './pages/SongPage';
import ArtistPage from './pages/ArtistPage';
import ListPage from './pages/ListPage';
import FollowerPage from './pages/FollowerPage';
import FollowedPage from './pages/FollowedPage';
import RegisterPage from './pages/RegisterPage'; // Asegúrate de importar el componente de registro
import PrivateRoute from './components/PrivateRoute';



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
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><UserPage/></PrivateRoute>} />
        <Route path="/album" element={<PrivateRoute><AlbumPage/></PrivateRoute>} />
        <Route path="/songs" element={<PrivateRoute><SongPage/></PrivateRoute>} />
        <Route path="/artists" element={<PrivateRoute><ArtistPage/></PrivateRoute>} />
        <Route path="/lists" element={<PrivateRoute><ListPage/></PrivateRoute>} />
        <Route path="/followers" element={<PrivateRoute><FollowerPage/></PrivateRoute>} />
        <Route path="/followed" element={<PrivateRoute><FollowedPage/></PrivateRoute>} />
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
