const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    favoriteId: { type: String, required: true }, // ID de MusicBrainz
    favoriteType: { type: String, enum: ['song', 'album', 'artist'], required: true },
    createdAt: { type: Date, default: Date.now }
  },
  {
    // Agregar un índice compuesto para asegurar que no haya duplicados por userId y favoriteId
    indexes: [
      {
        fields: { user: 1, favoriteId: 1 },
        options: { unique: true }  // Hace que la combinación de user y favoriteId sea única
      }
    ]
  }
);

module.exports = mongoose.model('Favorite', favoriteSchema);
