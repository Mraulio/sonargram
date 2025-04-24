import { useState, useCallback } from 'react';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from '../api/internal/followApi';

const useFollow = (token) => {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  // Seguir a un usuario
  const follow = useCallback(async (followedId) => {
    try {
      const data = await followUser(followedId, token);
      return data;
    } catch (err) {
      console.error('Error following user:', err);
      throw err;
    }
  }, [token]);

  // Dejar de seguir a un usuario
  const unfollow = useCallback(async (followedId) => {
    try {
      const data = await unfollowUser(followedId, token);
      return data;
    } catch (err) {
      console.error('Error unfollowing user:', err);
      throw err;
    }
  }, [token]);

  // Obtener seguidores de un usuario
  const fetchFollowers = useCallback(async (userId) => {
    try {
      const data = await getFollowers(userId, token);
      setFollowers(data);
    } catch (err) {
      console.error('Error fetching followers:', err);
    }
  }, [token]);

  // Obtener usuarios que sigue un usuario
  const fetchFollowing = useCallback(async (userId) => {
    try {
      const data = await getFollowing(userId, token);
      setFollowing(data);
    } catch (err) {
      console.error('Error fetching following:', err);
    }
  }, [token]);

  return {
    followers,
    following,
    follow,
    unfollow,
    fetchFollowers,
    fetchFollowing,
  };
};

export default useFollow;
