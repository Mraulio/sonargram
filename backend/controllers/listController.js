const List = require('../models/List');
const { deleteFollowersByList } = require('./listFollowerController');

// Crear lista
const createList = async (req, res) => {
  try {
    const nueva = new List({
      ...req.body,
      creator: req.user.userId  // Asegúrate de usar middleware auth
    });
    const guardada = await nueva.save();
    res.status(201).json(guardada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Obtener todas las listas (Admin)
const getLists = async (req, res) => {
  const listas = await List.find().populate('creator');
  res.json(listas);
};

// Obtener listas de un usuario específico
const getListsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const listas = await List.find({ creator: userId });
    res.json(listas);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Obtener una lista específica por su ID
const getListById = async (req, res) => {
  const { listId } = req.params;

  try {
    const list = await List.findById(listId).populate('creator');
    if (!list) return res.status(404).json({ message: 'List not found' });

    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Añadir canción a la lista (solo creador o admin)
const addSongToList = async (req, res) => {
  const { listId } = req.params;
  const { musicbrainzId } = req.body;
  const { userId, role } = req.user;

  try {
    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ message: 'List not found' });

    if (list.creator.toString() !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const alreadyAdded = list.songs.some(song => song.musicbrainzId === musicbrainzId);
    if (alreadyAdded) {
      return res.status(400).json({ message: 'Song already in list' });
    }

    list.songs.push({ musicbrainzId });
    await list.save();
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Eliminar canción de la lista (solo creador o admin)
const removeSongFromList = async (req, res) => {
  const { listId, musicbrainzId } = req.params;
  const { userId, role } = req.user;

  try {
    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ message: 'List not found' });

    if (list.creator.toString() !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    list.songs = list.songs.filter(song => song.musicbrainzId !== musicbrainzId);
    await list.save();

    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Modificar nombre de lista
const updateListName = async (req, res) => {
  const { listId } = req.params;
  const { name } = req.body;
  const { userId, role } = req.user;
  console.log('listId:', listId);
  console.log('newName:', newName);
  try {
    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ message: 'List not found' });

    if (list.creator.toString() !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'List name must not be empty' });
    }

    list.name = name;
    await list.save();

    res.status(200).json(list);
  } catch (err) {
    
    res.status(500).json({ error: err.message });
  }
};

// Eliminar lista
const deleteList = async (req, res) => {
  const { listId } = req.params;
  const { userId, role } = req.user;

  try {
    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ message: 'List not found' });

    if (list.creator.toString() !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await List.findByIdAndDelete(listId);
    await deleteFollowersByList(listId); // Limpieza de seguidores
    res.status(200).json({ message: 'List deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createList,
  getLists,
  getListsByUser,
  getListById,
  addSongToList,
  removeSongFromList,
  updateListName,
  deleteList
};
