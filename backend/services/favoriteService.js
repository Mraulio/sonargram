const Favorite = require('../models/Favorite');

async function addFavorite(userId, favoriteId, favoriteType) {
  const exists = await Favorite.findOne({ user: userId, favoriteId, favoriteType });
  if (exists) throw new Error('Already favorited');

  const favorite = new Favorite({ user: userId, favoriteId, favoriteType });
  return await favorite.save();
}

async function removeFavorite(userId, favoriteId) {
    // Elimina el favorito solo para un usuario específico y un favoriteId
    const deleted = await Favorite.findOneAndDelete({ user: userId, favoriteId });
  
    if (!deleted) {
      throw new Error('Favorite not found');
    }
  
    return deleted;
  }
  
async function getFavorites(userId) {
  return await Favorite.find({ user: userId });
}

// Contar cuántos "me gusta" tiene un favorito específico (por ejemplo, una canción)
async function countFavorites(favoriteId) {
    try {
      const result = await Favorite.aggregate([
        {
          $match: { favoriteId } // Filtramos por favoriteId y favoriteType
        },
        {
          $group: { 
            _id: '$favoriteId',    // Agrupamos por favoriteId
            count: { $sum: 1 }      // Contamos cuántas veces aparece
          }
        }
      ]);
      
      if (result.length > 0) {
        return result[0].count;  // Devuelve la cantidad de veces que se repite
      } else {
        return 0;  // Si no hay favoritos, retorna 0
      }
    } catch (err) {
      throw new Error('Error al contar los favoritos');
    }
  }
  
module.exports = { addFavorite, removeFavorite, getFavorites, countFavorites };
