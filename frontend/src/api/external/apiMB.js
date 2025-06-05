import { getCoverFromProxy, getMusicBrainzDataFromProxy } from "../internal/proxyApi";

// Buscar artistas
export const searchArtists = async (artista, token) => {
  try {
    const data = await getMusicBrainzDataFromProxy(
      `ws/2/artist?query=${encodeURIComponent(artista)}&limit=1&fmt=json`,
      token
    );
    return data.artists;
  } catch (error) {
    console.error("Error al buscar artistas:", error);
    throw error;
  }
};

// Buscar álbumes por nombre
export const searchAlbums = async (albumName, token) => {
  try {
    const data = await getMusicBrainzDataFromProxy(
      `ws/2/release-group?query=${encodeURIComponent(albumName)}&type=album&limit=5&fmt=json`,
      token
    );

    const albums = await Promise.all(
      data["release-groups"].map(async (rg) => {
        const coverUrl = await getCoverFromProxy(rg.id, "release-group", token);
        const releases = await getReleasesByReleaseGroup(rg.id, token, 1, 0);
        const releaseDate = releases[0]?.date || null;

        return {
          id: rg.id,
          title: rg.title || "Título desconocido",
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

// Buscar canciones
export const searchSongs = async (songName, token) => {
  try {
    const data = await getMusicBrainzDataFromProxy(
      `ws/2/recording?query=${encodeURIComponent(songName)}&limit=5&fmt=json`,
      token
    );

    return data.recordings.map((rec) => ({
      id: rec.id,
      title: rec.title,
      artist: rec["artist-credit"]?.[0]?.name || "Artista desconocido",
      album: rec.releases?.[0]?.title || "Álbum desconocido",
      duration: rec.length || null,
    }));
  } catch (error) {
    console.error("Error al buscar canciones:", error);
    throw error;
  }
};

// Álbumes por artista
export const getAlbumsByArtist = async (artistId, token, limit = 5, offset = 0) => {
  try {
    const data = await getMusicBrainzDataFromProxy(
      `ws/2/release-group?artist=${artistId}&type=album&limit=${limit}&offset=${offset}&fmt=json`,
      token
    );

    const albums = data["release-groups"];

    const albumsWithCovers = await Promise.all(
      albums.map(async (album) => {
        const coverUrl = await getCoverFromProxy(album.id, "release-group", token);
        return {
          id: album.id,
          title: album.title,
          artist: album["artist-credit"]?.[0]?.name || "Desconocido",
          coverUrl,
          releaseDate: album["first-release-date"] || "",
        };
      })
    );

    return albumsWithCovers;
  } catch (error) {
    console.error("Error al obtener álbumes con carátulas:", error);
    throw error;
  }
};

// Releases por release-group
export const getReleasesByReleaseGroup = async (releaseGroupId, token, limit = 5, offset = 0) => {
  try {
    const data = await getMusicBrainzDataFromProxy(
      `ws/2/release?release-group=${releaseGroupId}&limit=${limit}&offset=${offset}&fmt=json`,
      token
    );
    return data.releases;
  } catch (error) {
    console.error("Error al obtener releases del release-group:", error);
    throw error;
  }
};

// Canciones por release
export const getSongsByRelease = async (releaseId, token, limit = 5, offset = 0) => {
  try {
    const data = await getMusicBrainzDataFromProxy(
      `ws/2/recording?release=${releaseId}&limit=${limit}&offset=${offset}&fmt=json`,
      token
    );

    const sortedSongs = data.recordings.sort((a, b) => a.position - b.position);

    return sortedSongs.map((rec) => ({
      id: rec.id,
      title: rec.title,
      artist: rec["artist-credit"]?.[0]?.name || "Artista desconocido",
      duration: rec.length || null,
    }));
  } catch (error) {
    console.error("Error al obtener canciones del release:", error);
    throw error;
  }
};
