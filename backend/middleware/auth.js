const jwt = require('jsonwebtoken');

// Middleware general: verifica que hay token válido
const requireAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '')
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded; // Guarda el usuario decodificado con userId y role
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// Middleware específico para admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  next();
};

module.exports = {
  requireAuth,
  requireAdmin,
};
