import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

export const showToast = (message, type = 'success') => {
  const styles = {
    success: {
      background: '#3498db', // azul
      borderRadius: '8px',
      color: '#fff',
    },
    error: {
      background: '#c0392b', // rojo más oscuro
      borderRadius: '8px',
      color: '#fff',
    },
  };

  const toastStyle = styles[type] || styles.success;

  Toastify({
    text: message,
    duration: 3000,
    gravity: 'top',
    position: 'right',
    stopOnFocus: true,
    style: toastStyle,
  }).showToast();
};
