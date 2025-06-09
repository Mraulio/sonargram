import { useState, useCallback } from 'react';
import * as listaApi from '../api/internal/listApi';

export default function useList(token) {
  const [lists, setLists] = useState([]);
  const [userLists, setUserLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todas las listas (admin)
  const fetchAllLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listaApi.getAllLists(token);
      setLists(data);
    } catch (err) {
      setError(err.message || 'Error fetching all lists');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Obtener listas de un usuario
  const fetchListsByUser = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listaApi.getListsByUser(userId, token);
      setUserLists(data);
    } catch (err) {
      setError(err.message || 'Error fetching user lists');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Crear lista
  const createNewList = async (listData) => {
    try {
      const newList = await listaApi.createList(listData, token);
      setLists(prev => [...prev, newList]);
      return newList;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Eliminar lista
  const removeList = async (listId) => {
    try {
      await listaApi.deleteList(listId, token);
      setLists(prev => prev.filter(list => list._id !== listId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Actualizar nombre de lista
  const renameList = async (listId, newName) => {
    try {
      const updatedList = await listaApi.updateListName(listId, newName, token);
      setLists(prev =>
        prev.map(list => (list._id === listId ? updatedList : list))
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Añadir canción a una lista
  const addSong = async (listId, musicbrainzId, title, artistName, coverUrl, releaseDate, duration) => {
    try {
      return await listaApi.addSongToList(listId, musicbrainzId, title, artistName, coverUrl, releaseDate, duration, token);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Eliminar canción de una lista
  const removeSong = async (listId, musicbrainzId) => {
    try {
      return await listaApi.removeSongFromList(listId, musicbrainzId, token);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Obtener una lista por ID (no cambia el array global, útil en detalle)
  const fetchListById = async (listId) => {
    try {
      return await listaApi.getListById(listId, token);
    } catch (err) {
      setError(err.message);
      return null;
    }
    
  };

  const fetchMostFollowedLists = useCallback(async (limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listaApi.getMostFollowedLists(token, limit);
      return data;
    } catch (err) {
      setError(err.message || 'Error fetching most followed lists');
    } finally {
      setLoading(false);
    }
  }, [token]);


  return {
    lists,
    userLists,
    loading,
    error,
    fetchAllLists,
    fetchListsByUser,
    createNewList,
    removeList,
    renameList,
    addSong,
    removeSong,
    fetchListById,
    fetchMostFollowedLists
  };
}
