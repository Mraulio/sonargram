import { Typography, Box, Link, styled, useTheme } from '@mui/material';
import Login  from '../components/Login'
import SonargramIntro from '../components/SonargramIntro';
import { useTranslation } from 'react-i18next';

const IndexBox= styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content:center;
  gap: 50px;

  @media (max-width: 960px) {
    flex-direction: column;
  }
  @media (max-width: 600px) {
   
  }
`;

const AnimationBox= styled(Box)`
  @media (max-width: 960px) {
    display:none;
  }
`;
const LogoBox= styled(Box)`
  display: none; 
  justify-content:center; 
  align-items:center; 
  gap:10px;
  margin-top: 5em;

  @media (max-width: 960px) {
    display:flex;
  }
  @media (max-width: 600px) {
    width: 30px;
  }
`;


function IndexPage() {  
  const { t } = useTranslation();  // Hook para obtener las traducciones
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%',  gap: 10,  }}>
      <AnimationBox>
        <SonargramIntro/>
      </AnimationBox>
      <LogoBox>
        <img src="/assets/images/logo.svg" style={{width: '150px', height: '150px' }}/>
        <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: '2rem'}}>Sonargram</Typography>
      </LogoBox>
      <IndexBox>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'start', gap: 3, margin: 5  }}>  
          <Typography variant='h4' fontWeight={600}>{t('welcometosonargram')}</Typography>
          <Typography sx={{ fontSize: '1.1rem' }}>{t('exploreaworld')}</Typography>
          <Typography sx={{ fontSize: '1.1rem' }}>{t('searchsongs')}</Typography>
          <Typography sx={{ fontSize: '1.1rem' }}>{t('discoversongs')}</Typography>
          <Typography sx={{ fontSize: '1.1rem' }}> {t('connect')}</Typography>
          <Typography sx={{ fontSize: '1.3rem' }}>{t('begintoexplore')}</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: 3 }}>
          <Login/> {/* Logica para registrarse */ }
          <Typography align="center" sx={{marginTop: '1.2rem'}}>{t('donthaveanaccount?')} <Link  href="/register" sx={{color: '#d63b1f', textDecoration: 'none', fontWeight:'600'}}>{t('registerhere')}</Link></Typography>
        </Box>
      </IndexBox>
    </Box>
   

  );
}

export default IndexPage;
