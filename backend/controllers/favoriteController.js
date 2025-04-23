const favoriteService = require('../services/favoriteService');

const addFavorite = async (req, res) => {
    try {
      const result = await favoriteService.addFavorite(
        req.user.userId, // 🔐 viene del token
        req.body.favoriteId,
        req.body.favoriteType
      );
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  

const removeFavorite = async (req, res) => {
    try {
      const { favoriteId } = req.params;  // favoriteId se pasa por parámetros
      const userId = req.user.userId;    // userId se obtiene del JWT (middleware de autenticación)
      
      const deletedFavorite = await favoriteService.removeFavorite(userId, favoriteId);
      
      res.status(200).json({ message: 'Favorite removed', favorite: deletedFavorite });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  

const getFavoritesByUser = async (req, res) => {
  try {
    const userId = req.user.userId;  // lo obtienes del JWT gracias al middleware
    const result = await favoriteService.getFavorites(userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
  

// Método para obtener el número de "me gusta" de un favorito (ejemplo: canción)
const getFavoriteCount = async (req, res) => {
    const { favoriteId } = req.params;  // Recibimos el ID y tipo del favorito
  
    try {
      const count = await favoriteService.countFavorites(favoriteId);  // Llamamos al servicio
      res.status(200).json({ count });  // Respondemos con el número de "me gusta"
    } catch (err) {
      res.status(500).json({ message: err.message });  // En caso de error, enviamos un mensaje
    }
  };
  

module.exports = { addFavorite, removeFavorite, getFavoritesByUser, getFavoriteCount };
