const User = require('../models/User');
const jwt = require('jsonwebtoken');

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

const deleteUser = async (req,res) => {
  const { email } = req.params;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: 'User does not exist, can\'t delete.' });
    }
    // Eliminar el usuario
    await User.deleteOne({ email });

    // Responder con éxito
    res.status(200).json({ message: 'User successfully deleted' });

  } catch (error) {
    // Manejo de errores
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}


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

    // Generar JWT con el ID y el rol del usuario
    const token = jwt.sign(
      { userId: user._id, role: user.role },  // Aquí estamos agregando el rol
      process.env.JWT_SECRET_KEY,             // Clave secreta
      { expiresIn: '1m' }                    // Tiempo de expiración
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

// Añadir un favorito
const addFavorite = async (req, res) => {
  const userId = req.user.userId; 
  const { favoriteId, favoriteType } = req.body;  // Recibe el ID del favorito y el tipo (song, album, artist)

  try {
    const user = await User.findById(userId);  // Busca al usuario por el ID

    if (!user) {
      return res.status(404).json({ message: 'User not found' });  // Si no se encuentra el usuario, responde con 404
    }

    // Verifica si el favorito ya existe
    const isAlreadyFavorite = user.favorites.some(favorite => favorite.favoriteId === favoriteId && favorite.favoriteType === favoriteType);
    
    if (isAlreadyFavorite) {
      return res.status(400).json({ message: 'Favorite already added' });  // Si ya es favorito, no lo añade
    }

    // Añadir el favorito al array de favoritos
    user.favorites.push({ favoriteId, favoriteType });

    await user.save();  // Guarda el usuario con el nuevo favorito

    res.status(200).json({ message: 'Favorite added successfully' });  // Responde con éxito
  } catch (error) {
    res.status(500).json({ message: 'Server error' });  // En caso de error, responde con 500
  }
};

// Eliminar un favorito
const removeFavorite = async (req, res) => {
  const userId = req.user.userId;
  const { favoriteId, favoriteType } = req.body;  // Recibe el ID del favorito y el tipo (song, album, artist)

  try {
    const user = await User.findById(userId);  // Busca al usuario por el ID

    if (!user) {
      return res.status(404).json({ message: 'User not found' });  // Si no se encuentra el usuario, responde con 404
    }

    // Verifica si el favorito existe
    const favoriteIndex = user.favorites.findIndex(favorite => favorite.favoriteId === favoriteId && favorite.favoriteType === favoriteType);
    
    if (favoriteIndex === -1) {
      return res.status(400).json({ message: 'Favorite not found' });  // Si el favorito no existe, responde con un error
    }

    // Elimina el favorito de la lista de favoritos
    user.favorites.splice(favoriteIndex, 1);

    await user.save();  // Guarda el usuario con el favorito eliminado

    res.status(200).json({ message: 'Favorite removed successfully' });  // Responde con éxito
  } catch (error) {
    res.status(500).json({ message: 'Server error' });  // En caso de error, responde con 500
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  deleteUser,
  getUserByEmail,  // Export the new function
  addFavorite,     // Export the addFavorite method
  removeFavorite,  // Export the removeFavorite method
};
