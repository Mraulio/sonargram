// routes/ratingRoutes.js
const express = require('express');
const { rateItem, getRatingsByUser, getRatingsByItem, deleteRating }  = require('../controllers/ratingController.js');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/rate', requireAuth, rateItem); // crear/actualizar nota
router.get('/my-ratings', requireAuth, getRatingsByUser); // ver mis notas
router.get('/ratings/:mbid', getRatingsByItem);
router.delete('/rate/:mbid', requireAuth, deleteRating);

module.exports = router;
