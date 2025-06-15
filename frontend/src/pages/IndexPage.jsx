import { Typography, Box, Link } from '@mui/material';
import Login  from '../components/Login'
import SonargramIntro from '../components/SonargramIntro';
//backgroundImage: `url(assets/images/imagen.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
function IndexPage() {  

  return (
  
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100%',  gap: 10 }}>
      <SonargramIntro/>
      <Box sx={{ display:'flex', flexDirection: 'row', gap: 10 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'center', gap: 5,  }}>
      
      <Typography variant='h4' fontWeight={600}> ¡Bienvenido a SonarGram!</Typography>
      <Typography variant='h6'>Explora un mundo de música al alcance de tus dedos. Aquí puedes:</Typography>
      <Typography variant='h6'>🔍 Buscar tus canciones, artistas y álbumes favoritos</Typography>
          <Typography variant='h6'>🎶 Descubrir listas de reproducción creadas por otros usuarios</Typography>
          <Typography variant='h6'>👥 Conectar con otros amantes de la música</Typography>
          <Typography variant='h6'>¡Empieza a explorar y encuentra tu nuevo sonido favorito!</Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'start' }}>
      <Login/> {/* Logica para registrarse */ }
       <Typography align="center" sx={{marginTop: '1.2rem'}}>¿No tienes cuenta? <Link  href="/register" sx={{color: 'white', textDecoration: 'none'}}>Regístrate aquí</Link></Typography>
      </Box>
      </Box>
    </Box>
   

  );
}

export default IndexPage;
