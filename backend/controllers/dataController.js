const Data = require("../models/Data");

exports.getData = async (req, res) => {
    try {
        const data = await Data.find(); // Obtiene todos los documentos de la colección
        console.log("Datos obtenidos de MongoDB:", data); // Log para depuración
        res.json(data); // Envía los datos como JSON
    } catch (error) {
        console.error("Error al obtener los datos:", error); // Log del error
        res.status(500).json({ error: "Error al obtener los datos" });
    }
};

exports.createData = async (req, res) => {
    try {
        const newData = new Data(req.body);
        const savedData = await newData.save();
        res.status(201).json(savedData);
    } catch (error) {
        res.status(400).json({ error: "Error al crear los datos" });
    }
};