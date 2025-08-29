import React from "react";
import Table from "react-bootstrap/Table";
import DateDisplay from "./components/DateDisplay";
import BadgeStato from "./components/BadgeStato";
import LogoAziendale from "./components/LogoAziendale";

/**
 * Report stampabile degli interventi filtrati.
 * Ideale per PDF o documentazione tecnica.
 */
const InterventiFiltratiReport = ({ interventi = [], titolo = "Report Interventi" }) => {
  return (
    <div className="p-4">
      <div className="d-flex align-items-center mb-4">
        <LogoAziendale altezza={50} className="me-3" />
        <div>
          <h4 className="mb-0">{titolo}</h4>
          <small className="text-muted">Generato il {new Date().toLocaleDateString("it-IT")}</small>
        </div>
      </div>

      <Table striped bordered responsive>
        <thead className="table-light">
          <tr>
            <th>Data</th>
            <th>Cliente</th>
            <th>Tipo</th>
            <th>Tecnico</th>
            <th>Note</th>
            <th>Stato</th>
          </tr>
        </thead>
        <tbody>
          {interventi.length > 0 ? (
            interventi.map((i) => (
              <tr key={i.id}>
                <td><DateDisplay data={i.data} /></td>
                <td>{i.cliente || "—"}</td>
                <td>{i.tipo || "—"}</td>
                <td>{i.tecnico || "—"}</td>
                <td>{i.note || "—"}</td>
                <td><BadgeStato stato={i.stato} /></td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                Nessun intervento disponibile.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default InterventiFiltratiReport;