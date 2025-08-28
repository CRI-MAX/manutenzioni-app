import React from "react";

/**
 * 🏷️ Visualizza lo stato dell'intervento con badge colorato
 * @param {string} props.stato - Stato dell'intervento
 */
function BadgeStato({ stato }) {
  if (!stato || typeof stato !== "string") {
    return <span className="badge bg-secondary">—</span>;
  }

  const statoNormalizzato = stato.trim().toLowerCase();

  const mappaColori = {
    effettuato: "success",
    programmato: "warning",
    "in ritardo": "danger"
  };

  const colore = mappaColori[statoNormalizzato] || "secondary";

  const etichetta = stato
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return <span className={`badge bg-${colore}`}>{etichetta}</span>;
}

export default BadgeStato;