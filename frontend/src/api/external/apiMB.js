import { getCoverFromProxy, getMusicBrainzDataFromProxy } from "../internal/proxyApi";

// Buscar artistas
export const searchArtists = async (artista, token) => {
  try {
    const data = await getMusicBrainzDataFromProxy(
      `ws/2/artist?query=${encodeURIComponent(artista)}&limit=3&fmt=json`,
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
      `ws/2/release-group?query=${encodeURIComponent(albumName)}&type=album&limit=15&fmt=json`,
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
          artist: rg["artist-credit"]?.[0]?.name || null,
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
// Buscar canciones e incluir enlaces externos (YouTube / Spotify)
export const searchSongs = async (songName, token) => {
  try {
    const data = await getMusicBrainzDataFromProxy(
      `ws/2/recording?query=${encodeURIComponent(songName)}&limit=15&fmt=json`,
      token
    );

    // Obtener grabaciones básicas
    const recordings = data.recordings || [];

    // Obtener enlaces externos en paralelo para cada canción
    const results = await Promise.all(
      recordings.map(async (rec) => {
        const externalLinks = await getSongExternalLinks(rec.id, token);
        console.log('external links', externalLinks);
        return {
          id: rec.id,
          title: rec.title,
          artist: rec["artist-credit"]?.[0]?.name || null,
          album: rec.releases?.[0]?.title || null,
          duration: rec.length || null,
          externalLinks, // aquí están los enlaces de Spotify, YouTube, etc.
        };
      })
    );
    return results;
  } catch (error) {
    console.error("Error al buscar canciones:", error);
    throw error;
  }
};

// Álbumes por artista
export const getAlbumsByArtist = async (artistId, token, limit = 15, offset = 0) => {
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
          artist: album["artist-credit"]?.[0]?.name || null,
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
export const getReleasesByReleaseGroup = async (releaseGroupId, token, limit = 20, offset = 0) => {
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

// Canciones por release con enlaces externos
export const getSongsByRelease = async (releaseId, token, limit = 20, offset = 0) => {
  try {
    const data = await getMusicBrainzDataFromProxy(
      `ws/2/recording?release=${releaseId}&limit=${limit}&offset=${offset}&fmt=json`,
      token
    );

    const sortedSongs = (data.recordings || []).sort(
      (a, b) => (a.position || 0) - (b.position || 0)
    );

    const results = await Promise.all(
      sortedSongs.map(async (rec) => {
        const externalLinks = await getSongExternalLinks(rec.id, token);

        return {
          id: rec.id,
          title: rec.title,
          artist: rec["artist-credit"]?.[0]?.name || null,
          duration: rec.length || null,
          externalLinks,
        };
      })
    );

    return results;
  } catch (error) {
    console.error("Error al obtener canciones del release:", error);
    throw error;
  }
};

// Obtener enlaces externos (YouTube, Spotify) de una canción por su ID
export const getSongExternalLinks = async (recordingId, token) => {
  try {
    const data = await getMusicBrainzDataFromProxy(
      `ws/2/recording/${recordingId}?inc=url-rels&fmt=json`,
      token
    );

    const relations = data.relations || [];

    let spotifyUrl = null;
    let youtubeUrl = null;

    for (const rel of relations) {
      const url = rel?.url?.resource || "";

      if (url.includes("open.spotify.com") && !spotifyUrl) {
        spotifyUrl = url;
      } else if ((url.includes("youtube.com") || url.includes("youtu.be")) && !youtubeUrl) {
        youtubeUrl = url;
      }
    }

    return { spotifyUrl, youtubeUrl };
  } catch (error) {
    console.error("Error al obtener enlaces externos:", error);
    return { spotifyUrl: null, youtubeUrl: null };
  }
};

export const extractSpotifyAndYouTubeLinks = (relations = []) => {
  let spotifyUrl = null;
  let youtubeUrl = null;

  for (const rel of relations) {
    const url = rel?.url?.resource || "";

    if (url.includes("open.spotify.com")) {
      spotifyUrl = url;
    } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
      youtubeUrl = url;
    }
  }

  return { spotifyUrl, youtubeUrl };
};
