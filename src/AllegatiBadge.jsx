import React from "react";
import Badge from "react-bootstrap/Badge";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

/**
 * Mostra un badge con il numero di allegati.
 * @param {Object} props
 * @param {Array} props.allegati - Array di allegati
 */
function AllegatiBadge({ allegati = [] }) {
  const count = Array.isArray(allegati) ? allegati.length : 0;

  const tooltipText =
    count === 0
      ? "Nessun allegato disponibile"
      : `${count} allegato${count > 1 ? "i" : ""} disponibile`;

  return (
    <OverlayTrigger placement="top" overlay={<Tooltip>{tooltipText}</Tooltip>}>
      <Badge bg={count > 0 ? "primary" : "secondary"} className="px-2 py-1">
        📎 {count}
      </Badge>
    </OverlayTrigger>
  );
}

export default AllegatiBadge;