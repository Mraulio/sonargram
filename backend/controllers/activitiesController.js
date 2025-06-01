const Activity = require('../models/Activity');
const MBIDCache = require('../models/MBIDCache');

const followService = require('../services/followService');


const getTimeline = async (req, res) => {
  const { userId } = req.user;
  const { page = 1, limit = 20 } = req.query;

  try {
    // Obtienes los usuarios seguidos
    const followDocs = await followService.getFollowing(userId);
    const followedUserIds = followDocs.map(doc => doc.followed._id.toString());

    // Obtienes las actividades
    const activities = await Activity.find({ user: { $in: followedUserIds } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'username profilePic')
      .populate('list', 'name')
      .populate('activityRef');  // para User, List, Comment

    // Para cada actividad que es de MusicBrainz, traemos datos del cache
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        if (['song', 'album', 'artist'].includes(activity.targetType)) {
          const mbidDoc = await MBIDCache.findOne({ mbid: activity.targetId });
          return {
            ...activity.toObject(),
            mbidData: mbidDoc ? mbidDoc.toObject() : null,
          };
        }
        return activity;
      })
    );

    res.status(200).json(enrichedActivities);
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
