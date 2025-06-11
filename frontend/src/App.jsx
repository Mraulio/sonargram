import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, UserContext } from './context/UserContext';
import { ThemeProviderCustom, ThemeContext } from './context/ThemeContext';
import { ThemeProvider, CssBaseline, Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem, Link } from '@mui/material';
import Menu2 from './components/Menu2'; // Asegúrate de importar el componente del menú
import { useContext } from 'react';
import FooterBar from './components/Footer';
// Pages
import IndexPage from './pages/IndexPage';
import Dashboard from './pages/Dashboard';
import UserPage from './pages/UserPage';
import ListPage from './pages/ListPage';
import FollowerPage from './pages/FollowerPage';
import FollowedPage from './pages/FollowedPage';
import RegisterPage from './pages/RegisterPage'; // Asegúrate de importar el componente de registro
import PrivateRoute from './components/PrivateRoute';
import AdminPage from './pages/AdminPage';
import EditUser from './pages/EditUser'; // Asegúrate de importar el componente de edición de usuario
import TestPage from './pages/Test'; // Asegúrate de importar el componente de prueba
import TestBuscador from './pages/TestBuscador'; // Asegúrate de importar el componente de prueba buscador
import Test5 from './pages/Test5';
import CommunityPage from './pages/CommunityPage';
import UserItems from './pages/UserItems';
import ResultsPage from './pages/ResultsPage';
import UserResult from './pages/UserResult'
// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import i18n from './i18n';
import Test from './pages/Test';
import { styled } from '@mui/material/styles';

const CustomButton = styled(Link)`
    color : white;
    text-decoration: none;
    cursor: pointer;
  `;

const CustomMenu2 = styled(Box)`
  display: flex;
  gap: 30px;
  left: 20px;
  justify-content: center;
  align-content: center;
  width: 120px;
  background: transparent;
`;

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
        <Route path="/editUser/:id" element={<PrivateRoute><EditUser/></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><UserPage/></PrivateRoute>} />
        <Route path="/lists" element={<PrivateRoute><ListPage/></PrivateRoute>} />
        <Route path="/followers" element={<PrivateRoute><FollowerPage/></PrivateRoute>} />
        <Route path="/followed" element={<PrivateRoute><FollowedPage/></PrivateRoute>} />
        <Route path="/test5" element={<PrivateRoute><Test5/></PrivateRoute>} />
        <Route path="/test2" element={<PrivateRoute><TestBuscador/></PrivateRoute>} />
        <Route path="/community" element={<PrivateRoute><CommunityPage/></PrivateRoute>} />
        <Route path="/userItems" element={<PrivateRoute><UserItems/></PrivateRoute>} />
        <Route path="results" element={<PrivateRoute><ResultsPage/></PrivateRoute>} />
        <Route path="/userresult/:id" element={<PrivateRoute><UserResult/></PrivateRoute>} />
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/"} />} />
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
      <App />
      <FooterBar toggleTheme={toggleTheme} mode={mode} />
    </ThemeProvider>
  );
}
