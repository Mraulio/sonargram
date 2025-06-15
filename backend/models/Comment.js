const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    targetId: { type: String, required: true }, // El ID del contenido (canción, álbum, etc.)
    targetType: { type: String, enum: ['song', 'album', 'artist'], required: true }, // Especifica el tipo de contenido para filtrar comentarios de usuario
    comment: { 
      type: String, 
      required: true, 
      validate: {
        validator: function(value) {
          return value.trim().length > 0;  // Asegurarse de que el comentario no esté vacío ni tenga solo espacios
        },
        message: 'El comentario no puede estar vacío.'
      }
    },    
    date: { type: Date, default: Date.now },
  });

  commentSchema.index({ user: 1, targetId: 1 }, { unique: true });

  const Comment = mongoose.model('Comment', commentSchema);

  module.exports = Comment;
  