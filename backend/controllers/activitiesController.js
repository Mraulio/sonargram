const Activity = require("../models/Activity");
const MBIDCache = require("../models/MBIDCache");
const Rating = require("../models/Rating");

const followService = require("../services/followService");

const getTimeline = async (req, res) => {
  const { userId } = req.user;
  const { page = 1, limit = 20 } = req.query;

  try {
    // Obtienes los usuarios seguidos
    const followDocs = await followService.getFollowing(userId);
    const followedUserIds = followDocs.map((doc) =>
      doc.followed._id.toString()
    );

    // Obtienes las actividades
    const activities = await Activity.find({ user: { $in: followedUserIds } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("user", "username profilePic")
      .populate("list", "name")
      .populate("activityRef"); // para User, List, Comment

    // Si no hay actividades, retorna un array vacío
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        const enriched = activity.toObject();

        // Si el target es externo (MBID), intenta traer los datos cacheados
        if (["song", "album", "artist"].includes(activity.targetType)) {
          const mbidDoc = await MBIDCache.findOne({ mbid: activity.targetId });
          enriched.mbidData = mbidDoc ? mbidDoc.toObject() : null;
        }

        // Si es una calificación, busca la puntuación del usuario para ese target
        if (activity.action === "rate") {
          const rating = await Rating.findOne({
            userId: activity.user._id,
            mbid: activity.targetId, // Asegúrate que sea string
            type: activity.targetType.toLowerCase(),
          }).lean();

          enriched.rating = rating?.rating || null;
        }

        return enriched;
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
      .populate("user", "username avatar")
      .populate("list", "name")
      .populate({
        path: "activityRef",
        populate: { path: "user", select: "username" },
      });

    res.status(200).json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getTimeline,
  getActivitiesByUser,
};
