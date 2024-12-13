import React from "react";
import "./../styles/Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="logo">Greensy</div>
      <nav>
        <ul>
          <li>Inicio</li>
          <li>Sobre Nosotros</li>
          <li>Contacto</li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
