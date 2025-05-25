// services/musicbrainzService.js
const axios = require('axios');
const MB_BASE_URL = 'https://musicbrainz.org/ws/2';
const VALID_TYPES = ['artist', 'release-group', 'recording'];
function mapFavoriteType(type) {
  if (type === 'album') return 'release-group';
  if (type === 'song') return 'recording';
  return type;
}

async function lookupByMBID(type, mbid) {
      const mappedType = mapFavoriteType(type);

  if (!VALID_TYPES.includes(mappedType)) {
    throw new Error('Tipo no válido. Usa artist, release-group o recording.');
  }

  const response = await axios.get(`${MB_BASE_URL}/${mappedType}/${mbid}`, {
    params: { fmt: 'json' },
    headers: {
      'User-Agent': 'TuApp/1.0.0 (tuemail@ejemplo.com)',
    },
  });

  return response.data;
}

module.exports = { lookupByMBID };
