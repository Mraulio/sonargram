const mongoose = require('mongoose');

const LoginEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  ip: { type: String },
  userAgent: { type: String }
});

module.exports = mongoose.model('LoginEvent', LoginEventSchema);
