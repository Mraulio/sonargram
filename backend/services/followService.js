// services/followService.js
const Follow = require('../models/Follow');

async function followUser(followerId, followedId) {
  if (followerId === followedId) return; // no puede seguirse a sí mismo
  try {
    await Follow.create({ follower: followerId, followed: followedId });
  } catch (err) {
    if (err.code === 11000) return;
    throw err;
  }
}

async function unfollowUser(followerId, followedId) {
  await Follow.deleteOne({ follower: followerId, followed: followedId });
}

async function getFollowers(userId) {
  return Follow.find({ followed: userId });
}

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
};
