const Activity = require('../models/Activity');
const MBIDCache = require('../models/MBIDCache');

// Mapeo de modelos internos de Mongo
const models = {
  User: require('../models/User'),
  List: require('../models/List'),
  Comment: require('../models/Comment'),
};

async function logActivity({ user, action, targetType, targetId, metadata = {}, listId }) {
  try {
    let activityRef = undefined;

    // Si el targetType es de MusicBrainz, cacheamos si no existe
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

    // Si el targetType es un modelo Mongo, buscamos el documento y lo referenciamos
    if (['User', 'List', 'Comment'].includes(targetType)) {
      const Model = models[targetType];
      if (Model) {
        const doc = await Model.findById(targetId);
        if (doc) {
          activityRef = doc._id;
        } else {
          console.warn(`No se encontró el documento de tipo ${targetType} con ID ${targetId}`);
        }
      }
    }
    // Crear la actividad
    await Activity.create({
      user,
      action,
      targetType,
      targetId,
      metadata,
      list: listId,
      activityRef
    });
  } catch (err) {
    console.error('Error logging activity:', err);
  }
}

module.exports = logActivity;
