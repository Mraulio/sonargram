const express = require('express');
const { registerUser, loginUser, getAllUsers, getUserByEmail, deleteUser, removeFavorite, addFavorite } = require('../controllers/userController');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', requireAuth, requireAdmin, getAllUsers);  // Ruta para obtener todos los usuarios
router.get('/:email', requireAuth, getUserByEmail);  // Aquí agregamos el parámetro ':email' en la URL
router.delete('/:email', requireAuth, requireAdmin, deleteUser);

// Ruta para añadir un favorito
router.post('/favorites', requireAuth, addFavorite);  // El userId lo obtenemos del token

// Ruta para eliminar un favorito
router.delete('/favorites', requireAuth, removeFavorite);  // El userId lo obtenemos del token


module.exports = router;
