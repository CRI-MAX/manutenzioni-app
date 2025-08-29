import React, { useState } from "react";

const schemaValidazione = {
  ragioneSociale: "string",
  partitaIva: "string",
  referente: "string"
};

const isValid = (key, value) => {
  const tipo = schemaValidazione[key];
  if (!tipo) return true;
  if (value === undefined || value === "") return false;
  return typeof value === tipo;
};

export const validateRow = (row) =>
  Object.entries(schemaValidazione).every(([key]) => isValid(key, row[key]));

const SafeRowEditable = ({ row, onUpdate }) => {
  const [localRow, setLocalRow] = useState(row);

  const handleChange = (key, value) => {
    const updated = { ...localRow, [key]: value };
    setLocalRow(updated);
    onUpdate(updated);
  };

  return (
    <tr>
      {Object.entries(localRow).map(([key, value]) => {
        const valido = isValid(key, value);
        const style = valido ? {} : { backgroundColor: "#ffe6e6" };
        return (
          <td key={key} style={style}>
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              className="form-control form-control-sm"
            />
          </td>
        );
      })}
    </tr>
  );
};

export default SafeRowEditable;