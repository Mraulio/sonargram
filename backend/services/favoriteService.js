const Favorite = require('../models/Favorite');
const { lookupByMBID } = require('./musicBrainzService');

async function addFavorite(userId, favoriteId, favoriteType) {
  const exists = await Favorite.findOne({ user: userId, favoriteId, favoriteType });
  if (exists) throw new Error('Already favorited');

  const favorite = new Favorite({ user: userId, favoriteId, favoriteType });
  return await favorite.save();
}

async function removeFavorite(userId, favoriteId) {
  const deleted = await Favorite.findOneAndDelete({ user: userId, favoriteId });
  if (!deleted) throw new Error('Favorite not found');
  return deleted;
}

async function getFavorites(userId) {
  return await Favorite.find({ user: userId });
}

async function countFavorites(favoriteId) {
  const result = await Favorite.aggregate([
    { $match: { favoriteId } },
    {
      $group: {
        _id: '$favoriteId',
        count: { $sum: 1 }
      }
    }
  ]);

  return result.length > 0 ? result[0].count : 0;
}

async function getTopFavoritesByType(limitPerType = 5) {
  const pipeline = [
    {
      $group: {
        _id: { favoriteId: "$favoriteId", favoriteType: "$favoriteType" },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
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

  for (const typeGroup of result) {
  typeGroup.favorites = await Promise.all(
    typeGroup.favorites.map(async (fav) => {
      try {
        fav.data = await lookupByMBID(typeGroup._id, fav.favoriteId);
      } catch (error) {
        console.error(`Error MB: ${error.message}`);
        fav.data = null;
      }
      return fav;
    })
  );
}


  return result;
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
  countFavorites,
  getTopFavoritesByType
};
