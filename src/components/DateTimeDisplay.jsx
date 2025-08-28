import React from "react";

/**
 * 📅 Componente per visualizzare data e ora formattate
 * @param {Date|string|null} props.data - Oggetto Date o stringa ISO
 * @param {string} props.locale - Localizzazione (default: "it-IT")
 * @param {boolean} props.mostraOra - Se true, mostra anche l'orario
 */
function DateTimeDisplay({ data, locale = "it-IT", mostraOra = true }) {
  if (!data) return <span className="text-muted">—</span>;

  let dataObj;

  try {
    dataObj = typeof data === "string" ? new Date(data) : data;
    if (isNaN(dataObj.getTime())) throw new Error("Data non valida");
  } catch {
    return <span className="text-danger">❌ Data non valida</span>;
  }

  const opzioni = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(mostraOra && { hour: "2-digit", minute: "2-digit" })
  };

  const formattata = dataObj.toLocaleString(locale, opzioni);

  return <span>{formattata}</span>;
}

export default DateTimeDisplay;