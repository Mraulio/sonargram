const jwt = require('jsonwebtoken');

// Middleware para verificar el rol
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      // Verificar el token
      const decoded = jwt.verify(token, 'your_secret_key');
      
      // Verificar el rol
      if (decoded.role !== requiredRole) {
        return res.status(403).json({ message: 'Permission denied' });
      }

      // Poner los datos del usuario en la request para usar en los controladores
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
};
