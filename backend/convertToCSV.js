const fs = require("fs");
const path = require("path");
const { parse } = require("json2csv");

// Leer los datos JSON desde el archivo
const inputFile = path.join(__dirname, "pizzaData.json");
const outputFile = path.join(__dirname, "pizzaData.csv");

// Función para convertir JSON a CSV
function convertJSONToCSV(input, output) {
  fs.readFile(input, "utf8", (err, data) => {
    if (err) {
      console.error("Error al leer el archivo JSON:", err);
      return;
    }

    try {
      const jsonData = JSON.parse(data);

      // Configuración de los campos para el CSV
      const fields = [
        "description",
        "brandOwner",
        "ingredients",
        "nutrients.Protein",
        "nutrients.Total Fat",
        "nutrients.Carbohydrate",
        "nutrients.Calories",
        "nutrients.Sodium"
      ];

      // Convertir a CSV
      const csv = parse(jsonData, { fields });
      fs.writeFile(output, csv, (err) => {
        if (err) {
          console.error("Error al guardar el archivo CSV:", err);
        } else {
          console.log(`Datos convertidos a CSV correctamente en ${output}`);
        }
      });
    } catch (error) {
      console.error("Error al convertir JSON a CSV:", error);
    }
  });
}

// Convertir los datos y guardarlos como CSV
convertJSONToCSV(inputFile, outputFile);
