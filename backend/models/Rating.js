// models/Rating.js
const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mbid: { // MusicBrainz ID
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['artist', 'album', 'song'],
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
}, { timestamps: true });

ratingSchema.index({ userId: 1, mbid: 1, type: 1 }, { unique: true }); // evitar duplicados

module.exports =  mongoose.model('Rating', ratingSchema);
