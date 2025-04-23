const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    validate: {
      validator: function(value) {
        return value.trim().length > 0;  // Verifica que el nombre no esté vacío
      },
      message: 'Name must be at least 1 character long and cannot be empty.'
    }
  }, 
  songs: [
    {
      musicbrainzId: { type: String, required: true },
      addedAt: { type: Date, default: Date.now }
    }
  ],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true
});

module.exports = mongoose.model('List', ListSchema);
