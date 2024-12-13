const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  barcode: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  ingredients: { type: [String], default: [] },
  nutrients: { type: Object, default: {} },
  source: { type: String, required: true },
});

module.exports = mongoose.model("Product", ProductSchema);
