import React, { useState } from "react";
import axios from "axios";

const Form = ({ setResults }) => {
  const [ingredients, setIngredients] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ingredients.trim()) {
      setError("Por favor, ingresa al menos un ingrediente.");
      return;
    }
    setError("");

    try {
      const response = await axios.post("http://localhost:3000/api/verify", {
        ingredients: ingredients.split(",").map((item) => item.trim()),
      });
      setResults(response.data);
    } catch (err) {
      setError("Hubo un problema al procesar tu solicitud.");
      console.error(err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Ingresa los ingredientes separados por comas:
          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Ej: palm oil, white flour"
          />
        </label>
        <button type="submit">Enviar</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Form;
