// Importar dependencias
const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const connectToDatabase = require("./config/database");
const Product = require("./models/Product");
const UnverifiedIngredient = require("./models/UnverifiedIngredient");
const { loadJSON, cleanIngredient, findBestMatch } = require("./utils/utils");

// Configurar variables de entorno
dotenv.config({ path: "./.env" });

// Verificar claves necesarias
if (!process.env.USDA_API_KEY || !process.env.MONGO_URI) {
  console.error(
    "Error: Asegúrate de que USDA_API_KEY y MONGO_URI estén configuradas en el archivo .env."
  );
  process.exit(1);
}

// Conectar a la base de datos
connectToDatabase();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: ["http://localhost:3001", "http://localhost:53439"], methods: ["GET", "POST"] }));
app.use(express.json());
app.use(morgan("dev"));

// Cargar archivos JSON
const substitutions = loadJSON("./config/substitutions.json")?.sustituciones || {};
const problematicIngredients = loadJSON("./config/problematicIngredients.json")?.problematicIngredients || {};

// Rutas
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Backend funcionando correctamente" });
});

app.post("/api/barcode", async (req, res) => {
  const { barcode } = req.body;

  if (!barcode) {
    return res.status(400).json({ status: "error", message: "Debes proporcionar un código de barras." });
  }

  try {
    let product = await Product.findOne({ barcode });

    if (!product) {
      const openFoodFactsData = await fetchOpenFoodFacts(barcode);

      if (openFoodFactsData) {
        const { productName, ingredients, nutrients } = openFoodFactsData;

        let finalIngredients = ingredients;
        if (!ingredients.length && productName) {
          const usdaData = await fetchUSDAData(productName);
          finalIngredients = usdaData.ingredients || [];
        }

        if (!finalIngredients.length) {
          return res.status(404).json({
            status: "error",
            message: `El producto "${productName || "desconocido"}" no tiene ingredientes disponibles para análisis.`,
            nutrients,
          });
        }

        product = new Product({
          barcode,
          productName,
          ingredients: finalIngredients,
          nutrients,
          source: "OpenFoodFacts y USDA",
        });

        await product.save();
      } else {
        return res.status(404).json({ status: "error", message: "Producto no encontrado en OpenFoodFacts." });
      }
    }

    const { problematicDetails, suggestedAlternatives } = await analyzeIngredients(product.ingredients);
    const unverifiedIngredients = await saveUnverifiedIngredients(product.ingredients);
    const europeanWarnings = analyzeEuropeanWarnings(product.nutrients);

    res.json({
      status: "success",
      product: product.productName,
      ingredients: product.ingredients,
      nutrients: product.nutrients,
      problematicDetails,
      suggestedAlternatives,
      unverifiedIngredients,
      europeanWarnings,
    });
  } catch (error) {
    console.error("Error en /api/barcode:", error.message);
    res.status(500).json({ status: "error", message: "Error interno del servidor." });
  }
});

// Funciones auxiliares
const fetchOpenFoodFacts = async (barcode) => {
  try {
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    const response = await axios.get(url, { timeout: 20000 });

    if (response.data?.product) {
      const product = response.data.product;

      const cleanedIngredients = product.ingredients_text
        ? product.ingredients_text.split(/[,;]+/).map(cleanIngredient).filter(Boolean)
        : [];

      return {
        productName: product.product_name || "Producto desconocido",
        ingredients: cleanedIngredients,
        nutrients: product.nutriments || {},
      };
    }
    return null;
  } catch (error) {
    console.error(`Error en OpenFoodFacts para ${barcode}:`, error.message);
    return null;
  }
};

const fetchUSDAData = async (query) => {
  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${query}&pageSize=1&api_key=${process.env.USDA_API_KEY}`;
    const response = await axios.get(url, { timeout: 10000 });

    if (response.data?.foods?.length > 0) {
      const food = response.data.foods[0];
      const nutrients = food.foodNutrients.reduce((acc, nutrient) => {
        if (nutrient.nutrientName === "Fatty acids, total saturated") acc.saturatedFat = nutrient.value;
        if (nutrient.nutrientName === "Fiber, total dietary") acc.fiber = nutrient.value;
        if (nutrient.nutrientName === "Protein") acc.protein = nutrient.value;
        if (nutrient.nutrientName === "Carbohydrate, by difference") acc.carbohydrates = nutrient.value;
        return acc;
      }, {});

      const ingredients = food.description.split(/[,;]+/).map(cleanIngredient).filter(Boolean);

      return { nutrients, ingredients };
    }
  } catch (error) {
    console.error(`Error en USDA API para ${query}:`, error.message);
    return { nutrients: {}, ingredients: [] };
  }
};

const analyzeIngredients = async (ingredients) => {
  const problematicDetails = {};
  const suggestedAlternatives = {};

  for (const ingredient of ingredients) {
    const cleanedIngredient = cleanIngredient(ingredient);
    const match = findBestMatch(cleanedIngredient, problematicIngredients);

    if (match) {
      problematicDetails[match] = {
        reason: problematicIngredients[match].reason || "Razón desconocida.",
        suggestedSubstitutes: problematicIngredients[match].suggestedSubstitutes || [],
      };
      suggestedAlternatives[match] = await Promise.all(
        problematicIngredients[match].suggestedSubstitutes.map(async (substitute) => {
          const usdaData = await fetchUSDAData(substitute);
          return { substitute, nutrients: usdaData.nutrients };
        })
      );
    }
  }

  return { problematicDetails, suggestedAlternatives };
};

const saveUnverifiedIngredients = async (ingredients) => {
  const unverified = ingredients
    .map(cleanIngredient)
    .filter((ingredient) => !findBestMatch(ingredient, problematicIngredients));

  for (const name of unverified) {
    try {
      await UnverifiedIngredient.updateOne(
        { name },
        { $set: { name } },
        { upsert: true }
      );
    } catch (err) {
      console.error(`Error guardando ingrediente no verificado: ${name}`, err.message);
    }
  }

  return unverified;
};

const analyzeEuropeanWarnings = (nutrients) => {
  const warnings = [];

  if (nutrients.energy > 250) warnings.push("Alto en calorías");
  if (nutrients.sugars > 10) warnings.push("Alto en azúcares");
  if (nutrients.saturatedFat > 3) warnings.push("Alto en grasas saturadas");
  if (nutrients.sodium > 0.4) warnings.push("Alto en sodio");

  return warnings;
};

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
