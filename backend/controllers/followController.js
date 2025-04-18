const followService = require('../services/followService');

// Seguir a un usuario
async function followUser(req, res) {
  const { followerId } = req.user; // Obtén el ID del usuario que está haciendo el seguimiento desde el JWT o sesión
  const { followedId } = req.params; // El ID del usuario que se va a seguir, pasado como parámetro de la ruta

  try {
    // Llamar al servicio para seguir al usuario
    await followService.followUser(followerId, followedId);
    res.status(200).json({ message: 'User followed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Dejar de seguir a un usuario
async function unfollowUser(req, res) {
  const { followerId } = req.user; // ID del usuario que está realizando la acción
  const { followedId } = req.params; // ID del usuario que se va a dejar de seguir

  try {
    // Llamar al servicio para dejar de seguir al usuario
    await followService.unfollowUser(followerId, followedId);
    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
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

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
};
