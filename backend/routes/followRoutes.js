const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const { requireAuth } = require('../middleware/auth');

// Ruta para seguir a un usuario
router.post('/follow/:followedId', requireAuth, followController.followUser);

// Ruta para dejar de seguir a un usuario
router.delete('/unfollow/:followedId', requireAuth, followController.unfollowUser);

// Ruta para obtener los seguidores de un usuario
router.get('/followers/:userId', requireAuth, followController.getFollowers);

module.exports = router;
