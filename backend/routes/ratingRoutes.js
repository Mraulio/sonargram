// routes/ratingRoutes.js
const express = require('express');
const { rateItem, getRatingsByUser, deleteRating, getRatingsByMbids}  = require('../controllers/ratingController.js');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/rate', requireAuth, rateItem); // crear/actualizar nota
router.get('/my-ratings', requireAuth, getRatingsByUser); // ver mis notas
// router.get('/ratings/:mbid', requireAuth, getRatingsByItem);
router.get('/ratings', requireAuth, getRatingsByMbids); // Ej: /ratings?mbids=aaa,bbb,ccc
router.delete('/rate/:mbid', requireAuth, deleteRating);

module.exports = router;
