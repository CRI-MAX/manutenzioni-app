import React from "react";

const SafeCell = ({ value }) => {
  let display = "—";

  if (value instanceof Date) {
    display = value.toLocaleDateString("it-IT");
  } else if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const parsed = new Date(value);
    display = isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("it-IT");
  } else if (typeof value === "number") {
    display = value.toLocaleString("it-IT");
  } else if (typeof value === "boolean") {
    display = value ? "✔️" : "❌";
  } else if (typeof value === "string" && /^https?:\/\//.test(value)) {
    display = (
      <a href={value} target="_blank" rel="noopener noreferrer">
        🔗 Apri link
      </a>
    );
  } else if (typeof value === "object" && value !== null) {
    display = JSON.stringify(value, null, 2);
  } else if (typeof value === "string") {
    display = value;
  }

  return <>{display}</>;
};

export default SafeCell;