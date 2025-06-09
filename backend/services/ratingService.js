const Rating = require('../models/Rating');
const { lookupByMBID } = require('./musicBrainzService');

async function getTopRatingsByType(limitPerType = 5) {
  const pipeline = [
    {
      $group: {
        _id: { mbid: "$mbid", type: "$type" },
        average: { $avg: "$rating" },
        count: { $sum: 1 },
      }
    },
    { $sort: { average: -1, count: -1 } },
    {
      $group: {
        _id: "$_id.type",
        ratings: {
          $push: {
            mbid: "$_id.mbid",
            average: "$average",
            count: "$count"
          }
        }
      }
    },
    {
      $project: {
        ratings: { $slice: ["$ratings", limitPerType] }
      }
    }
  ];

  const result = await Rating.aggregate(pipeline);

  for (const typeGroup of result) {
    typeGroup.ratings = await Promise.all(
      typeGroup.ratings.map(async (item) => {
        try {
          const info = await lookupByMBID(typeGroup._id, item.mbid);
          //console.log(`!!!!!!!Lookup MBID ${item.mbid} for type ${typeGroup._id}:`, info);
          return { ...item, ...info };  // 🔁 Combinar todo en un solo objeto
        } catch (err) {
          console.error(`Error en lookup MBID ${item.mbid}: ${err.message}`);
          return { ...item, error: true };
        }
      })
    );
  }

  return result;
}


module.exports = {
  getTopRatingsByType,
};
