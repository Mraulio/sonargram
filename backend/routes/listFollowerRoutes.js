const express = require('express');
const router = express.Router();
const listFollowerController = require('../controllers/listFollowerController');
const requireAuth = require('../middleware/requireAuth');

// Seguir una lista
router.post('/:listId/follow', requireAuth, listFollowerController.followList);

// Seguidores
router.get('/followers/:listId', listFollowerController.getFollowersOfList); // público o protegido, tú decides
router.get('/followers-count/:listId', listFollowerController.getFollowersCount); // opcional

// Dejar de seguir una lista
router.delete('/:listId/unfollow', requireAuth, listFollowerController.unfollowList);

module.exports = router;
