// app.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');

dotenv.config();
const app = express();

// Seguridad: usar helmet completo con CSP personalizado
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true, // <-- esto hace que Helmet use las políticas base correctas
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "http://localhost:5000", "data:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // <-- OJO agregamos 'unsafe-eval' para solucionar lo de WebAssembly
      connectSrc: ["'self'", "http://localhost:5000"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 🛤️ Rutas
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

// 🖼️ Servir archivos estáticos de /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mongo
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch((err) => console.error(err));

module.exports = app;
