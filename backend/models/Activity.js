const mongoose = require('mongoose');
const { Schema } = mongoose;

const activitySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { 
    type: String, 
    required: true, 
    enum: ['favorite', 'comment', 'rate', 'followUser', 'followList', 'createList', 'addListSong', 'recommendComment'] 
  },
  targetType: { 
    type: String, 
    required: true, 
    enum: ['song', 'album', 'artist', 'user', 'list', 'comment'] 
  },
  targetId: { 
    type: Schema.Types.Mixed,  // Puede ser string (ID externo) o ObjectId
    required: true
  },
  list: {   // <-- Aquí agregas referencia a la lista (opcional)
    type: Schema.Types.ObjectId,
    ref: 'List',
    required: false
  },
  activityRef: { // para referenciar el documento Mongo si aplica (comment, list, follow...)
    type: Schema.Types.ObjectId,
    refPath: 'targetType',
    required: false
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);
