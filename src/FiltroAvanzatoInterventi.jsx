import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/**
 * Filtro avanzato per la dashboard interventi.
 */
const FiltroAvanzatoInterventi = ({
  cliente,
  tipo,
  tecnico,
  dataDa,
  dataA,
  allegatiPresenti,
  onClienteChange,
  onTipoChange,
  onTecnicoChange,
  onDataDaChange,
  onDataAChange,
  onAllegatiToggle,
  onReset,
  tecniciDisponibili = [],
  tipiDisponibili = []
}) => {
  return (
    <div className="d-flex flex-wrap gap-3 mb-4 align-items-end">
      <div>
        <Form.Label>Cliente</Form.Label>
        <Form.Control
          type="text"
          value={cliente}
          onChange={(e) => onClienteChange(e.target.value)}
          placeholder="🔍 Ragione sociale"
          style={{ maxWidth: "220px" }}
        />
      </div>

      <div>
        <Form.Label>Tipo intervento</Form.Label>
        <Form.Select
          value={tipo}
          onChange={(e) => onTipoChange(e.target.value)}
          style={{ maxWidth: "200px" }}
        >
          <option value="">Tutti i tipi</option>
          {tipiDisponibili.map((t, i) => (
            <option key={i} value={t}>{t}</option>
          ))}
        </Form.Select>
      </div>

      <div>
        <Form.Label>Tecnico</Form.Label>
        <Form.Select
          value={tecnico}
          onChange={(e) => onTecnicoChange(e.target.value)}
          style={{ maxWidth: "200px" }}
        >
          <option value="">Tutti i tecnici</option>
          {tecniciDisponibili.map((t, i) => (
            <option key={i} value={t}>{t}</option>
          ))}
        </Form.Select>
      </div>

      <div>
        <Form.Label>Da</Form.Label><br />
        <DatePicker
          selected={dataDa}
          onChange={onDataDaChange}
          dateFormat="dd/MM/yyyy"
          className="form-control"
          placeholderText="Data inizio"
        />
      </div>

      <div>
        <Form.Label>A</Form.Label><br />
        <DatePicker
          selected={dataA}
          onChange={onDataAChange}
          dateFormat="dd/MM/yyyy"
          className="form-control"
          placeholderText="Data fine"
          minDate={dataDa || null}
        />
      </div>

      <div className="form-check mt-2">
        <Form.Check
          type="checkbox"
          label="📎 Solo con allegati"
          checked={allegatiPresenti}
          onChange={onAllegatiToggle}
        />
      </div>

      <div>
        <Button variant="outline-secondary" onClick={onReset}>
          🔄 Reset filtri
        </Button>
      </div>
    </div>
  );
};

export default FiltroAvanzatoInterventi;