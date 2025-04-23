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
  bio: { type: String, default: 'Sonargram user!' },
  status: { type: String, default: 'active' }, // Ej: 'active', 'suspended', 'deleted'
}, {
  timestamps: true  // Habilitar la opción para timestamps
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

module.exports = mongoose.model('User', UserSchema);
