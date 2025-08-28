import React, { useState } from "react";

const LogoAziendale = ({
  altezza = 60,
  larghezza,
  stile = {},
  className = "",
  alt = "Logo Aziendale"
}) => {
  const [visibile, setVisibile] = useState(true);
  const src = `${process.env.PUBLIC_URL}/logo.png`;

  const handleError = (e) => {
    setVisibile(false);
    console.warn("⚠️ Logo non trovato:", src);
  };

  if (!visibile) return null;

  return (
    <img
      src={src}
      alt={alt}
      onError={handleError}
      style={{
        height: `${altezza}px`,
        ...(larghezza ? { width: `${larghezza}px` } : {}),
        objectFit: "contain",
        ...stile
      }}
      className={className}
    />
  );
};

export default LogoAziendale;