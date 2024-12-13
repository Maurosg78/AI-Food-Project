const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MVP API Documentation",
      version: "1.0.0",
      description: "La API MVP analiza ingredientes alimenticios, sugiere sustituciones más saludables y simula informes técnicos para la industria alimentaria.",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./routes/*.js", "./controllers/*.js"], // Mejor organización
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
