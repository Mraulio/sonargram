const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  canciones: [String], // IDs de canciones (musicbrainz)
  creador: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  seguidores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('List', ListSchema);
