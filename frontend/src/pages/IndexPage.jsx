import { Typography, Box, Link } from '@mui/material';
import Login  from '../components/Login'

function IndexPage() {  

  return (
  
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'end', justifyContent: 'center', height: '100vh', width: '100vw', backgroundImage: `url(assets/images/imagen.jpg)`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', gap: 10 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'start', height: '50vh' }}>
      <img src='assets/images/logo.svg' alt="Logo" style={{ width: '200px', height: 'auto' }} />
      <Typography variant="h6" sx={{ color: 'white', marginTop: '1rem' }}>
      Bienvenido a nuestra aplicación de música
    </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <Login/> {/* Logica para registrarse */ }
       <Typography align="center" sx={{marginTop: '1.2rem'}}>¿No tienes cuenta? <Link  href="/register" sx={{color: 'white', textDecoration: 'none'}}>Regístrate aquí</Link></Typography>
      </Box>
    </Box>
   

  );
}

export default IndexPage;
