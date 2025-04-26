const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Carpeta donde guardar
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname); // .jpg .png etc.
      const userId = req.user.userId; // Esto te lo da tu middleware de auth
      cb(null, `profilepic_${userId}${ext}`);
    }
  });
  

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only jpg, jpeg, and png are allowed.'));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
