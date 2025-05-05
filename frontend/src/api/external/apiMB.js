/*

const BASE_URL = "https://musicbrainz.org/ws/2";

export const searchArtists = async (query) => {
    try {
        const response = await fetch(`${BASE_URL}/artist/?query=${encodeURIComponent(query)}&fmt=json`);
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.artists; // Devuelve la lista de artistas
    } catch (error) {
        console.error("Error al buscar artistas en MusicBrainz:", error);
        throw error;
    }
};

export const getSongsByArtist = async (artistId) => {
    try {
        const response = await fetch(`${BASE_URL}/recording?artist=${artistId}&fmt=json`);
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.recordings; // Devuelve la lista de grabaciones (canciones)
    } catch (error) {
        console.error("Error al obtener canciones del artista:", error);
        throw error;
    }
};

export const getAlbumsByArtist = async (artistId, limit = 100, offset = 0) => {
    try {
        const response = await fetch(
            `https://musicbrainz.org/ws/2/release-group?artist=${artistId}&type=album&fmt=json&limit=${limit}&offset=${offset}`
        );
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data["release-groups"]; // Devuelve la lista de grupos de lanzamientos (álbumes únicos)
    } catch (error) {
        console.error("Error al obtener álbumes del artista:", error);
        throw error;
    }
};

*/

import { MusicBrainzApi } from "musicbrainz-api";

const mbApi = new MusicBrainzApi({
    appName: "Prueba",
    appVersion: "0.1.0",
    appContactInfo: "tuemail@ejemplo.com",
});

// Buscar artistas
export const searchArtists = async (artista) => {
    try {
        const result = await mbApi.search('artist', 
            {query: artista,
             limit:5
            });
        console.log(result.artists)

        return result.artists;
    } catch (error) {
        console.error("Error al buscar artistas:", error);
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

// Obtener canciones de un artista
/*
export const getSongsByArtist = async (artistId, limit = 10, offset = 0) => {
    try {
        const result = await mbApi.searchRecording({
            artist: artistId,
            limit,
            offset,
        });
        return result.recordings;
    } catch (error) {
        console.error("Error al obtener canciones del artista:", error);
        throw error;
    }
};*/
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