import { useState, useCallback } from 'react';
import * as api from '../api/internal/userApi';


export default function useUsers(token) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllUsers(token);
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  }, [token]);
  

  const deleteUser = async (userId) => {
    try {
      
      await api.deleteUser(userId, token);
      setUsers(prev => prev.filter(user => user._id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message);
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const updated = await api.updateUser(userId, userData, token);
      setUsers(prev =>
        prev.map(user => (user._id === userId ? updated : user))
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getCurrentUser = useCallback(async () => {    try {
      const user = await api.getCurrentUser(token);
      return user;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [token]);
  
  const getUserById = async (id) => {
    try {
      const user = await api.getUserById(id, token);
      return user;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const getUserByEmail = async (email) => {
    try {
      const user = await api.getUserByEmail(email, token);
      return user;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const uploadProfilePic = async (formData) => {
    try {
      const response = await api.uploadProfilePic(formData, token);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteProfilePic = async () => {
    try {
      const response = await api.deleteProfilePic( token);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    fetchAllUsers,
    getCurrentUser,
    deleteUser,
    updateUser,
    getUserById,
    getUserByEmail,
    uploadProfilePic,
    deleteProfilePic,
  };
}
