const Activity = require('../models/Activity');
const MBIDCache = require('../models/MBIDCache'); // si usas caching MB

async function logActivity({ user, action, targetType, targetId, metadata = {} }) {
  try {
    // Si el targetType es de MB (song, album, artist), cacheamos nombre si no existe
    if (['song', 'album', 'artist'].includes(targetType)) {
      const exists = await MBIDCache.findOne({ mbid: targetId });
      if (!exists && metadata.name) {
        await MBIDCache.create({
          mbid: targetId,
          type: targetType,
          name: metadata.name
        });
      }
    }

    // Crear el activity
    await Activity.create({
      user,
      action,
      targetType,
      targetId,
      metadata
    });
  } catch (err) {
    console.error('Error logging activity:', err);
  }
}

module.exports = logActivity;
