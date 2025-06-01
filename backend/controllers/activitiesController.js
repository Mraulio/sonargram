const Activity = require('../models/Activity');

const followService = require('../services/followService');

const getTimeline = async (req, res) => {
  const { userId } = req.user;
  const { page = 1, limit = 20 } = req.query;

  try {
    // 1. Obtener los documentos de follows donde el usuario es el seguidor
    const followDocs = await followService.getFollowing(userId);

    // 2. Extraer los IDs de los usuarios seguidos
    const followedUserIds = followDocs.map(doc => doc.followed._id.toString());

    // 3. Buscar las actividades de esos usuarios
    const activities = await Activity.find({ user: { $in: followedUserIds } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'username profilePic')
      .populate('list', 'name')
      .populate('activityRef')  // Esto es suficiente para que Mongoose detecte el modelo desde `targetType`


    res.status(200).json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener actividades de un usuario específico (para su perfil)
const getActivitiesByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const activities = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user', 'username avatar')
      .populate('list', 'name')
      .populate({
        path: 'activityRef',
        populate: { path: 'user', select: 'username' }
      });

    res.status(200).json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getTimeline,
  getActivitiesByUser
};
