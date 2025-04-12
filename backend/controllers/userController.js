const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register a new user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  console.log('Received data:', req.body); // Muestra los datos recibidos en la consola
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const newUser = new User({ name, email, password });
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
      'your_secret_key',                      // Clave secreta
      { expiresIn: '1h' }                    // Tiempo de expiración
    );

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
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

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  deleteUser,
  getUserByEmail,  // Export the new function
};
