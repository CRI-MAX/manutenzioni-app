import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import NotificheCard from "./NotificheCard";
import { useNotifiche } from "./hooks/useNotifiche";

const ListaNotifiche = ({ utenteEmail }) => {
  const [tipoFiltro, setTipoFiltro] = useState("");

  const { notifiche, caricamento, errore, refresh } = useNotifiche({
    utenteEmail: utenteEmail || null,
    tipo: tipoFiltro || null,
    autoRefresh: 60000 // ogni 60 secondi
  });

  const tipiDisponibili = ["avviso", "conferma", "errore", "info"];

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">🔔 Notifiche Recenti</h4>
        <Button variant="outline-secondary" size="sm" onClick={refresh} disabled={caricamento}>
          🔄 Aggiorna
        </Button>
      </div>

      <Form.Select
        value={tipoFiltro}
        onChange={(e) => setTipoFiltro(e.target.value)}
        className="mb-3"
        style={{ maxWidth: "250px" }}
      >
        <option value="">Tutti i tipi</option>
        {tipiDisponibili.map((tipo) => (
          <option key={tipo} value={tipo}>
            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
          </option>
        ))}
      </Form.Select>

      {caricamento && (
        <div className="text-center my-3">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-2">Caricamento notifiche...</p>
        </div>
      )}

      {errore && (
        <Alert variant="danger">
          ❌ Errore nel caricamento: {errore.message}
        </Alert>
      )}

      {!caricamento && notifiche.length === 0 ? (
        <p className="text-muted">Nessuna notifica disponibile.</p>
      ) : (
        notifiche.map((n) => (
          <NotificheCard key={n.id} notifica={n} />
        ))
      )}
    </div>
  );
};

export default ListaNotifiche;