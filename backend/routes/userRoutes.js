const express = require('express');
const { registerUser, updateUser, uploadProfilePic, loginUser, getCurrentUser, getAllUsers, getUserById, getUserByEmail, deleteUser,deleteProfilePic} = require('../controllers/userController');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');


router.post('/register', registerUser);
router.post('/login', loginUser);

router.put('/update/:id', requireAuth, updateUser);

router.post('/upload-profile-pic', requireAuth, upload.single('profilePic'), uploadProfilePic);
router.delete('/delete-profile-pic', requireAuth, deleteProfilePic);


router.get('/', requireAuth, getAllUsers);  // Ruta para obtener todos los usuarios

router.get('/me', requireAuth, getCurrentUser);

router.get('/id/:id', requireAuth, getUserById);

router.get('/email/:email', requireAuth, getUserByEmail);


// Borrar por ID de Mongo
router.delete('/:id', requireAuth, deleteUser);

module.exports = router;
