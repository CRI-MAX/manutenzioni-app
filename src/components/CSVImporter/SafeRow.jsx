import React from "react";
import SafeCell from "./SafeCell";

const SafeRow = ({ row }) => {
  return (
    <>
      {Object.entries(row).map(([key, value]) => (
        <td key={key}>
          <SafeCell value={value} />
        </td>
      ))}
    </>
  );
};

export default SafeRow;