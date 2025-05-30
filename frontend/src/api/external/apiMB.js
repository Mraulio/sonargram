import axios from "axios";
import { MusicBrainzApi } from "musicbrainz-api";
const corsProxy = "https://cors-anywhere.herokuapp.com/";

const mbApi = new MusicBrainzApi({
  appName: "Prueba",
  appVersion: "0.1.0",
  appContactInfo: "tuemail@ejemplo.com",
});

// Buscar artistas
export const searchArtists = async (artista) => {
  try {
    const result = await mbApi.search("artist", {
      query: artista,
      limit: 5,
    });
    console.log(result.artists);

    return result.artists;
  } catch (error) {
    console.error("Error al buscar artistas:", error);
    throw error;
  }
};

// Buscar álbumes por nombre
export const searchAlbums = async (albumName) => {
  try {
    const result = await mbApi.search("release-group", {
      query: albumName,
      type: "album",
      limit: 10,
    });

    const albums = await Promise.all(
      result["release-groups"].map(async (rg) => {
        const coverUrl = await getCoverUrl(rg.id, "release-group");
        const releases = await getReleasesByReleaseGroup(rg.id, 1, 0);
        console.log('releases', releases)
        const releaseDate = releases[0]?.date || null;

        return {
          id: rg.id,
          title: rg.title,
          artist: rg["artist-credit"]?.[0]?.name || "Artista desconocido",
          coverUrl,
          releaseDate,
        };
      })
    );

    return albums;
  } catch (error) {
    console.error("Error al buscar álbumes:", error);
    throw error;
  }
};



export const searchSongs = async (songName) => {
  try {
    const result = await mbApi.search("recording", {
      query: songName,
      limit: 10,
    });

    return result.recordings.map((rec) => ({
      id: rec.id,
      title: rec.title,
      artist: rec["artist-credit"]?.[0]?.name || "Artista desconocido",
      album: rec.releases?.[0]?.title || "Álbum desconocido",
      duration: rec.length || null, // Duración en milisegundos
    }));
  } catch (error) {
    console.error("Error al buscar canciones:", error);
    throw error;
  }
};



export const getAlbumsByArtist = async (artistId, limit = 0, offset = 0) => {
  try {
    const result = await mbApi.browse("release-group", {
      artist: artistId,
      type: "album",
      limit,
      offset,
    });

    const studioAlbums = result["release-groups"].filter(
      (album) => !album["secondary-types"] || album["secondary-types"].length === 0
    );

    const albumsWithDetails = await Promise.all(
      studioAlbums.map(async (album) => {
        const coverUrl = await getCoverUrl(album.id, "release-group");

        // Obtener la primera release asociada
        const releases = await getReleasesByReleaseGroup(album.id, 1, 0);
        const releaseDate = releases[0]?.date || null;

        return {
          id: album.id,
          title: album.title,
          artist: album["artist-credit"]?.[0]?.name || "Artista desconocido",
          coverUrl,
          releaseDate,
        };
      })
    );

    return albumsWithDetails;
  } catch (error) {
    console.error("Error al obtener álbumes del artista:", error);
    throw error;
  }
};



export const getReleasesByReleaseGroup = async (releaseGroupId, limit = 10, offset = 0) => {
  try {
    const result = await mbApi.browse("release", {
      "release-group": releaseGroupId, // ID del release-group
      limit,
      offset,
    });
    return result.releases; // Devuelve la lista de releases
  } catch (error) {
    console.error("Error al obtener releases del release-group:", error);
    throw error;
  }
};

export const getSongsByRelease = async (releaseId, limit = 10, offset = 0) => {
  try {
    const result = await mbApi.browse("recording", {
      release: releaseId,
      limit,
      offset,
    });

    const sortedSongs = result.recordings.sort((a, b) => a.position - b.position);

    return sortedSongs.map((rec) => ({
      id: rec.id,
      title: rec.title,
      artist: rec["artist-credit"]?.[0]?.name || "Artista desconocido",
      duration: rec.length || null, // Duración en milisegundos
    }));
  } catch (error) {
    console.error("Error al obtener canciones del release:", error);
    throw error;
  }
};

// Obtener nombre (title o name) por MBID y tipo
// Alternativa sin lookup
/* export const fetchNameByMBID = async (mbid, type) => {
  try {
    fetch('https://musicbrainz.org/ws/2/artist/65f4f0c5-ef9e-490c-aee3-909e7ae6b2ab?fmt=json')
  .then(res => res.json())
  .then(data => {console.log('AAAAA', data)});

    return mbid;
  } catch (error) {
    console.error(`Error buscando por MBID:`, error);
    return mbid;
  }
};
 */

const getCoverUrl = async (mbid, type = "release-group") => {
  try {
    const response = await axios.get(`https://coverartarchive.org/${type}/${mbid}`);
    const data = response.data;
    return data.images?.[0]?.thumbnails?.small || data.images?.[0]?.image || null;
  } catch {
    return null; // Si no hay portada, devuelve null
  }
};
