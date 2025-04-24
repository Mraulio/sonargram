import { useState, useCallback } from 'react';
import {
  followList,
  unfollowList,
  getFollowersOfList,
  getFollowersCount,
  getListsFollowedByUser,
} from '../api/internal/listFollowerApi';

const useListFollowers = (token) => {
  const [followers, setFollowers] = useState([]);
  const [followersCount, setFollowersCount] = useState({});
  const [followedLists, setFollowedLists] = useState([]);

  // Seguir una lista
  const follow = useCallback(async (listId) => {
    try {
      const data = await followList(listId, token);
      return data;
    } catch (err) {
      console.error('Error following list:', err);
      throw err;
    }
  }, [token]);

  // Dejar de seguir una lista
  const unfollow = useCallback(async (listId) => {
    try {
      const data = await unfollowList(listId, token);
      return data;
    } catch (err) {
      console.error('Error unfollowing list:', err);
      throw err;
    }
  }, [token]);

  // Obtener seguidores de una lista
  const fetchFollowers = useCallback(async (listId) => {
    try {
      const data = await getFollowersOfList(listId, token);
      setFollowers(data);
    } catch (err) {
      console.error('Error fetching followers of list:', err);
    }
  }, [token]);

  // Obtener número de seguidores de una lista
  const fetchFollowersCount = useCallback(async (listId) => {
    try {
      const count = await getFollowersCount(listId, token);
      setFollowersCount(prev => ({ ...prev, [listId]: count }));
    } catch (err) {
      console.error('Error fetching followers count:', err);
    }
  }, [token]);

  // Obtener listas seguidas por un usuario
  const fetchFollowedLists = useCallback(async (userId) => {
    try {
      const data = await getListsFollowedByUser(userId, token);
      setFollowedLists(data);
    } catch (err) {
      console.error('Error fetching followed lists:', err);
    }
  }, [token]);

  return {
    followers,
    followersCount,
    followedLists,
    follow,
    unfollow,
    fetchFollowers,
    fetchFollowersCount,
    fetchFollowedLists,
  };
};

export default useListFollowers;
