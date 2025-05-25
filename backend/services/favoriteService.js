const Favorite = require('../models/Favorite');
const { lookupByMBID } = require('./musicBrainzService');

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


async function getTopFavoritesByType(limitPerType = 5) {
  const pipeline = [
    {
      $group: {
        _id: { favoriteId: "$favoriteId", favoriteType: "$favoriteType" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $group: {
        _id: "$_id.favoriteType",
        favorites: {
          $push: {
            favoriteId: "$_id.favoriteId",
            count: "$count"
          }
        }
      }
    },
    {
      $project: {
        favorites: { $slice: ["$favorites", limitPerType] }
      }
    }
  ];

  const result = await Favorite.aggregate(pipeline);
  // El resultado es un array con objetos por tipo, ej:
  // [
  //   { _id: "song", favorites: [{favoriteId, count}, ...] },
  //   { _id: "album", favorites: [...] },
  //   { _id: "artist", favorites: [...] }
  // ]

  for (const typeGroup of result) {
  for (const fav of typeGroup.favorites) {
    try {
      await delay(300); // 200ms entre llamadas (~5 por segundo)
      fav.data = await lookupByMBID(typeGroup._id, fav.favoriteId);
    } catch (error) {
      console.error(`Error MB (${fav.favoriteId}): ${error.message}`);
      fav.data = null;
    }
  }
}

  return result;
}

  function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

module.exports = { addFavorite, removeFavorite, getFavorites, countFavorites, getTopFavoritesByType };
