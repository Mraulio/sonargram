const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const requireAuth = require('../middleware/requireAuth'); // Asegúrate de tener este middleware

// Crear nueva lista (autenticado)
router.post('/', requireAuth, listController.createList);

// Obtener todas las listas (público o como prefieras)
router.get('/', requireAuth, listController.getLists);

// Obtener listas de un usuario específico
router.get('/user/:userId', requireAuth, listController.getListsByUser);

// Añadir canción a una lista (autenticado)
router.post('/:listId/songs', requireAuth, listController.addSongToList);

// Eliminar canción de una lista (autenticado)
router.delete('/:listId/songs/:musicbrainzId', requireAuth, listController.removeSongFromList);

// Modificar el nombre de la lista (autenticado)
router.put('/:listId/name', requireAuth, listController.updateListName);

// Eliminar lista (autenticado)
router.delete('/:listId', requireAuth, listController.deleteList);

module.exports = router;
