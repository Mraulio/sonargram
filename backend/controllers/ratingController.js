// controllers/ratingController.js
const Rating = require ('../models/Rating.js');

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
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true  }
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

// GET /ratings/:mbid
const getRatingsByItem = async (req, res) => {
    const { mbid } = req.params;
  
    try {
      const ratings = await Rating.find({ mbid });
      res.status(200).json(ratings);
    } catch (error) {
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

  module.exports = {
    rateItem,
    getRatingsByUser,
    getRatingsByItem,
    deleteRating
  }
  
