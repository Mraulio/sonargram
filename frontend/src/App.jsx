import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, UserContext } from './context/UserContext';
import { ThemeProviderCustom, ThemeContext } from './context/ThemeContext';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useContext } from 'react';

import FooterBar from './components/Footer';

import { MediaPlayerProvider, useMediaPlayer } from './context/MediaPlayerContext';

// Pages
import IndexPage from './pages/IndexPage';
import Dashboard from './pages/Dashboard';
import UserPage from './pages/UserPage';
import ListPage from './pages/ListPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import AdminPage from './pages/AdminPage';
import TestPage from './pages/Test';
import TestBuscador from './pages/TestBuscador';
import Test5 from './pages/Test5';
import TopsPage from './pages/TopsPage';
import UserResult from './pages/UserResult';
import SearchPage from './pages/SearchPage';
import FloatingMediaPlayer from './components/FloatingMediaPlayer';

function App() {
  const { token } = useContext(UserContext);

  return (
    <Router>
      <Routes>
        <Route path="/" element={!token ? <IndexPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><UserPage /></PrivateRoute>} />
        <Route path="/lists" element={<PrivateRoute><ListPage /></PrivateRoute>} />
        <Route path="/test5" element={<PrivateRoute><Test5 /></PrivateRoute>} />
        <Route path="/test2" element={<PrivateRoute><TestBuscador /></PrivateRoute>} />
        <Route path="/tops" element={<PrivateRoute><TopsPage /></PrivateRoute>} />
        <Route path="/userresult/:id" element={<PrivateRoute><UserResult /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><SearchPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/"} />} />
      </Routes>
    </Router>
  );
}

// Componente que aplica el tema y el reproductor flotante
function ThemeWrapper() {
  const { theme, toggleTheme, mode } = useContext(ThemeContext);
  const { mediaPlayer, closeMedia } = useMediaPlayer();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
      {mediaPlayer?.url && (
        <FloatingMediaPlayer type={mediaPlayer.type} url={mediaPlayer.url} title={mediaPlayer.title} onClose={closeMedia} />
      )}
      <FooterBar toggleTheme={toggleTheme} mode={mode} />
    </ThemeProvider>
  );
}

// Envolvemos todo en los providers
export default function AppWrapper() {
  return (
    <UserProvider>
      <MediaPlayerProvider>
        <ThemeProviderCustom>
          <ThemeWrapper />
        </ThemeProviderCustom>
      </MediaPlayerProvider>
    </UserProvider>
  );
}
