import { MusicBrainzApi } from "musicbrainz-api";

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
      limit: 5,
    });
    console.log(result["release-groups"]);

    return result["release-groups"];
  } catch (error) {
    console.error("Error al buscar álbumes:", error);
    throw error;
  }
};

// Buscar canciones por nombre
export const searchSongs = async (songName) => {
  try {
    const result = await mbApi.search("recording", {
      query: songName,
      limit: 5,
    });
    console.log(result.recordings);

    return result.recordings;
  } catch (error) {
    console.error("Error al buscar canciones:", error);
    throw error;
  }
};

export const getAlbumsByArtist = async (artistId, limit = 0, offset = 0) => {
  try {
    const result = await mbApi.browse("release-group", {
      artist: artistId, // ID del artista
      type: "album", // Filtra solo álbumes
      limit,
      offset,
    });

    // Filtrar álbumes que no tengan secondary-types
    const studioAlbums = result["release-groups"].filter(
      (album) => !album["secondary-types"] || album["secondary-types"].length === 0
    );

    return studioAlbums; // Devuelve solo los álbumes de estudio
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
      release: releaseId, // ID del release
      limit,
      offset,
    });
    // Ordenar las canciones por la propiedad "position"
    const sortedSongs = result.recordings.sort((a, b) => a.position - b.position);
    return sortedSongs; // Devuelve la lista de grabaciones (canciones)
  } catch (error) {
    console.error("Error al obtener canciones del release:", error);
    throw error;
  }
};
