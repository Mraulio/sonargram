import { useState, useCallback } from 'react';
import {
  addComment,
  deleteComment,
  getCommentsByUser,
  getCommentsByTarget,
  addRecommendation,
  deleteRecommendation,
  getRecommendations
} from '../api/internal/commentApi';
import useAuth from './useAuth';

const useComments = () => {
  const { token, user } = useAuth(); // ahora se obtiene internamente
  const userId = user?.id;
  const [comments, setComments] = useState([]);
  const [recommendations, setRecommendations] = useState({}); // por commentId

  const fetchCommentsByTarget = useCallback(async (targetId) => {
    try {
      const data = await getCommentsByTarget(targetId, token);
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments by target:', err);
    }
  }, [token]);

  const fetchCommentsByUser = useCallback(async (targetType = null) => {
    try {
      const data = await getCommentsByUser(userId, token, targetType);
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments by user:', err);
    }
  }, [userId, token]);

  const submitComment = useCallback(async (targetId, targetType, comment, title, artistName, coverUrl, releaseDate, duration) => {
    try {
      const newComment = await addComment(targetId, targetType, comment, title, artistName, coverUrl, releaseDate, duration, token);
      setComments((prev) => [...prev, newComment]);
      return newComment;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  }, [token]);

  const removeComment = useCallback(async (commentId) => {
    try {
      await deleteComment(commentId, token);
      setComments((prev) => prev.filter(c => c._id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      throw err;
    }
  }, [token]);

  const recommendComment = useCallback(async (commentId) => {
    try {
      const result = await addRecommendation(commentId, userId, token);
      return result;
    } catch (err) {
      console.error('Error recommending comment:', err);
    }
  }, [userId, token]);

  const unrecommendComment = useCallback(async (commentId) => {
    try {
      const result = await deleteRecommendation(commentId, userId, token);
      return result;
    } catch (err) {
      console.error('Error deleting recommendation:', err);
    }
  }, [userId, token]);

  const fetchRecommendations = useCallback(async (commentId) => {
    try {
      const data = await getRecommendations(commentId, token);
      setRecommendations((prev) => ({ ...prev, [commentId]: data }));
      return data;
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  }, [token]);

  return {
    comments,
    recommendations,
    fetchCommentsByTarget,
    fetchCommentsByUser,
    submitComment,
    removeComment,
    recommendComment,
    unrecommendComment,
    fetchRecommendations,
  };
};

export default useComments;
