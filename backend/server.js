// Importar dependencias
const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const connectToDatabase = require("./config/database");
const Product = require("./models/Product"); // Modelo para guardar productos
const { swaggerUi, specs } = require("./config/swagger");

// Configurar variables de entorno
dotenv.config({ path: "./.env" });

// Verificar si las claves necesarias están configuradas
if (!process.env.USDA_API_KEY || !process.env.MONGO_URI) {
  console.error("Error: Asegúrate de que USDA_API_KEY y MONGO_URI estén configuradas en el archivo .env.");
  process.exit(1);
}

// Conectar a la base de datos
connectToDatabase();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({ origin: "http://localhost:3001", methods: ["GET", "POST"] }));
app.use(express.json());

// Documentación con Swagger
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

// Función para cargar JSON de un archivo
const loadJSON = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.warn(`Advertencia: No se pudo cargar ${filePath}.`, err);
    return {};
  }
};

// Cargar sustituciones y datos de ingredientes problemáticos
const substitutionsPath = path.join(__dirname, "substitutions.json");
const problematicIngredientsPath = path.join(__dirname, "config", "problematicIngredients.json");
const substitutions = loadJSON(substitutionsPath)?.sustituciones || {};
const problematicIngredients = loadJSON(problematicIngredientsPath)?.problematicIngredients || {};

/**
 * @swagger
 * /:
 *   get:
 *     summary: Verifica si el servidor está funcionando
 *     responses:
 *       200:
 *         description: El servidor está operativo.
 */
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Backend funcionando correctamente" });
});

/**
 * @swagger
 * /api/verify:
 *   post:
 *     summary: Verificar calidad de un alimento según sus ingredientes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de ingredientes para analizar.
 *     responses:
 *       200:
 *         description: Análisis completado con éxito.
 *       400:
 *         description: Debes proporcionar una lista de ingredientes.
 */
app.post("/api/verify", async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients || !Array.isArray(ingredients)) {
    return res.status(400).json({ status: "error", message: "Debes proporcionar una lista de ingredientes." });
  }

  try {
    const { problematicDetails, suggestedAlternatives } = await analyzeIngredients(ingredients);

    res.json({
      status: "success",
      problematicDetails,
      suggestedAlternatives,
    });
  } catch (error) {
    console.error("Error en /api/verify:", error.message);
    res.status(500).json({ status: "error", message: "Error interno del servidor." });
  }
});

/**
 * @swagger
 * /api/barcode:
 *   post:
 *     summary: Analizar los ingredientes de un producto basado en su código de barras
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               barcode:
 *                 type: string
 *                 description: Código de barras del producto.
 *     responses:
 *       200:
 *         description: Análisis completado con éxito.
 *       400:
 *         description: Debes proporcionar un código de barras válido.
 */
app.post("/api/barcode", async (req, res) => {
  const { barcode } = req.body;

  if (!barcode) {
    return res.status(400).json({ status: "error", message: "Debes proporcionar un código de barras." });
  }

  try {
    // Verificar si el producto ya existe en la base de datos
    let product = await Product.findOne({ barcode });

    if (!product) {
      // Buscar en OpenFoodFacts
      const openFoodFactsUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
      const openFoodFactsResponse = await axios.get(openFoodFactsUrl);

      if (openFoodFactsResponse.data && openFoodFactsResponse.data.product) {
        const { product_name: productName, ingredients_text: ingredients } = openFoodFactsResponse.data.product;

        product = new Product({
          barcode,
          productName: productName || "Producto desconocido",
          ingredients: ingredients ? ingredients.split(/,\s*/) : [],
          source: "OpenFoodFacts",
        });
        await product.save();
      } else {
        // Buscar en USDA si no se encuentra en OpenFoodFacts
        const usdaData = await fetchUSDAData(barcode);
        if (usdaData.productName) {
          product = new Product({
            barcode,
            productName: usdaData.productName,
            ingredients: usdaData.ingredients || [],
            nutrients: usdaData.nutrients || {},
            source: "USDA",
          });
          await product.save();
        }
      }
    }

    if (product) {
      const { problematicDetails, suggestedAlternatives } = await analyzeIngredients(product.ingredients);
      return res.json({
        status: "success",
        product: product.productName,
        ingredients: product.ingredients,
        nutrients: product.nutrients,
        problematicDetails,
        suggestedAlternatives,
      });
    } else {
      return res.status(404).json({ status: "error", message: "Producto no encontrado." });
    }
  } catch (error) {
    console.error("Error en /api/barcode:", error.message);
    return res.status(500).json({
      status: "error",
      message: `Error interno del servidor o problema al conectar con las APIs: ${error.message}`,
    });
  }
});

