const mongoose = require("mongoose"); // Importar Mongoose

// Definir el esquema para UnverifiedIngredient
const UnverifiedIngredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Nombre único del ingrediente
    createdAt: { type: Date, default: Date.now }, // Fecha de creación
  },
  { timestamps: true } // Incluye automáticamente createdAt y updatedAt
);

// Exportar el modelo basado en el esquema
module.exports = mongoose.model("UnverifiedIngredient", UnverifiedIngredientSchema);
