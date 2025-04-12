const jwt = require('jsonwebtoken');

// Middleware para verificar si el usuario tiene rol 'admin'
const requireAdmin = (req, res, next) => {
  // Obtener el token del encabezado 'Authorization' (bearer token)
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verificar y decodificar el token usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Verificar que el usuario tiene rol 'admin'
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You do not have admin privileges.' });
    }

    // Añadir los datos del usuario (ID y rol) al objeto de la solicitud
    req.user = decoded;
    next();  // Permitir que la solicitud continúe
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = requireAdmin;
