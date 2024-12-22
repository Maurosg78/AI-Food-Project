import React from "react";
import ReactDOM from "react-dom/client"; // Cambiado para usar createRoot
import App from "./components/App";
import './components/styles/index.css';


const root = ReactDOM.createRoot(document.getElementById("root")); // Ajuste para React 18
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);