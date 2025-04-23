const express = require('express');
const { registerUser, updateUser, loginUser, getAllUsers, getUserByEmail, deleteUser} = require('../controllers/userController');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.put('/update/:id', requireAuth, updateUser);

router.get('/', requireAuth, requireAdmin, getAllUsers);  // Ruta para obtener todos los usuarios
router.get('/:email', requireAuth, getUserByEmail);  // Aquí agregamos el parámetro ':email' en la URL

// Borar por ID de Mongo
router.delete('/:id', requireAuth, requireAdmin, deleteUser);

module.exports = router;
