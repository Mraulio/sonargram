// src/utils/activityHelpers.js

/**
 * Devuelve la descripción de la acción para mostrar en la tarjeta.
 * @param {string} action - Tipo de acción (favorite, rate, createList, etc.)
 * @param {object} activity - Objeto completo de la actividad.
 * @returns {string}
 */
export function getActionDescription(action, activity) {
  switch (action) {
    case 'favorite':
      return 'marcó como favorito';
    case 'rate':
      return `calificó con nota ${activity.rating}`;
    case 'createList':
      return 'creó la lista';
    case 'addListSong':
      return 'agregó la canción';
    case 'followList':
      return 'siguió la lista';
    case 'followUser':
      return 'siguió al usuario';
    case 'comment':
      return 'comentó';
    case 'recommendComment':
      return 'recomendó un comentario';
    default:
      return 'hizo una actividad';
  }
}

/**
 * Obtiene el contenido relacionado según la acción y la actividad.
 * @param {string} action
 * @param {object} activity
 * @returns {{ single: string, type: string, data?: any } | null}
 */
export function getRelatedContent(action, activity) {
  const { mbidData, activityRef, list } = activity;
  const targetType = activity.targetType;

  if (action === 'addListSong') {
    const songTitle = mbidData?.title && mbidData?.artistName
      ? `${mbidData.title} - ${mbidData.artistName}`
      : null;
    return songTitle
      ? { single: songTitle, type: 'song', data: mbidData, list: list }
      : null;
  }

  if (['song', 'album', 'artist'].includes(targetType) && mbidData) {
    const label = targetType === 'song'
      ? `Canción: ${mbidData.title || 'Desconocida'}`
      : targetType === 'album'
        ? `Álbum: ${mbidData.title || 'Desconocida'}`
        : `Artista: ${mbidData.title || 'Desconocida'}`;
    const data = {...mbidData, id: mbidData.mbid}
    return { single: label, type: targetType, data: data };
  }

  switch (action) {
    case 'createList':
    case 'followList':
      return activityRef?.name
        ? { single: activityRef.name, type: 'list', data: activityRef }
        : null;

    case 'followUser':
      return activityRef?.username
        ? { single: `@${activityRef.username}`, type: 'user', data: activityRef }
        : null;

    case 'comment':
    case 'recommendComment':
      return activityRef?.text
        ? { single: `"${activityRef.text.slice(0, 100)}"`, type: 'comment', data: activityRef }
        : null;

    default:
      return null;
  }
}
