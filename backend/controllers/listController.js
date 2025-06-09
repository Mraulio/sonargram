const List = require('../models/List');
const MBIDCache = require('../models/MBIDCache');
const { deleteFollowersByList } = require('./listFollowerController');
const logActivity = require('../utils/logActivity');

// Función de utilidad para enriquecer las canciones de una lista
const enrichListSongs = async (list) => {
  const enrichedSongs = await Promise.all(
    list.songs.map(async (song) => {
      const cache = await MBIDCache.findOne({ mbid: song.musicbrainzId });
      return {
        ...song.toObject(),
        title: cache?.title || null,
        artistName: cache?.artistName || null,
        coverUrl: cache?.coverUrl || null,
        releaseDate: cache?.releaseDate || null,
        duration: cache?.duration || null,
      };
    })
  );
  return {
    ...list.toObject(),
    songs: enrichedSongs
  };
};

// Crear lista
const createList = async (req, res) => {
  try {
    const userId = req.user.userId;
    const nueva = new List({
      ...req.body,
      creator: userId
    });
    const guardada = await nueva.save();

    await logActivity({
      user: userId,
      action: 'createList',
      targetType: 'List',
      targetId: guardada.id,
    });

    res.status(201).json(guardada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Obtener todas las listas
const getLists = async (req, res) => {
  try {
    const listas = await List.find().populate('creator');
    res.json(listas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener listas de un usuario específico
const getListsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const listas = await List.find({ creator: userId });
    const enriched = await Promise.all(listas.map(enrichListSongs));
    res.json(enriched);
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

    const enriched = await enrichListSongs(list);
    res.status(200).json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Añadir canción a la lista
const addSongToList = async (req, res) => {
  const { listId } = req.params;
  const { musicbrainzId, title, artistName, coverUrl, releaseDate, duration } = req.body;
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

    await logActivity({
      user: userId,
      action: 'addListSong',
      targetType: 'song',
      targetId: musicbrainzId,
      listId: listId,
      metadata: {
        title,
        artistName,
        coverUrl,
        releaseDate,
        duration,
      }
    });

    await list.save();
    const enriched = await enrichListSongs(list);
    res.status(200).json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Eliminar canción de la lista
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

    const enriched = await enrichListSongs(list);
    res.status(200).json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Modificar nombre de lista
const updateListName = async (req, res) => {
  const { listId } = req.params;
  const { name } = req.body;
  const { userId, role } = req.user;

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

    const enriched = await enrichListSongs(list);
    res.status(200).json(enriched);
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
    await deleteFollowersByList(listId);
    res.status(200).json({ message: 'List deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener listas más seguidas
const getMostFollowedLists = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  try {
    const lists = await List.aggregate([
      {
        $lookup: {
          from: 'listfollowers',
          localField: '_id',
          foreignField: 'list',
          as: 'followers'
        }
      },
      {
        $addFields: {
          followersCount: { $size: '$followers' }
        }
      },
      {
        $sort: { followersCount: -1 }
      },
      {
        $limit: limit
      }
    ]);

    res.status(200).json(lists);
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
  deleteList,
  getMostFollowedLists
};
