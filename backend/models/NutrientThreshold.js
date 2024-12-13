// models/NutrientThreshold.js

const mongoose = require("mongoose");

const nutrientThresholdSchema = new mongoose.Schema({
  nutrientName: {
    type: String,
    required: true,
    unique: true,
  },
  maxPerServing: {
    type: Number, // Valor máximo permitido por porción
    required: true,
  },
  unit: {
    type: String, // Unidad del nutriente (e.g., "g", "mg", "kcal")
    required: true,
  },
  description: {
    type: String, // Descripción del impacto nocivo
  },
});

module.exports = mongoose.model("NutrientThreshold", nutrientThresholdSchema);
