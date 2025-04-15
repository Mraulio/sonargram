const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'] 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address']
  },
  username: { 
    type: String, 
    required: [true, 'Username is required'], 
    unique: true 
  },
  password: { 
    type: String, 
    required: [true, 'Password is required']
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  createdLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'List' }],

  // Favoritos de usuario, guardamos solo los IDs de MusicBrainz
  favorites: [
    {
      favoriteId: { type: String, required: true },  // ID de MusicBrainz
      favoriteType: { type: String, enum: ['song', 'album', 'artist'], required: true }
    }
  ],

  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

// Hash password before saving the user
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // only hash if password is new or changed
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed one
UserSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

// Método para agregar un favorito
UserSchema.methods.addFavorite = async function(favoriteId, favoriteType) {
  // Verifica si ya existe el favorito en la lista del usuario
  const isAlreadyFavorite = this.favorites.some(fav => fav.favoriteId === favoriteId && fav.favoriteType === favoriteType);

  if (!isAlreadyFavorite) {
    // Si no es favorito, lo agregamos
    this.favorites.push({ favoriteId, favoriteType });
    await this.save();
  }
};

// Método para eliminar un favorito
UserSchema.methods.removeFavorite = async function(favoriteId, favoriteType) {
  // Filtra los favoritos para eliminar el que coincide con el ID y tipo
  this.favorites = this.favorites.filter(fav => !(fav.favoriteId === favoriteId && fav.favoriteType === favoriteType));
  await this.save();
};

module.exports = mongoose.model('User', UserSchema);