// Funciones auxiliares para analizar ingredientes
const analyzeIngredients = async (ingredients) => {
  const problematicDetails = {};
  const suggestedAlternatives = {};

  await Promise.all(
    ingredients.map(async (ingredient) => {
      const details = problematicIngredients[ingredient];
      if (details) {
        problematicDetails[ingredient] = {
          reason: details.reason,
          suggestedSubstitutes: details.suggestedSubstitutes,
          exceedsLimit: details.maxPerServing ? calculateExceedsLimit(ingredient, details.maxPerServing) : false,
        };
      }
      if (substitutions[ingredient]) {
        const alternative = substitutions[ingredient].alternativa;
        const comparison = await compareNutrients(ingredient, alternative);
        suggestedAlternatives[ingredient] = {
          alternativa: alternative,
          ventaja: substitutions[ingredient].ventaja,
          comparacion: comparison,
        };
      }
    })
  );

  return { problematicDetails, suggestedAlternatives };
};

const calculateExceedsLimit = (ingredient, maxLimit) => {
    // Supongamos que la cantidad por porción se pasa como un dato estático por ahora
    const servingAmount = 30; // Ejemplo: cantidad en gramos por porción
    return servingAmount > maxLimit;
  };

const compareNutrients = async (ingredient, alternative) => {
  try {
    const ingredientData = await fetchUSDAData(ingredient);
    const alternativeData = await fetchUSDAData(alternative);

    return {
      saturatedFat: {
        [ingredient]: `${ingredientData.saturatedFat || "N/A"} g`,
        [alternative]: `${alternativeData.saturatedFat || "N/A"} g`,
      },
      fiber: {
        [ingredient]: `${ingredientData.fiber || "N/A"} g`,
        [alternative]: `${alternativeData.fiber || "N/A"} g`,
      },
      protein: {
        [ingredient]: `${ingredientData.protein || "N/A"} g`,
        [alternative]: `${alternativeData.protein || "N/A"} g`,
      },
      carbohydrates: {
        [ingredient]: `${ingredientData.carbohydrates || "N/A"} g`,
        [alternative]: `${alternativeData.carbohydrates || "N/A"} g`,
      },
    };
  } catch (error) {
    console.error(`Error comparando nutrientes para ${ingredient} y ${alternative}:`, error.message);
    return "Nutritional comparison not available.";
  }
};

const fetchUSDAData = async (query) => {
    try {
      const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${query}&pageSize=1&api_key=${process.env.USDA_API_KEY}`;
      const response = await axios.get(url);
  
      if (response.data.foods && response.data.foods.length > 0) {
        const food = response.data.foods[0];
        const nutrients = food.foodNutrients.reduce((acc, nutrient) => {
          if (nutrient.nutrientName === "Fatty acids, total saturated") acc.saturatedFat = nutrient.value;
          if (nutrient.nutrientName === "Fiber, total dietary") acc.fiber = nutrient.value;
          if (nutrient.nutrientName === "Protein") acc.protein = nutrient.value;
          if (nutrient.nutrientName === "Carbohydrate, by difference") acc.carbohydrates = nutrient.value;
          if (nutrient.nutrientName === "Energy") acc.calories = nutrient.value;
          if (nutrient.nutrientName === "Sugars, total including NLEA") acc.sugar = nutrient.value;
          if (nutrient.nutrientName === "Sodium, Na") acc.sodium = nutrient.value;
          if (nutrient.nutrientName === "Vitamin C, total ascorbic acid") acc.vitaminC = nutrient.value;
          if (nutrient.nutrientName === "Calcium, Ca") acc.calcium = nutrient.value;
          if (nutrient.nutrientName === "Iron, Fe") acc.iron = nutrient.value;
          return acc;
        }, {});
  
        return {
          productName: food.description,
          ingredients: food.ingredients || [],
          nutrients,
        };
      } else {
        console.log(`No data found for ${query}`);
        return {};
      }
    } catch (error) {
      console.error(`Error fetching data for ${query}:`, error.message);
      return {};
    }
  };  

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
