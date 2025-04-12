const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("React", dataSchema, "React");