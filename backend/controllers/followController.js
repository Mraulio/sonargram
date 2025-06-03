// controllers/followController.js
const followService = require('../services/followService');
const logActivity = require('../utils/logActivity');

// Seguir a un usuario
async function followUser(req, res) {
  const userId = req.user.userId; // ID del usuario logueado (viene del token)
  const { followedId } = req.params;

  try {
    // Llamamos al servicio para seguir al usuario
    await followService.followUser(userId, followedId);

    // Log de la actividad, con los datos recibidos
    await logActivity({
      user: userId,
      action: 'followUser',
      targetType: 'User',
      targetId: followedId,      
    });

    res.status(200).json({ message: 'User followed successfully' });
  } catch (err) {
    console.error(err);
    if (err.message === 'Already following this user') {
      return res.status(400).json({ message: err.message }); // 400 si ya está siguiendo
    }
    if (err.message === 'You cannot follow yourself') {
      return res.status(400).json({ message: err.message }); // 400 si intenta seguirse a sí mismo
    }
    res.status(500).json({ message: 'Server error' }); // 500 para errores del servidor
  }
}

// Dejar de seguir a un usuario
async function unfollowUser(req, res) {
  const userId = req.user.userId; // ID del usuario logueado (viene del token)
  const { followedId } = req.params;

  try {
    // Llamamos al servicio para dejar de seguir al usuario
    await followService.unfollowUser(userId, followedId);
    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (err) {
    console.error(err);
    if (err.message === 'You are not following this user') {
      return res.status(400).json({ message: err.message }); // 400 si no está siguiendo
    }
    res.status(500).json({ message: 'Server error' }); // 500 para errores del servidor
  }
}

// Obtener los seguidores de un usuario
async function getFollowers(req, res) {
  const { userId } = req.params; // El ID del usuario al que le queremos obtener los seguidores

  try {
    const followers = await followService.getFollowers(userId);
    res.status(200).json(followers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Obtener los usuarios que sigue un usuario
async function getFollowing(req, res) {
  const { userId } = req.params; // El ID del usuario al que le queremos obtener los usuarios que sigue

  try {
    const following = await followService.getFollowing(userId);
    res.status(200).json(following);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}


module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
