const CommentRecommendation = require('../models/CommentRecommendation');
const Comment = require('../models/Comment');  // Asegúrate de que tienes el modelo de Comment
const logActivity = require('../utils/logActivity');

// Insertar un nuevo comentario
const addComment = async (req, res) => {
    const { user, targetId, targetType, comment, title, artistName, coverUrl, releaseDate, duration } = req.body;
  
    try {
      // Verificar si ya existe un comentario del mismo usuario para el mismo target
      const existingComment = await Comment.findOne({ user: user, targetId });
  
      if (existingComment) {
        return res.status(400).json({ message: 'El usuario ya comentó sobre este contenido.' });
      }
  
      // Crear el nuevo comentario
      const newComment = new Comment({
        user,
        targetId,
        targetType,
        comment
      });
  
      await newComment.save();

      // Log de la actividad, con los datos recibidos
          await logActivity({
            user: user,
            action: 'comment',
            targetType: targetType,
            targetId: targetId,
             metadata: {
            title,
            artistName,
            coverUrl,
            releaseDate,
            duration,
          }
        });         

      res.status(201).json(newComment);
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      res.status(500).json({ message: 'Error al agregar comentario' });
    }
  };
  

// Eliminar comentario (marcar como "Deleted")
const deleteComment = async (req, res) => {
    const { commentId } = req.params;
  
    try {
      // Buscar el comentario por su ID
      const comment = await Comment.findById(commentId);
  
      if (!comment) {
        return res.status(404).json({ message: 'Comentario no encontrado' });
      }
  
      // Eliminar todas las recomendaciones asociadas al comentario
      await CommentRecommendation.deleteMany({ commentId });
  
      // Eliminar el comentario
      await Comment.deleteOne({ _id: commentId });
  
      // Responder con éxito
      res.status(200).json({ message: 'Comentario y sus recomendaciones eliminadas exitosamente' });
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      res.status(500).json({ message: 'Error al eliminar comentario' });
    }
  };
  

// Obtener comentarios de un usuario, o todos los comentarios si no se especifican filtros
const getCommentsUser = async (req, res) => {
    const { user, targetType } = req.query;
  
    if (!user) {
      return res.status(400).json({ message: 'El parámetro "user" es obligatorio.' });
    }
  
    try {
      const filter = { user };
  
      if (targetType) {
        filter.targetType = targetType;
      }
  
      const comments = await Comment.find(filter);
  
      if (comments.length === 0) {
        return res.status(404).json({ message: 'No se encontraron comentarios' });
      }
  
      res.status(200).json(comments);
    } catch (error) {
      console.error('Error al obtener comentarios:', error);
      res.status(500).json({ message: 'Error al obtener comentarios' });
    }
  };
  
  

  // Obtener comentarios de un contenido específico (por targetId)
const getCommentsByTarget = async (req, res) => {
    const { targetId } = req.params;  // Recibimos targetId y targetType como parámetros de consulta
  
    try {
      const comments = await Comment.find({ targetId });
  
      if (comments.length === 0) {
        return res.status(404).json({ message: 'No se encontraron comentarios para este contenido' });
      }
  
      res.status(200).json(comments);  // Devolvemos los comentarios encontrados
    } catch (error) {
      console.error('Error al obtener comentarios por targetId:', error);
      res.status(500).json({ message: 'Error al obtener comentarios' });
    }
  };
  
// Función para agregar una recomendación a un comentario
const addRecommendation = async (req, res) => {
  const { commentId, userId } = req.body;

  try {

    // Verificar si el comentario existe
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comentario no encontrado' });
    }

    // Verificar si el usuario ya recomendó este comentario
    const existingRecommendation = await CommentRecommendation.findOne({ commentId, userId });
    if (existingRecommendation) {
      return res.status(400).json({ message: 'Este usuario ya recomendó este comentario' });
    }

    // Crear una nueva recomendación
    const newRecommendation = new CommentRecommendation({
      commentId,
      userId,
    });

    // Guardar la recomendación
    await newRecommendation.save();
    
    // Responder con éxito
    return res.status(201).json({ message: 'Recomendación agregada correctamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al agregar la recomendación' });
  }
};

// Borrar recomendacion
const deleteRecommendation = async (req, res) => {
    const { commentId, userId } = req.body;  // Recibimos los IDs desde el body

    try {
      // Buscar la recomendación con ambos IDs
      const recommendation = await CommentRecommendation.findOne({ commentId, userId });
  
      if (!recommendation) {
        return res.status(404).json({ message: 'Recomendación no encontrada' });
      }
  
      // Eliminar la recomendación
      await CommentRecommendation.deleteOne({ _id: recommendation._id });
  
      // Responder con éxito
      return res.status(200).json({ message: 'Recomendación eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar la recomendación:', error);
      return res.status(500).json({ message: 'Error al eliminar la recomendación' });
    }
  };

// Función para obtener las recomendaciones de un comentario
const getRecommendations = async (req, res) => {
  const { commentId } = req.params;

  try {
    // Obtener todas las recomendaciones para el comentario
    const recommendations = await CommentRecommendation.find({ commentId }).populate('userId', 'name email'); // Obtener el usuario con 'name' y 'email'
    
    // Responder con las recomendaciones
    return res.status(200).json({ recommendations });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener las recomendaciones' });
  }
};

module.exports = { 
    addComment,
    deleteComment,
    getCommentsUser,
    getCommentsByTarget,
    addRecommendation,
    deleteRecommendation,
    getRecommendations 
  };