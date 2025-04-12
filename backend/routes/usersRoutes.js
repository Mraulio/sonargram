const express = require('express');
const { registerUser, loginUser, getAllUsers } = require('../controllers/userController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', getAllUsers);  // Ruta para obtener todos los usuarios

module.exports = router;
