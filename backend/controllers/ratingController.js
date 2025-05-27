const Rating = require('../models/Rating.js');
const ratingService = require('../services/ratingService.js');

const rateItem = async (req, res) => {
  const { mbid, type, rating } = req.body;
  const { userId } = req.user;

  if (!mbid || !type || !rating) {
    return res.status(400).json({ message: 'Missing data' });
  }

  try {
    const updated = await Rating.findOneAndUpdate(
      { userId, mbid, type },
      { rating },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({ message: 'Rating saved', rating: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
};

const getRatingsByUser = async (req, res) => {
  const { userId } = req.user;
  try {
    const ratings = await Rating.find({ userId });
    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ratings' });
  }
};

// ✅ ACTUALIZADO
const getRatingsByMbids = async (req, res) => {
  const { mbids } = req.query;
  const { userId } = req.user;

  if (!mbids) {
    return res.status(400).json({ message: 'Missing mbids in query' });
  }

  const mbidArray = mbids.split(',');

  try {
    const allRatings = await Rating.find({ mbid: { $in: mbidArray } });

    const result = {};
    for (const mbid of mbidArray) {
      const itemRatings = allRatings.filter(r => r.mbid === mbid);
      const count = itemRatings.length;
      const average = count
        ? itemRatings.reduce((sum, r) => sum + r.rating, 0) / count
        : null;

      const userRatingDoc = itemRatings.find(r => r.userId.toString() === userId);

      result[mbid] = {
        average,
        count,
        userRating: userRatingDoc?.rating ?? null,
        type: userRatingDoc?.type ?? null, // ✅ NECESARIO PARA EL FRONTEND
      };
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching ratings' });
  }
};

const deleteRating = async (req, res) => {
  const { mbid } = req.params;
  const { userId } = req.user;

  if (!mbid) {
    return res.status(400).json({ message: 'Missing mbid or type' });
  }

  try {
    const result = await Rating.findOneAndDelete({ userId, mbid });

    if (!result) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    res.status(200).json({ message: 'Rating deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTopRatings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const topRatings = await ratingService.getTopRatingsByType(limit);
    res.status(200).json(topRatings);
  } catch (err) {
    console.error('Error in getTopRatings:', err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  rateItem,
  getRatingsByUser,
  deleteRating,
  getRatingsByMbids,
  getTopRatings,
};
