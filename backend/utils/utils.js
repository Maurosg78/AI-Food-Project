const fs = require("fs");
const stringSimilarity = require("string-similarity");

// Diccionario de correcciones comunes para normalizar errores de escritura
const corrections = {
  "harinadetrigo": "harina de trigo",
  "harinademaz": "harina de maíz",
  "aceitedeolivavirgenextra": "aceite de oliva virgen extra",
  "coliflor": "coliflor",
};

// Verificar y crear el directorio de logs si no existe
const ensureLogDirectory = () => {
  const logDir = "./logs";
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
};

// Cargar archivo JSON
const loadJSON = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    ensureLogDirectory();
    fs.appendFileSync("./logs/errors.log", `Error en ${filePath}: ${err.message}\n`);
    console.error(`Error leyendo el archivo ${filePath}:`, err.message);
    return {};
  }
};

// Limpiar y normalizar ingrediente
const cleanIngredient = (ingredient) => {
  return ingredient
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Elimina caracteres especiales
    .replace(/\(.*?\)/g, "") // Elimina contenido entre paréntesis
    .replace(/\[.*?\]/g, "") // Elimina contenido entre corchetes
    .replace(/\d+/g, "") // Elimina números
    .replace(/\s+/g, " ") // Reemplaza múltiples espacios por uno solo
    .trim();
};

// Registrar ingredientes no reconocidos
const logUnverifiedIngredient = (ingredient) => {
  try {
    ensureLogDirectory();
    fs.appendFileSync("./logs/unverifiedIngredients.log", `${ingredient}\n`);
  } catch (err) {
    console.error("Error escribiendo ingrediente no verificado:", err.message);
  }
};

// Buscar mejor coincidencia en objeto JSON
const findBestMatch = (ingredient, jsonObject) => {
  const cleanedIngredient = cleanIngredient(ingredient);
  const correctedIngredient = corrections[cleanedIngredient] || cleanedIngredient;
  const keys = Object.keys(jsonObject);

  // Coincidencia estricta
  if (keys.includes(correctedIngredient)) return correctedIngredient;

  // Coincidencia flexible usando string-similarity
  const matches = stringSimilarity.findBestMatch(correctedIngredient, keys);
  const bestMatch = matches.bestMatch;

  if (bestMatch.rating > 0.5) {
    return bestMatch.target; // Retorna la coincidencia más cercana si supera el umbral
  }

  logUnverifiedIngredient(correctedIngredient); // Registra ingrediente no reconocido
  return null; // Retorna null si no encuentra coincidencias aceptables
};

module.exports = { loadJSON, cleanIngredient, findBestMatch };

