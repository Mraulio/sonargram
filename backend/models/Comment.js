const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    targetId: { type: Schema.Types.ObjectId, required: true }, // El ID del contenido (canción, álbum, etc.)
    targetType: { type: String, enum: ['song', 'album', 'artist'], required: true }, // Especifica el tipo de contenido para filtrar comentarios de usuario
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now },
  });
  
  const Comment = mongoose.model('Comment', commentSchema);

  module.exports = Comment;
  