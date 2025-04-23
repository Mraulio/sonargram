const mongoose = require('mongoose');

const ListFollowerSchema = new mongoose.Schema({
  list: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  followedAt: { type: Date, default: Date.now }
});

ListFollowerSchema.index({ list: 1, user: 1 }, { unique: true }); // Un mismo user no puede seguir la misma lista dos veces

module.exports = mongoose.model('ListFollower', ListFollowerSchema);
