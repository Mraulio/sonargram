const express = require('express');
const { addFavorite, removeFavorite, getFavoritesByUser, getFavoriteCount, getTopFavorites } = require('../controllers/favoriteController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, addFavorite);
router.delete('/:favoriteId', requireAuth, removeFavorite);
router.get('/:userId', requireAuth, getFavoritesByUser);
router.get('/count/:favoriteId', requireAuth, getFavoriteCount);

router.get('/top', requireAuth, getTopFavorites);

module.exports = router;
