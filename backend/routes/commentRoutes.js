const express = require('express');
const router = express.Router();
const { 
  addComment, 
  deleteComment, 
  getCommentsUser, 
  getCommentsByTarget,
  addRecommendation, 
  deleteRecommendation,
  getRecommendations 
} = require('../controllers/commentController');
const { requireAuth } = require('../middleware/auth');

// Ruta para agregar un comentario
router.post('/add', requireAuth, addComment);

// Ruta para eliminar la recomendacion, quizas mover a otro routes para recomendaciones
// Debe ir antes que el otro que es más genérico y entra antes
router.delete('/recommend', requireAuth, deleteRecommendation);

// Ruta para eliminar un comentario (marcar como eliminado)
router.delete('/:commentId', requireAuth, deleteComment);

// Ruta para obtener comentarios de un usuario (o todos los comentarios)
router.get('/user', requireAuth, getCommentsUser);

// Ruta para obtener comentarios por targetId
router.get('/:targetId', requireAuth, getCommentsByTarget);

// Ruta para agregar una recomendación
router.post('/recommend', requireAuth, addRecommendation);

// Ruta para agregar una recomendación

// Ruta para obtener las recomendaciones de un comentario
router.get('/:commentId/recommendations', requireAuth, getRecommendations);

module.exports = router;
