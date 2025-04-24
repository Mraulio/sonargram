const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentRecommendationSchema = new Schema({
  commentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Comment',  // Relacionado con el modelo Comment
    required: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',  // Relacionado con el modelo User
    required: true 
  }
});

commentRecommendationSchema.index({ commentId: 1, userId: 1 }, { unique: true });

const CommentRecommendation = mongoose.model('CommentRecommendation', commentRecommendationSchema);

module.exports = CommentRecommendation;
