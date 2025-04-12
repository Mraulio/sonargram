const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
  name: { type: String, required: true },
  songs: [String], // IDs de canciones (musicbrainz)
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('List', ListSchema);
