const express = require('express');
const router = express.Router();
const listFollowerController = require('../controllers/listFollowerController');
const { requireAuth } = require('../middleware/auth');

// Seguir una lista
router.post('/:listId/follow', requireAuth, listFollowerController.followList);

// Seguidores
router.get('/:listId', requireAuth, listFollowerController.getFollowersOfList);

router.get('/followers-count/:listId', requireAuth, listFollowerController.getFollowersCount);

// Obtener todas las listas que sigue un usuario
router.get('/:userId/followed-lists', listFollowerController.getListsFollowedByUser);


// Dejar de seguir una lista
router.delete('/:listId/unfollow', requireAuth, listFollowerController.unfollowList);

module.exports = router;
