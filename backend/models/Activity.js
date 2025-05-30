const mongoose = require('mongoose');
const { Schema } = mongoose;

const activitySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { 
    type: String, 
    required: true, 
    enum: ['favorite', 'comment', 'rate', 'followUser', 'followList', 'createList', 'recommendComment'] 
  },
  targetType: { 
    type: String, 
    required: true, 
    enum: ['Song', 'Album', 'Artist', 'User', 'List', 'Comment'] 
  },
  targetId: { 
    type: Schema.Types.Mixed,  // Puede ser string (ID externo) o ObjectId
    required: true
  },
  activityRef: { // para referenciar el documento Mongo si aplica (comment, list, follow...)
    type: Schema.Types.ObjectId,
    refPath: 'targetType',
    required: false
  },
  createdAt: { type: Date, default: Date.now }
});
