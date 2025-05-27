const mongoose = require('mongoose');

const mbidCacheSchema = new mongoose.Schema({
  mbid: { type: String, required: true, unique: true },
  type: { type: String, required: true }, // e.g. 'artist', 'recording', etc.
  name: { type: String, required: true }, // el nombre a mostrar
  data: { type: Object }, // opcional: el objeto completo por si lo necesitas
  cachedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MBIDCache', mbidCacheSchema);
