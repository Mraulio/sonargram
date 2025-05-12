// services/followService.js
const Follow = require('../models/Follow');

async function followUser(followerId, followedId) {
  if (followerId === followedId) {
    throw new Error('You cannot follow yourself'); // No puede seguirse a sí mismo
  }

  // Comprobar si ya sigue a este usuario
  const alreadyFollowing = await Follow.findOne({ follower: followerId, followed: followedId });
  if (alreadyFollowing) {
    throw new Error('Already following this user'); // Ya está siguiendo a este usuario
  }

  try {
    // Intentamos crear la relación de seguir al usuario
    await Follow.create({ follower: followerId, followed: followedId });
  } catch (err) {
    if (err.code === 11000) {
      // Esto ocurre si ya existe un documento duplicado debido a la clave única
      throw new Error('Already following this user'); // Error específico de duplicado
    }
    throw err; // Re-lanzamos otros errores que puedan ocurrir
  }
}

async function unfollowUser(followerId, followedId) {
  // Comprobar si ya sigue a este usuario antes de intentar dejar de seguirlo
  const followRelation = await Follow.findOne({ follower: followerId, followed: followedId });
  if (!followRelation) {
    throw new Error('You are not following this user'); // No lo sigue, no puede dejar de seguirlo
  }

  try {
    await Follow.deleteOne({ follower: followerId, followed: followedId });
  } catch (err) {
    throw err;
  }
}

async function getFollowers(userId) {
  return Follow.find({ followed: userId }).populate('follower'); // Relacionamos el "follower" con los usuarios que siguen
}

// Obtener los usuarios que sigue un usuario
async function getFollowing(userId) {
  return Follow.find({ follower: userId }).populate('followed'); // Relacionamos el "followed" con los usuarios que se están siguiendo
}


module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
