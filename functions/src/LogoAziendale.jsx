import React from "react";

const LogoAziendale = ({ altezza = 60, stile = {}, className = "" }) => {
  const src = `${process.env.PUBLIC_URL}/logo.png`;

  const handleError = (e) => {
    e.target.style.display = "none";
    console.warn("⚠️ Logo non trovato:", src);
  };

  return (
    <img
      src={src}
      alt="Logo Aziendale"
      onError={handleError}
      style={{ height: `${altezza}px`, ...stile }}
      className={className}
    />
  );
};

export default LogoAziendale;