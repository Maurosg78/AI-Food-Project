import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [barcode, setBarcode] = useState("");
  const [productName, setProductName] = useState("");
  const [restrictions, setRestrictions] = useState({
    glutenFree: false,
    allergenFree: false,
    localIngredient: "",
  });
  const [results, setResults] = useState(null);

  const handleBarcodeSubmit = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/barcode", { barcode });
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching barcode data:", error);
    }
  };
  
  const handleProductNameSubmit = async () => {
    try {
      const response = await axios.post("http://localhost:3000/api/verify", {
        ingredients: [productName],
      });
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching product name data:", error);
    }
  };

  const handleRestrictionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRestrictions((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>¡Bienvenido a Greensy!</h1>
      <h3>Analizar Ingredientes</h3>

      {/* Código de Barras */}
      <div>
        <h4>Código de Barras</h4>
        <input
          type="text"
          placeholder="Ingrese el código de barras"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
        />
        <button onClick={handleBarcodeSubmit}>Analizar</button>
      </div>

      <br />

      {/* Nombre del Producto */}
      <div>
        <h4>Nombre del Producto</h4>
        <input
          type="text"
          placeholder="Ingrese el nombre del producto"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <button onClick={handleProductNameSubmit}>Buscar</button>
      </div>

      <br />

      {/* Restricciones Opcionales */}
      <div>
        <h4>Restricciones Opcionales</h4>
        <label>
          <input
            type="checkbox"
            name="glutenFree"
            checked={restrictions.glutenFree}
            onChange={handleRestrictionChange}
          />
          Sin Gluten
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            name="allergenFree"
            checked={restrictions.allergenFree}
            onChange={handleRestrictionChange}
          />
          Sin Alérgenos
        </label>
        <br />
        <label>
          Ingrediente Local:
          <input
            type="text"
            name="localIngredient"
            value={restrictions.localIngredient}
            onChange={handleRestrictionChange}
          />
        </label>
      </div>

      <br />

      {/* Resultados */}
      {results && (
        <div>
          <h3>Resultados:</h3>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
