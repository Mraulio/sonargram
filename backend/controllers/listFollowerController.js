const ListFollower = require('../models/ListFollower');
const List = require('../models/List');

// Seguir una lista
const followList = async (req, res) => {
  const { listId } = req.params;
  const userId = req.user.userId;

  try {
    // Verificar que la lista exista
    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ message: 'List not found' });

    // Verificar si ya la sigue
    const alreadyFollowing = await ListFollower.findOne({ list: listId, user: userId });
    if (alreadyFollowing) {
      return res.status(400).json({ message: 'You already follow this list' });
    }

    const newFollow = new ListFollower({ list: listId, user: userId });
    await newFollow.save();
    res.status(201).json({ message: 'List followed' });
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
  getFollowersCount
};
