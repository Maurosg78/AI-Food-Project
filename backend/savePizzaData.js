const fs = require("fs");

// Simulación de datos de pizza (aquí pondremos los datos que obtienes de las APIs)
const pizzaData = [
  {
    description: "PIZZA",
    brandOwner: "Casey's Bakery",
    ingredients: [
      "CRUST: WHEAT FLOUR, WATER, SOYBEAN OIL, SUGAR, YEAST, SALT",
      "SAUCE: TOMATOES, WATER, SOYBEAN OIL",
      "CHEESE: CULTURED PASTEURIZED MILK"
    ],
    nutrients: {
      Protein: 10.6,
      "Total Fat": 9.22,
      Carbohydrate: 19.2,
      Calories: 199,
      Sodium: 461
    }
  },
  {
    description: "PIZZA",
    brandOwner: "The Kroger Co.",
    ingredients: [
      "CRUST: ENRICHED FLOUR, WATER, SOYBEAN OIL, SUGAR",
      "SAUCE: WATER, TOMATO PASTE, SPICES",
      "CHEESE: MOZZARELLA CHEESE SUBSTITUTE"
    ],
    nutrients: {
      Protein: 6.8,
      "Total Fat": 8.84,
      Carbohydrate: 32,
      Calories: 238,
      Sodium: 401
    }
  }
];

// Función para guardar los datos en un archivo JSON
function saveDataToFile(data, filename) {
  fs.writeFile(filename, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("Error al guardar los datos:", err);
    } else {
      console.log(`Datos guardados correctamente en ${filename}`);
    }
  });
}

// Guardar los datos en un archivo llamado "pizzaData.json"
saveDataToFile(pizzaData, "pizzaData.json");
