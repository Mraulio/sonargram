const ListFollower = require('../models/ListFollower');
const List = require('../models/List');

// Seguir una lista
const followList = async (req, res) => {
  const { listId } = req.params;
  const userId = req.user.userId;  // Aquí asumimos que 'req.user' tiene el ID del usuario en '_id' (esto puede cambiar dependiendo de tu implementación)

  try {
    // Verificar que la lista exista
    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ message: 'List not found' });

    // Verificar que el usuario no intente seguir su propia lista
    if (list.creator.toString() === userId.toString()) {
      return res.status(400).json({ message: 'You cannot follow your own list' });
    }

    // Verificar si el usuario ya está siguiendo la lista
    const alreadyFollowing = await ListFollower.findOne({ list: listId, user: userId });
    if (alreadyFollowing) {
      return res.status(400).json({ message: 'You already follow this list' });
    }

    // Crear la relación de seguimiento
    const newFollow = new ListFollower({ list: listId, user: userId });
    await newFollow.save();

    res.status(201).json({ message: 'List followed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Dejar de seguir una lista
const unfollowList = async (req, res) => {
  const { listId } = req.params;
  const userId = req.user.userId;

  try {
    const result = await ListFollower.findOneAndDelete({ list: listId, user: userId });

    if (!result) {
      return res.status(404).json({ message: 'You do not follow this list' });
    }

    res.status(200).json({ message: 'Unfollowed the list' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Borrar seguidores al eliminar lista (puede llamarse desde el controller de List)
const deleteFollowersByList = async (listId) => {
  try {
    await ListFollower.deleteMany({ list: listId });
  } catch (err) {
    console.error('Error deleting list followers:', err.message);
  }
};

// Obtener los seguidores de una lista
const getFollowersOfList = async (req, res) => {
    const { listId } = req.params;
  
    try {
      const followers = await ListFollower.find({ list: listId }).populate('user', 'username name');
      res.status(200).json(followers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

// Obtener todas las listas que sigue un usuario
const getListsFollowedByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Buscar todos los registros de listas que sigue este usuario
    const followedLists = await ListFollower.find({ user: userId }).populate('list');

    // Si no se encuentran registros, devolver un mensaje adecuado
    if (followedLists.length === 0) {
      return res.status(404).json({ message: 'This user does not follow any lists' });
    }

    // Solo devolver las listas, sin los detalles del seguidor
    const lists = followedLists.map(follow => follow.list);
    res.status(200).json(lists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getFollowersCount = async (req, res) => {
  const { listId } = req.params;

  try {
      const count = await ListFollower.countDocuments({ list: listId });
      res.status(200).json({ listId, followers: count });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};
  
  

module.exports = {
  followList,
  unfollowList,
  deleteFollowersByList,
  getFollowersOfList,
  getFollowersCount,
  getListsFollowedByUser
};
