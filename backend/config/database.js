const mongoose = require("mongoose");
require("dotenv").config();

const connectToDatabase = async () => {
  let retries = 5;
  while (retries) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ Conexión exitosa a MongoDB");
      break; // Salir del bucle si la conexión es exitosa
    } catch (error) {
      console.error(`❌ Error conectando a MongoDB (Intento ${6 - retries} de 5): ${error.message}`);
      retries -= 1;
      console.log("🔄 Reintentando en 5 segundos...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  if (!retries) {
    console.error("❌ No se pudo conectar a MongoDB después de múltiples intentos.");
    process.exit(1);
  }
};

module.exports = connectToDatabase;
