// app.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

dotenv.config();
const app = express();

app.use(cors());

app.use(express.json());
app.use(morgan('dev'));

// 🛤️ Rutas
const userRoutes = require('./routes/userRoutes');
const listRoutes = require('./routes/listRoutes');
const commentsRoutes = require('./routes/commentRoutes');
const favoritesRoutes = require('./routes/favoriteRoutes');
const followRoutes = require('./routes/followRoutes');
const listFollowerRoutes = require('./routes/listFollowerRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const mbRoutes = require('./routes/musicBrainzRoutes');
const activityRoutes = require('./routes/activityRoutes');

// Proxy 
const proxyRoutes = require('./routes/proxyRoutes');

app.use('/api/users', userRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/listfollow', listFollowerRoutes);
app.use('/api/rating', ratingRoutes);
app.use('/api/mbroutes', mbRoutes);
app.use('/api/activities', activityRoutes);

app.use('/api/proxy', proxyRoutes);

// 🖼️ Servir archivos estáticos de /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mongo
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch((err) => console.error(err));

module.exports = app;
