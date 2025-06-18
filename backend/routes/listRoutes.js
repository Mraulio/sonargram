const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const { requireAuth } = require('../middleware/auth');

// Crear nueva lista
router.post('/', requireAuth, listController.createList);

// Obtener todas las listas
router.get('/', requireAuth, listController.getLists);

// Obtener listas de un usuario específico
router.get('/user/:userId', requireAuth, listController.getListsByUser);

// Obtener las listas más seguidas
router.get('/most-followed', requireAuth, listController.getMostFollowedLists);

// Obtener lista por su id
router.get('/:listId', requireAuth, listController.getListById);


// Añadir canción a una lista
router.post('/:listId/songs', requireAuth, listController.addSongToList);

// Eliminar canción de una lista
router.delete('/:listId/songs/:musicbrainzId', requireAuth, listController.removeSongFromList);

// Modificar el nombre de la lista
router.put('/:listId/name', requireAuth, listController.updateListName);

// Eliminar lista
router.delete('/:listId', requireAuth, listController.deleteList);

module.exports = router;
