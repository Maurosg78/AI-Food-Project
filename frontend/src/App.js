import React, { useState } from "react";
import axios from "axios";
import './styles/App.css';

function App() {
  const [barcode, setBarcode] = useState("");
  const [customRequest, setCustomRequest] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!barcode) {
      setError("Por favor, introduce un código de barras.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/barcode", {
        barcode,
        customRequest,
      });
      setResult(response.data);
    } catch (err) {
      setError("Error al analizar el producto. Intenta nuevamente.");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Análisis de Productos</h1>
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="barcode">Código de barras:</label>
            <input
              type="text"
              id="barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Introduce el código de barras"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="customRequest">Solicitud personalizada:</label>
            <textarea
              id="customRequest"
              value={customRequest}
              onChange={(e) => setCustomRequest(e.target.value)}
              placeholder="Ej: Incrementar vitamina B12, usar brócoli de Valencia"
            ></textarea>
          </div>
          <button type="submit">Analizar</button>
        </form>

        {error && <div className="error">{error}</div>}

        {result && (
          <div className="result">
            <h2>Resultados del análisis</h2>
            <p><strong>Producto:</strong> {result.product || "No disponible"}</p>
            <p>
              <strong>Ingredientes:</strong>{" "}
              {Array.isArray(result.ingredients) ? result.ingredients.join(", ") : "No disponible"}
            </p>
            <p><strong>Nutrientes:</strong></p>
            <ul>
              {result.nutrients
                ? Object.entries(result.nutrients).map(([key, value]) => (
                    <li key={key}>
                      {key}: {value}
                    </li>
                  ))
                : <li>No disponible</li>}
            </ul>
            <p>
              <strong>Advertencias europeas:</strong>{" "}
              {Array.isArray(result.europeanWarnings) ? result.europeanWarnings.join(", ") : "No disponible"}
            </p>
            <p><strong>Detalles problemáticos:</strong></p>
            <ul>
              {result.problematicDetails
                ? Object.entries(result.problematicDetails).map(([key, value]) => (
                    <li key={key}>
                      {key}: {value.reason}
                    </li>
                  ))
                : <li>No hay detalles problemáticos disponibles</li>}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
