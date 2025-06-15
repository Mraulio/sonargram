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
    enum: [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5], // Valores permitidos para la valoración
  },
  
}, { timestamps: true });

ratingSchema.index({ userId: 1, mbid: 1, type: 1 }, { unique: true }); // evitar duplicados

module.exports =  mongoose.model('Rating', ratingSchema);
