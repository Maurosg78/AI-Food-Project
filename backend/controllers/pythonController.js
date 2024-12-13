const express = require("express");
const { runPythonScript } = require("../services/pythonService");

const router = express.Router();

router.post("/process", async (req, res) => {
  const { data } = req.body; // Datos enviados desde el cliente.
  try {
    const scriptPath = "python/main.py"; // Ruta al script Python.
    const result = await runPythonScript(scriptPath, [JSON.stringify(data)]);
    res.json({ success: true, result: JSON.parse(result) });
  } catch (error) {
    console.error("Error en el controlador de Python:", error);
    res.status(500).json({ success: false, error: error });
  }
});

module.exports = router;
