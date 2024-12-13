import React, { useState } from "react";

const BarcodeForm = ({ onAnalyze }) => {
  const [barcode, setBarcode] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onAnalyze) {
      onAnalyze(barcode); // Asegúrate de que `onAnalyze` está definida
    } else {
      console.error("onAnalyze no está definida");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="barcode">Código de Barras:</label>
      <input
        type="text"
        id="barcode"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
      />
      <button type="submit">Analizar</button>
    </form>
  );
};

export default BarcodeForm;
