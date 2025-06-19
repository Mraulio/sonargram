import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, UserContext } from './context/UserContext';
import { ThemeProviderCustom, ThemeContext } from './context/ThemeContext';
import { ThemeProvider, CssBaseline, Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem, Link } from '@mui/material';
import { useContext } from 'react';

import FooterBar from './components/Footer';

// Pages
import IndexPage from './pages/IndexPage';
import Dashboard from './pages/Dashboard';
import UserPage from './pages/UserPage';
import ListPage from './pages/ListPage';

import RegisterPage from './pages/RegisterPage'; // Asegúrate de importar el componente de registro
import PrivateRoute from './components/PrivateRoute';
import AdminPage from './pages/AdminPage';
import TestPage from './pages/Test'; // Asegúrate de importar el componente de prueba
import TestBuscador from './pages/TestBuscador'; // Asegúrate de importar el componente de prueba buscador
import Test5 from './pages/Test5';
import TopsPage from './pages/TopsPage';
import ResultsPage from './pages/ResultsPage';
import UserResult from './pages/UserResult';

import { useYoutubePlayer, YoutubePlayerProvider } from './context/YoutubePlayerContext';
import FloatingYouTubePlayer from './components/FloatingYoutubePlayer';

function App() {
  const { token } = useContext(UserContext);

  return (
    <Router>
      <Routes>
        <Route path="/" element={!token ? <IndexPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/test" element={<PrivateRoute><Test/></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AdminPage/></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><UserPage/></PrivateRoute>} />
        <Route path="/lists" element={<PrivateRoute><ListPage/></PrivateRoute>} />
        <Route path="/test5" element={<PrivateRoute><Test5/></PrivateRoute>} />
        <Route path="/test2" element={<PrivateRoute><TestBuscador/></PrivateRoute>} />
        <Route path="/tops" element={<PrivateRoute><TopsPage/></PrivateRoute>} />
        <Route path="results" element={<PrivateRoute><ResultsPage/></PrivateRoute>} />
        <Route path="/userresult/:id" element={<PrivateRoute><UserResult/></PrivateRoute>} />
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/"} />} />
      </Routes>
    </Router>
  );
}

// Componente que envuelve el App y provee el contexto global del reproductor
function ThemeWrapper() {
  const { theme, toggleTheme, mode } = useContext(ThemeContext);
  const { youtubeUrl, closeYoutube } = useYoutubePlayer();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
      {youtubeUrl && (
        <FloatingYouTubePlayer url={youtubeUrl} onClose={closeYoutube} />
      )}
      <FooterBar toggleTheme={toggleTheme} mode={mode} />
    </ThemeProvider>
  );
}

export default function AppWrapper() {
  return (
    <UserProvider>
      <YoutubePlayerProvider>
        <ThemeProviderCustom>
          <ThemeWrapper />
        </ThemeProviderCustom>
      </YoutubePlayerProvider>
    </UserProvider>
  );
}
