import React from "react";

/**
 * 📅 Componente per visualizzare una data formattata
 * @param {Date|string|null} props.data - Oggetto Date o stringa ISO
 * @param {string} props.formato - Formato di visualizzazione (opzionale)
 */
function DateDisplay({ data, formato = "it-IT" }) {
  if (!data) return <span className="text-muted">—</span>;

  let dataObj;

  try {
    dataObj = typeof data === "string" ? new Date(data) : data;
    if (isNaN(dataObj.getTime())) throw new Error("Data non valida");
  } catch {
    return <span className="text-danger">❌ Data non valida</span>;
  }

  const dataFormattata = dataObj.toLocaleDateString(formato, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  return <span>{dataFormattata}</span>;
}

export default DateDisplay;