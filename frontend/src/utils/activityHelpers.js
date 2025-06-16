// src/utils/activityHelpers.js

/**
 * Devuelve la descripción de la acción para mostrar en la tarjeta.
 * @param {string} action - Tipo de acción (favorite, rate, createList, etc.)
 * @param {object} activity - Objeto completo de la actividad.
 * @returns {string}
 */

export function getActionDescription(action, activity, t) {
  switch (action) {
    case 'favorite':
      return t('markasfavorite');
    case 'rate':
      return `${t('ratedWith')} ${activity.rating}`;
    case 'createList':
      return t('createdList');
    case 'addListSong':
      return t('addedSong');
    case 'followList':
      return t('followedList');
    case 'followUser':
      return t('followedUser');
    case 'comment':
      return t('commented');
    case 'recommendComment':
      return t('recommendedComment');
    default:
      return t('didSomething');
  }
}

/**
 * Obtiene el contenido relacionado según la acción y la actividad.
 * @param {string} action
 * @param {object} activity
 * @returns {{ single: string, type: string, data?: any } | null}
 */
export function getRelatedContent(action, activity, t) {
  const { mbidData, activityRef, list } = activity;
  const targetType = activity.targetType;
  

  if (action === 'addListSong') {
    const songTitle =
      mbidData?.title && mbidData?.artistName
        ? `${mbidData.title} - ${mbidData.artistName}`
        : null;

    if (!songTitle || !list?.name) return null;

    return {
      type: 'compound',
      items: [
        {
          single: songTitle,
          type: 'song',
          data: { ...mbidData, id: mbidData?.mbid },
        },
        {
          single: list.name,
          type: 'list',
          data: list,
        },
      ],
    };
  }

  if (['song', 'album', 'artist'].includes(targetType) && mbidData) {
  const label =
    targetType === 'song'
      ? `${t('song')}: ${mbidData.title || t('unknown')}`
      : targetType === 'album'
        ? `${t('album')}: ${mbidData.title || t('unknown')}`
        : `${t('artist')}: ${mbidData.title || t('unknown')}`;
  const data = { ...mbidData, id: mbidData.mbid };
  return { single: label, type: targetType, data };
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
        ? {
          single: `"${activityRef.text.slice(0, 100)}"`,
          type: 'comment',
          data: activityRef,
        }
        : null;
    default:
      return null;
  }
}
