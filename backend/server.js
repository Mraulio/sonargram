const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 👇 Logger para peticiones HTTP
app.use(morgan('dev'));
// También puedes usar: 'combined', 'tiny', etc.

const usersRoutes = require('./routes/usersRoutes');
const listsRoutes = require('./routes/listRoutes');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch((err) => console.error(err));

app.use('/api/users', usersRoutes);
app.use('/api/lists', listsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
