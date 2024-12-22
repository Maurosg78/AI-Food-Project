const mongoose = require("mongoose");

// Definición del esquema para el modelo Product
const ProductSchema = new mongoose.Schema(
  {
    barcode: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]+$/, // Opcional: Acepta solo números
    },
    productName: { type: String, required: true, trim: true },
    ingredients: { type: [String], default: [] },
    nutrients: { type: Object, default: {} },
    source: { type: String, required: true },
  },
  { timestamps: true } // Agrega createdAt y updatedAt automáticamente
);

// Middleware para convertir productName a minúsculas antes de guardar
ProductSchema.pre("save", function (next) {
  this.productName = this.productName.toLowerCase();
  next();
});

module.exports = mongoose.model("Product", ProductSchema);

