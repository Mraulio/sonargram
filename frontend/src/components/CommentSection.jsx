import React, { useEffect, useState } from 'react';
import useComments from '../hooks/useComment';

const CommentSection = ({ token, targetId, targetType, userId, metadata }) => {
  const {
    comments,
    recommendations,
    fetchCommentsByTarget,
    submitComment,
    recommendComment,
    fetchRecommendations,
  } = useComments(token);

  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (targetId) {
      fetchCommentsByTarget(targetId);
    }
  }, [targetId, fetchCommentsByTarget]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      await submitComment(
        targetId,
        targetType,
        newComment,
        metadata?.title || '',
        metadata?.artistName || '',
        metadata?.coverUrl || '',
        metadata?.releaseDate || '',
        metadata?.duration || null
      );
      setNewComment('');
    } catch (error) {
      console.error('Error al publicar el comentario:', error);
      alert('Error al publicar el comentario.');
    }
  };

  const handleRecommend = async (commentId) => {
    try {
      await recommendComment(commentId, userId);
      await fetchRecommendations(commentId); // actualizar
    } catch (error) {
      alert('Error al recomendar.');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <h3 className="text-lg font-semibold mb-3">Comentarios</h3>

      <div className="mb-4">
        <textarea
          className="w-full border rounded p-2"
          rows={3}
          placeholder="Escribe tu comentario..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          onClick={handleSubmit}
        >
          Publicar
        </button>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment._id} className="border p-3 rounded shadow-sm">
            <p className="font-medium">{comment.user?.username || 'Usuario'}</p>
            <p className="text-sm text-gray-700">{comment.comment}</p>
            <div className="mt-2 text-sm flex items-center gap-3">
              <button
                className="text-blue-600 hover:underline"
                onClick={() => handleRecommend(comment._id)}
              >
                Recomendar
              </button>
              <span>
                {recommendations[comment._id]?.length || 0} recomendaciones
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
