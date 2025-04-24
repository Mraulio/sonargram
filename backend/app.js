// app.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas
const userRoutes = require('./routes/userRoutes');
const listRoutes = require('./routes/listRoutes');
const commentsRoutes = require('./routes/commentRoutes')
const favoritesRoutes = require('./routes/favoriteRoutes')
const followRoutes = require('./routes/followRoutes')
const listFollowerRoutes = require('./routes/listFollowerRoutes')

app.use('/api/users', userRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/listfollow', listFollowerRoutes)

// Conexión a Mongo (aquí solo la abrimos una vez, podría moverse a server.js si prefieres)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch((err) => console.error(err));

module.exports = app;
