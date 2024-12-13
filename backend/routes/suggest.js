// Importar dependencias
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Cargar sustituciones desde substitutions.json
const substitutionsPath = path.join(__dirname, "../substitutions.json");
let substitutions = {};

try {
  const data = fs.readFileSync(substitutionsPath, "utf8");
  substitutions = JSON.parse(data).sustituciones;
} catch (err) {
  console.error("Error cargando substitutions.json:", err);
}

// Endpoint para sugerir sustituciones
router.post("/suggest", (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients || !Array.isArray(ingredients)) {
    return res.status(400).json({
      status: "error",
      message: "El parámetro 'ingredients' es obligatorio y debe ser una lista."
    });
  }

  const suggestions = {};
  ingredients.forEach((ingredient) => {
    if (substitutions[ingredient]) {
      suggestions[ingredient] = substitutions[ingredient];
    } else {
      suggestions[ingredient] = { alternativa: "Sin sustituciones disponibles" };
    }
  });

  res.json({
    status: "success",
    suggestions
  });
});

module.exports = router;
