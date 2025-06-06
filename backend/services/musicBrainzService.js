const { MusicBrainzApi } = require('musicbrainz-api');
const MBIDCache = require('../models/MBIDCache');

const musicBrainzApi = new MusicBrainzApi({
  appName: 'TuApp',
  appVersion: '1.0.0',
  appContactInfo: 'tuemail@ejemplo.com',
});

const VALID_TYPES = ['artist', 'album', 'song'];

function mapFavoriteType(type) {
  if (type === 'album') return 'album';
  if (type === 'song') return 'song';
  return type;
}

function extractNameFromResult(type, result) {
  switch (type) {
    case 'artist':
      return result.name;
    case 'song':
    case 'album':
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
      mbid: cached.mbid,
      type: cached.type,
      title: cached.title,
      artistName: cached.artistName,
      coverUrl: cached.coverUrl,
      releaseDate: cached.releaseDate,
      duration: cached.duration,
    };
  }

  // 2. Si no está en caché, buscar en MusicBrainz
  try {
    const result = await musicBrainzApi.lookup(mappedType, mbid);
    const name = extractNameFromResult(mappedType, result);

    const cacheEntry = {
      mbid,
      type: mappedType,
      title: name,
    };

    // Rellenar campos opcionales si están disponibles
    if (mappedType === 'song') {
      cacheEntry.duration = result.length;
      if (result['artist-credit']?.length > 0) {
        cacheEntry.artistName = result['artist-credit'][0].name;
      }
    }

    if (mappedType === 'album' && result['artist-credit']?.length > 0) {
      cacheEntry.artistName = result['artist-credit'][0].name;
    }

    // Guardar en caché
    await MBIDCache.create(cacheEntry);

    return cacheEntry;
  } catch (error) {
    console.error(`Error al buscar ${mappedType} ${mbid}: ${error.message}`);
    throw error;
  }
}

module.exports = { lookupByMBID };
