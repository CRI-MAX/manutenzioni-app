import React from "react";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const tipoIcone = {
  avviso: "🔔",
  errore: "❌",
  conferma: "✅",
  info: "ℹ️"
};

const tipoColori = {
  avviso: "warning",
  errore: "danger",
  conferma: "success",
  info: "info"
};

/**
 * Visualizza una singola notifica in stile card.
 * @param {Object} props
 * @param {Object} props.notifica - Oggetto notifica
 * @param {Function} [props.onSegnaComeLetta] - Callback opzionale
 */
const NotificheCard = ({ notifica, onSegnaComeLetta }) => {
  const { tipo = "info", messaggio, timestamp, id } = notifica;

  const badge = (
    <Badge bg={tipoColori[tipo] || "secondary"} className="me-2">
      {tipoIcone[tipo] || "🔔"} {tipo}
    </Badge>
  );

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <OverlayTrigger placement="top" overlay={<Tooltip>Tipo: {tipo}</Tooltip>}>
              <span>{badge}</span>
            </OverlayTrigger>
            <small className="text-muted">
              {timestamp ? new Date(timestamp).toLocaleString("it-IT") : "—"}
            </small>
          </div>
          {onSegnaComeLetta && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => onSegnaComeLetta(id)}
              title="Segna come letta"
            >
              ✅
            </Button>
          )}
        </div>
        <Card.Text>{messaggio || "—"}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default NotificheCard;