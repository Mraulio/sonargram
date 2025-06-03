export async function getArtistImageByMBID(mbid) {
  try {
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&sites=musicbrainz&titles=${mbid}&props=claims&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();

    const entities = data.entities;
    const entityId = Object.keys(entities)[0];
    if (!entityId || entityId === "-1") return null;

    const claims = entities[entityId].claims;
    // P18 es la propiedad de imagen en Wikidata
    if (claims.P18 && claims.P18.length > 0) {
      // El valor es el nombre del archivo en Wikimedia Commons
      const fileName = claims.P18[0].mainsnak.datavalue.value;

      // La url de la imagen en Wikimedia Commons:
      const imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
      return imageUrl;
    }
    return null;
  } catch (error) {
    console.error("Error buscando imagen del artista:", error);
    return null;
  }
}
