import React, { useState } from "react";
import axios from "axios";
import "./../styles/Analyzer.css";

const Analyzer = () => {
  const [ingredients, setIngredients] = useState("");
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/verify", {
        ingredients: ingredients.split(",").map((item) => item.trim()),
      });
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="analyzer">
      <h2>Analiza tus ingredientes</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ejemplo: palm oil, white flour"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
        <button type="submit">Analizar</button>
      </form>
      {results && (
        <div className="results">
          <h3>Resultados:</h3>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Analyzer;
