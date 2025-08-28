import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FiltroMappaInterventi = ({
  stato,
  tecnico,
  dataDa,
  dataA,
  onStatoChange,
  onTecnicoChange,
  onDataDaChange,
  onDataAChange,
  onReset,
  tecniciDisponibili = []
}) => {
  return (
    <div className="d-flex flex-wrap gap-3 mb-3 align-items-end">
      <div>
        <Form.Label>Stato</Form.Label>
        <Form.Select
          value={stato}
          onChange={(e) => onStatoChange(e.target.value)}
          style={{ maxWidth: "200px" }}
        >
          <option value="">Tutti gli stati</option>
          <option value="Effettuato">✅ Effettuato</option>
          <option value="Programmato">📅 Programmato</option>
          <option value="In Ritardo">⏰ In Ritardo</option>
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
          {tecniciDisponibili.map((nome, i) => (
            <option key={i} value={nome}>{nome}</option>
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

export default FiltroMappaInterventi;