const List = require('../models/List');

const createList = async (req, res) => {
  try {
    const nueva = new List(req.body);
    const guardada = await nueva.save();
    res.status(201).json(guardada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getLists = async (req, res) => {
  const listas = await List.find().populate('creator');
  res.json(listas);
};

module.exports = { createList, getLists };
