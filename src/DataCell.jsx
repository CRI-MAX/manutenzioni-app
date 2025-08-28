import React from "react";

/**
 * Visualizza un valore in una cella, formattando automaticamente
 * date, numeri, booleani e link.
 * @param {any} value - Il valore da visualizzare
 * @param {string} [format] - Formato opzionale per le date ("locale", "iso")
 */
const DataCell = ({ value, format = "locale" }) => {
  // 📅 Date
  if (value instanceof Date) {
    return (
      <td>
        {format === "iso"
          ? value.toISOString()
          : value.toLocaleDateString("it-IT")}
      </td>
    );
  }

  // 📅 Stringa ISO
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const parsed = new Date(value);
    return (
      <td>
        {format === "iso"
          ? parsed.toISOString()
          : parsed.toLocaleDateString("it-IT")}
      </td>
    );
  }

  // 🔢 Numeri
  if (typeof value === "number") {
    return <td>{value.toLocaleString("it-IT")}</td>;
  }

  // ✅ Booleani
  if (typeof value === "boolean") {
    return <td>{value ? "✔️" : "❌"}</td>;
  }

  // 🔗 Link
  if (typeof value === "string" && /^https?:\/\//.test(value)) {
    return (
      <td>
        <a href={value} target="_blank" rel="noopener noreferrer">
          🔗 Apri link
        </a>
      </td>
    );
  }

  // 🧠 Fallback
  return <td>{value ?? "—"}</td>;
};

export default DataCell;