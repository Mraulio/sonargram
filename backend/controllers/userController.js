const User = require('../models/User');
const jwt = require('jsonwebtoken');
const LoginEvent = require('../models/LoginEvent');

// Register a new user
const registerUser = async (req, res) => {
  const { name, username, email, password, role } = req.body;

  // Validar que todos los campos requeridos estén presentes
  if (!name || !username || !email || !password) {
    return res.status(400).json({ message: 'Name, Username, email, and password are required' });
  }

  try {
    
    // Comprobar si el nombre de usuario ya está tomado
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }


    const newUser = new User({ name, username, email, password, role });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params; // Usamos el _id de Mongo
  const updates = req.body;
  const { userId, role } = req.user; // Asignado por middleware de autenticación

  try {
    // ❌ No permitir actualización de username ni email ni rol
    if ('username' in updates || 'email' in updates || 'role' in updates) {
      return res.status(400).json({
        message: 'Username, role and email cannot be updated.'
      });
    }

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Solo puede actualizarse a sí mismo o si es admin
    if (userToUpdate._id.toString() !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedUser = await User.findByIdAndUpdate(id, { $set: updates }, { new: true });

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadProfilePic = async (req, res) => {
  const { userId, role } = req.user; // Info del token

  try {
    // Reglas de autorización (solo el propio usuario o un admin puede subir la imagen)
    if (req.user.userId !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Construir la URL de la imagen subida
    const profilePicUrl = req.file.filename;

    // Actualizar el perfil del usuario en la base de datos
    const updatedUser = await User.findByIdAndUpdate(
      userId, // Usamos el userId extraído del token
      { $set: { profilePic: profilePicUrl } },
      { new: true }
    );

    res.status(200).json({
      message: 'Profile picture updated',
      profilePic: updatedUser.profilePic
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteProfilePic = async (req, res) => {
  const { userId, role } = req.user; // Info del token

  try {
    // Reglas de autorización (solo el propio usuario o un admin puede subir la imagen)
    if (req.user.userId !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }   

    // Actualizar el perfil del usuario en la base de datos
    const updatedUser = await User.findByIdAndUpdate(
      userId, // Usamos el userId extraído del token
      { $set: { profilePic: null } },
      { new: true }
    );

    res.status(200).json({
      message: 'Profile picture deleted',
      updatedUser: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }

}

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const { userId, role } = req.user; // Datos del usuario autenticado

  try {
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Solo puede eliminarse a sí mismo o si es admin
    if (userToDelete._id.toString() !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'User successfully deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Registrar el evento de login
    await LoginEvent.create({
      user: user._id,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    // Generar JWT con el ID y el rol del usuario
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();  // Fetch all users from the database
    res.status(200).json(users);  // Send the list of users as the response
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// En userController.js
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password'); // Excluye password
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by id
const getUserById = async (req, res) => {
  const { id } = req.params;  // El email se pasa como parámetro de la ruta

  try {
    const user = await User.findById(id).select('-password');  // Busca al usuario por el id
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });  // Si no lo encuentra, responde con 404
    }

    // Si lo encuentra, devuelve la información del usuario
    res.status(200).json({
      id: user._id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      email: user.email,
      role: user.role,
      status: user.status,
      profilePic: user.profilePic,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });  // En caso de error, responde con 500
  }
};

// Get user by email
const getUserByEmail = async (req, res) => {
  const { email } = req.params;  // El email se pasa como parámetro de la ruta

  try {
    const user = await User.findOne({ email });  // Busca al usuario por el email

    if (!user) {
      return res.status(404).json({ message: 'User not found' });  // Si no lo encuentra, responde con 404
    }

    // Si lo encuentra, devuelve la información del usuario
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      createdLists: user.createdLists,
      following: user.following
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });  // En caso de error, responde con 500
  }
};

module.exports = {
  registerUser,
  updateUser,
  uploadProfilePic,
  deleteProfilePic,
  loginUser,
  getCurrentUser,
  getAllUsers,
  getUserById,
  deleteUser,
  getUserByEmail,
}
