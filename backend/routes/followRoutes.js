const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const { requireAuth } = require('../middleware/auth');

// Ruta para seguir a un usuario
router.post('/:followedId', requireAuth, followController.followUser);

// Ruta para dejar de seguir a un usuario
router.delete('/:followedId', requireAuth, followController.unfollowUser);

// Ruta para obtener los seguidores de un usuario
router.get('/followers/:userId', requireAuth, followController.getFollowers);

// Obtener los usuarios que sigue un usuario
router.get('/following/:userId', followController.getFollowing);

module.exports = router;
