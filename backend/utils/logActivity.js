const Activity = require('../models/Activity');
const MBIDCache = require('../models/MBIDCache');

async function logActivity({ user, action, targetType, targetId, metadata = {} }) {
  try {
    // Si el targetType es de MB (song, album, artist), cacheamos si no existe
    if (['song', 'album', 'artist'].includes(targetType)) {
      const exists = await MBIDCache.findOne({ mbid: targetId });
      if (!exists) {
        await MBIDCache.create({
          mbid: targetId,
          type: targetType,
          title: metadata.title,
          artistName: metadata.artistName || undefined,
          coverUrl: metadata.coverUrl || undefined,
          releaseDate: metadata.releaseDate || undefined,
          duration: metadata.duration || undefined,
        });
      }
    }

    // Crear la actividad
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
