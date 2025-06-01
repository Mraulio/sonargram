// src/components/ActivityCard.js
import React from 'react';
import { Card, CardContent, Typography, Avatar, Stack, Box, Link } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faStar,
  faList,
  faUser,
  faComment,
  faThumbsUp,
} from '@fortawesome/free-solid-svg-icons';

const iconMap = {
  favorite: faHeart,
  rate: faStar,
  createList: faList,
  addListSong: faList,
  followList: faList,
  followUser: faUser,
  comment: faComment,
  recommendComment: faThumbsUp,
};

const iconColors = {
  favorite: 'red',
  rate: '#FFD700',
  createList: '#1976d2',
  addListSong: '#1976d2',
  followList: '#1976d2',
  followUser: '#6a1b9a',
  comment: '#555',
  recommendComment: '#43a047',
};

// 🧠 Descripción base
const getActionDescription = (action, user) => {
  const username = user || 'Alguien';
  switch (action) {
    case 'favorite':
      return `${username} marcó como favorito`;
    case 'rate':
      return `${username} calificó`;
    case 'createList':
      return `${username} creó una lista`;
    case 'addListSong':
      return `${username} agregó una canción a una lista`;
    case 'followList':
      return `${username} siguió una lista`;
    case 'followUser':
      return `${username} siguió a un usuario`;
    case 'comment':
      return `${username} comentó`;
    case 'recommendComment':
      return `${username} recomendó un comentario`;
    default:
      return `${username} hizo una actividad`;
  }
};

// 🧩 Detalles del objeto relacionado
const getRelatedContent = (action, ref) => {
    console.log('action', action);
    console.log('ref', ref);
    if (!ref) return null;
    console.log('no nulo');
  switch (action) {
    case 'rate':
    case 'favorite':
      return <Typography variant="body2">Canción: <strong>{ref.title || 'Desconocida'}</strong></Typography>;
    case 'createList':
    case 'addListSong':
    case 'followList':
      return <Typography variant="body2">Lista: <strong>{ref.name}</strong></Typography>;
    case 'followUser':
      return (
        <Typography variant="body2">
          Usuario seguido: <strong>@{ref.username}</strong>
        </Typography>
      );
    case 'comment':
    case 'recommendComment':
      return (
        <Typography variant="body2">
          Comentario: <em>"{ref.text?.slice(0, 100)}"</em>
        </Typography>
      );
    default:
      return null;
  }
};

const ActivityCard = ({ activity }) => {
  const { user, action, createdAt, activityRef, targetId } = activity;
  console.log('activity', activity)
  const icon = iconMap[action];
  const iconColor = iconColors[action] || '#666';

  const profilePicUrl =
    user && user.profilePic
      ? `http://localhost:5000/uploads/${user.profilePic}`
      : '/assets/images/profilepic_default.png';

  const description = getActionDescription(action, user?.username);
  const relatedContent = getRelatedContent(action, activityRef);

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              alt={user?.username}
              src={profilePicUrl}
              sx={{ width: 56, height: 56 }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                backgroundColor: '#fff',
                borderRadius: '50%',
                padding: '4px',
              }}
            >
              <FontAwesomeIcon icon={icon} color={iconColor} size="lg" />
            </Box>
          </Box>
          <Box>
            <Typography variant="body1">{description} {relatedContent}</Typography>
            {targetId}
            <Typography variant="caption" color="text.secondary">
              {new Date(createdAt).toLocaleString()}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
