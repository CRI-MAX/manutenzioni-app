import React from "react";

/**
 * Visualizza un valore in una cella <td>, formattando automaticamente
 * date, numeri, booleani, link e fallback.
 * @param {any} value - Il valore da visualizzare
 * @param {string} [format] - Formato opzionale per le date ("locale", "iso")
 */
const DataCell = ({ value, format = "locale" }) => {
  const renderValue = () => {
    // 📅 Date oggetto
    if (value instanceof Date && !isNaN(value)) {
      return format === "iso" ? value.toISOString() : value.toLocaleDateString("it-IT");
    }

    // 📅 Stringa ISO
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      const parsed = new Date(value);
      return isNaN(parsed) ? value : format === "iso"
        ? parsed.toISOString()
        : parsed.toLocaleDateString("it-IT");
    }

    // 🔢 Numeri
    if (typeof value === "number") {
      return value.toLocaleString("it-IT");
    }

    // ✅ Booleani
    if (typeof value === "boolean") {
      return value ? "✔️" : "❌";
    }

    // 🔗 Link
    if (typeof value === "string" && /^https?:\/\//.test(value)) {
      const testo = value.length > 40 ? value.slice(0, 37) + "…" : value;
      return (
        <a href={value} target="_blank" rel="noopener noreferrer">
          🔗 {testo}
        </a>
      );
    }

    // 🧩 Array
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(", ") : "—";
    }

    // 🧠 Oggetti
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }

    // 🧹 Fallback
    return value ?? "—";
  };

  return <td>{renderValue()}</td>;
};

export default DataCell;