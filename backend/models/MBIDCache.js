const mongoose = require('mongoose');

const mbidCacheSchema = new mongoose.Schema({
  mbid: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['artist', 'album', 'song',] // puedes añadir más tipos si quieres
  },
  title: { type: String, required: true }, // nombre o título genérico (artista, canción, álbum)
  artistName: { type: String }, // opcional, útil para álbum o canción
  coverUrl: { type: String }, // opcional, para portadas de álbum o canción
  releaseDate: {type: String},
  duration: {type: String},
  data: { type: Object }, // info completa en JSON, opcional
  cachedAt: { type: Date, default: Date.now, index: true }
});

// Opcional: índice TTL para que expire la caché a los X días (ej. 30 días)
// mbidCacheSchema.index({ cachedAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('MBIDCache', mbidCacheSchema);
