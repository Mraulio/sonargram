const express = require('express');
const { registerUser, loginUser, getAllUsers, getUserByEmail } = require('../controllers/userController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', getAllUsers);  // Ruta para obtener todos los usuarios
router.get('/email/:email', getUserByEmail);  // Aquí agregamos el parámetro ':email' en la URL

module.exports = router;
