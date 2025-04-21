import { TextField, Button, Typography, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import Menu from '../components/Menu';

function UserPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();  // Hook para obtener las traducciones


  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '5rem' }}>
      <Menu />
      <Card sx={{ maxWidth: 400 }}>
        Hola
        <Button variant="outlined" onClick={() => navigate('/dashboard')}>
                    Dashboard
                </Button>
      </Card>

    </div>
  );
}

export default UserPage;
