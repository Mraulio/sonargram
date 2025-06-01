const express = require('express');
const router = express.Router();
const activitiesController = require('../controllers/activitiesController');
const { requireAuth } = require('../middleware/auth');

// Obtener timeline (usuarios que sigue)
router.get('/timeline', requireAuth, activitiesController.getTimeline);

// Obtener actividades de un usuario (perfil)
router.get('/user/:userId', requireAuth, activitiesController.getActivitiesByUser);

module.exports = router;
