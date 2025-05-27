const { MusicBrainzApi } = require('musicbrainz-api');
const MBIDCache = require('../models/MBIDCache'); // asegúrate de que exista
const musicBrainzApi = new MusicBrainzApi({
  appName: 'TuApp',
  appVersion: '1.0.0',
  appContactInfo: 'tuemail@ejemplo.com',
});

const VALID_TYPES = ['artist', 'release-group', 'recording'];

function mapFavoriteType(type) {
  if (type === 'album') return 'release-group';
  if (type === 'song') return 'recording';
  return type;
}

function extractNameFromResult(type, result) {
  switch (type) {
    case 'artist':
      return result.name;
    case 'recording':
      return result.title;
    case 'release-group':
      return result.title;
    default:
      return result.name || result.title || 'Desconocido';
  }
}

async function lookupByMBID(type, mbid) {
  const mappedType = mapFavoriteType(type);

  if (!VALID_TYPES.includes(mappedType)) {
    throw new Error('Tipo no válido. Usa artist, album o song.');
  }

  // 1. Buscar en caché
  const cached = await MBIDCache.findOne({ mbid, type: mappedType });
  if (cached) {
    return {
      name: cached.name,
      type: cached.type,
      ...cached.data,
    };
  }

  // 2. Si no está en caché, hacer llamada a MusicBrainz
  try {
    const result = await musicBrainzApi.lookup(mappedType, mbid);
    const name = extractNameFromResult(mappedType, result);

    await MBIDCache.create({
      mbid,
      type: mappedType,
      name,
      data: result,
    });

    return { name, type: mappedType, ...result };
  } catch (error) {
    console.error(`Error al buscar ${mappedType} ${mbid}: ${error.message}`);
    throw error;
  }
}

module.exports = { lookupByMBID };
