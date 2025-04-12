const express = require('express');
const { registerUser, loginUser, getAllUsers, getUserByEmail, deleteUser } = require('../controllers/userController');
const router = express.Router();
const requireAdmin = require('../middleware/requireAdmin');  // Importar el middleware

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', getAllUsers);  // Ruta para obtener todos los usuarios
router.get('/:email', getUserByEmail);  // Aquí agregamos el parámetro ':email' en la URL
router.delete('/:email', requireAdmin, deleteUser);

module.exports = router;
