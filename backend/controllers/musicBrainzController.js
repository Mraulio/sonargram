// controllers/musicbrainzController.js

const { lookupByMBID } = require("../services/musicBrainzService");

const lookupByMBIDController = async (req, res) => {
  const { type, mbid } = req.params;

  try {
    const data = await lookupByMBID(type, mbid);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { lookupByMBIDController };
