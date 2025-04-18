const express = require('express');
const { addFavorite, removeFavorite, getFavoritesByUser, getFavoriteCount } = require('../controllers/favoriteController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, addFavorite);
router.delete('/:favoriteId', requireAuth, removeFavorite);
router.get('/', requireAuth, getFavoritesByUser);
router.get('/count/:favoriteId', requireAuth, getFavoriteCount);

module.exports = router;
