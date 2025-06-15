const express = require('express');
const {
  rateItem,
  getRatingsByUser,
  deleteRating,
  getRatingsByMbids,
  getTopRatings,          // <-- nuevo controlador
} = require('../controllers/ratingController.js');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/rate', requireAuth, rateItem);              // crear/actualizar nota
router.get('/my-ratings', requireAuth, getRatingsByUser); // ver mis notas
router.get('/ratings', requireAuth, getRatingsByMbids);   // /ratings?mbids=aaa,bbb,ccc
router.delete('/rate/:mbid', requireAuth, deleteRating);

router.get('/top', requireAuth, getTopRatings);           // <-- NUEVO endpoint para top ratings

module.exports = router;
