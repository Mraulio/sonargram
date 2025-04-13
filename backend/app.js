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
const usersRoutes = require('./routes/usersRoutes');
const listsRoutes = require('./routes/listRoutes');

app.use('/api/users', usersRoutes);
app.use('/api/lists', listsRoutes);

// Conexión a Mongo (aquí solo la abrimos una vez, podría moverse a server.js si prefieres)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch((err) => console.error(err));

module.exports = app;
