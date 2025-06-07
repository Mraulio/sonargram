const { MusicBrainzApi } = require('musicbrainz-api');
const MBIDCache = require('../models/MBIDCache');

const musicBrainzApi = new MusicBrainzApi({
  appName: 'TuApp',
  appVersion: '1.0.0',
  appContactInfo: 'tuemail@ejemplo.com',
});

// Los tipos que manejas tú internamente
const VALID_TYPES = ['artist', 'album', 'song'];

// Mapea tus tipos a los tipos reales de MusicBrainz
function mapToMBZType(type) {
  if (type === 'album') return 'release-group';
  if (type === 'song') return 'recording';
  return type; // artist se mantiene igual
}

function extractNameFromResult(type, result) {
  if (!result) return 'Desconocido';
  switch (type) {
    case 'artist':
      return result.name || 'Desconocido';
    case 'song':
    case 'album':
      return result.title || 'Desconocido';
    default:
      return result.name || result.title || 'Desconocido';
  }
}

async function lookupByMBID(type, mbid) {
  if (!VALID_TYPES.includes(type)) {
    throw new Error('Tipo no válido. Usa artist, album o song.');
  }
  console.log(`!!!=!=!=!==!Buscando ${type} con MBID: ${mbid}`);
  // 1. Buscar en caché (usamos el tipo lógico, no el de MBZ)
  const cached = await MBIDCache.findOne({ mbid, type });
  if (cached) {
    if(type === 'album'){
    console.log(`!!!!!Encontrado en caché: ${type} ${mbid}`);
    console.log('CACHED DATA:', cached);}
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
  console.log(`!!!!!NOOOOOO encontrado en caché: ${type} ${mbid}`);
  // 2. Buscar en MusicBrainz con el tipo real
  const mbzType = mapToMBZType(type);

  try {
    console.log(`!!!!!!Buscando ${mbzType} con MBID: ${mbid}`);
    const result = await musicBrainzApi.lookup(mbzType, mbid);
    console.log('RESULT!!!!', result);

    const name = extractNameFromResult(type, result);

    const cacheEntry = {
      mbid,
      type, // guardamos el tipo lógico (song, album, artist)
      title: name,
    };

    if (type === 'song') {
      cacheEntry.duration = result.length;
      if (result['artist-credit']?.length > 0) {
        cacheEntry.artistName = result['artist-credit'][0].name;
      }
    }

    if (type === 'album') {
      if (result['artist-credit']?.length > 0) {
        cacheEntry.artistName = result['artist-credit'][0].name;
      }
      if (result.date) {
        cacheEntry.releaseDate = result.date;
      }
    }

    // Guardar en caché
    await MBIDCache.create(cacheEntry);

    return cacheEntry;
  } catch (error) {
    console.error(`Error al buscar ${mbzType} ${mbid}: ${error.message}`);
    throw error;
  }
}

module.exports = { lookupByMBID };
