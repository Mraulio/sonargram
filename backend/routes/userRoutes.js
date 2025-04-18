const express = require('express');
const { registerUser, loginUser, getAllUsers, getUserByEmail, deleteUser} = require('../controllers/userController');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', requireAuth, requireAdmin, getAllUsers);  // Ruta para obtener todos los usuarios
router.get('/:email', requireAuth, getUserByEmail);  // Aquí agregamos el parámetro ':email' en la URL
router.delete('/:email', requireAuth, requireAdmin, deleteUser);

module.exports = router;
