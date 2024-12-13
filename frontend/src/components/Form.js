import React, { useState } from "react";

const Form = ({ onAnalyze }) => {
  const [ingredients, setIngredients] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAnalyze(ingredients);
    setIngredients("");
  };

  return (
    <div>
      <h3>Analizar Ingredientes</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ingresa los ingredientes separados por comas"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          required
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
};

export default Form;
