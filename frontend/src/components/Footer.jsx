// ...existing imports...
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import i18n from '../i18n';
import { Avatar, Box, Typography, Card, CardContent, Button, TextField, Divider, FormControl, InputLabel, Select, MenuItem, styled, Link } from '@mui/material';

const Footer = styled('footer')`
  width: 100vw;
  height: 10vh;
  background: #3e4a4c;
  padding: 10px 0;
  z-index: 100;
  display: flex;
  justify-content:space-around;
  align-items:center;
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

  const CustomButton = styled(Link)`
    color : #3e4a4c;
    text-decoration: none;
    cursor: pointer;
    width: 30px;
    height: 30px;
  `;


function FooterBar({ toggleTheme, mode }) {
    
  return (
    <Footer>
      <CustomMenu2>
        <CustomButton as="button" onClick={toggleTheme}>
          <FontAwesomeIcon icon={mode === 'light' ? faMoon : faSun} size="lg" />
        </CustomButton>
        <CustomButton as="button" onClick={() => i18n.changeLanguage('en')}>EN</CustomButton>
        <CustomButton as="button" onClick={() => i18n.changeLanguage('es')}>ES</CustomButton>
      </CustomMenu2>
      <Typography color='WHITE'>COPYRIGHT SONARGRAM</Typography>
    </Footer>
  );
}
export default FooterBar;