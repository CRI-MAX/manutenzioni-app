import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";

function DashboardInterventi() {
  const [interventi, setInterventi] = useState([]);
  const [filtroStato, setFiltroStato] = useState("Tutti");
  const [filtroTecnico, setFiltroTecnico] = useState("Tutti");
  const [filtroDataDa, setFiltroDataDa] = useState("");
  const [filtroDataA, setFiltroDataA] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "INTERVENTI"));
        const dati = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInterventi(dati);
      } catch (error) {
        console.error("Errore nel caricamento interventi:", error);
      }
    };
    fetchData();
  }, []);

  const conteggioStati = interventi.reduce((acc, i) => {
    const stato = typeof i.stato === "string" && i.stato.trim() !== ""
      ? i.stato.trim()
      : "Non definito";
    acc[stato] = (acc[stato] || 0) + 1;
    return acc;
  }, {});

  const coloriStato = {
    Effettuato: "#28a745",
    Programmato: "#ffc107",
    "In Ritardo": "#dc3545",
    "Non definito": "#6c757d"
  };

  const data = {
    labels: Object.keys(conteggioStati),
    datasets: [{
      data: Object.values(conteggioStati),
      backgroundColor: Object.keys(conteggioStati).map(
        stato => coloriStato[stato] || "#999"
      )
    }]
  };

  const interventiFiltrati = interventi.filter(i => {
    const statoMatch = filtroStato === "Tutti" || (i.stato || "Non definito").trim() === filtroStato;
    const tecnicoMatch = filtroTecnico === "Tutti" || (i.tecnico || "").trim() === filtroTecnico;

    const dataIntervento = i.data ? new Date(i.data) : null;
    const daMatch = filtroDataDa ? dataIntervento && dataIntervento >= new Date(filtroDataDa) : true;
    const aMatch = filtroDataA ? dataIntervento && dataIntervento <= new Date(filtroDataA) : true;

    return statoMatch && tecnicoMatch && daMatch && aMatch;
  });

  const tecniciUnici = [...new Set(interventi.map(i => i.tecnico).filter(Boolean))];

  const esportaExcel = () => {
    const ws = XLSX.utils.json_to_sheet(interventiFiltrati);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Interventi");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "interventi_filtrati.xlsx");
  };

  const intestazioniCSV = [
    { label: "Titolo", key: "titolo" },
    { label: "Stato", key: "stato" },
    { label: "Data", key: "data" },
    { label: "Cliente", key: "cliente" },
    { label: "Tecnico", key: "tecnico" }
  ];

  return (
    <Container className="mt-4">
      <h3 className="mb-4">📊 Riepilogo Interventi</h3>

      {interventi.length > 0 ? (
        <>
          <Card className="p-4 shadow-sm mb-4">
            <Pie data={data} />
            <ul className="mt-4">
              {Object.entries(conteggioStati).map(([stato, count]) => (
                <li key={stato}>
                  <strong>{stato}:</strong> {count}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-3 shadow-sm mb-4">
            <Form className="row g-3">
              <Form.Group className="col-md-4">
                <Form.Label>Stato</Form.Label>
                <Form.Select value={filtroStato} onChange={(e) => setFiltroStato(e.target.value)}>
                  <option value="Tutti">Tutti</option>
                  {Object.keys(conteggioStati).map((stato) => (
                    <option key={stato} value={stato}>{stato}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="col-md-4">
                <Form.Label>Tecnico</Form.Label>
                <Form.Select value={filtroTecnico} onChange={(e) => setFiltroTecnico(e.target.value)}>
                  <option value="Tutti">Tutti</option>
                  {tecniciUnici.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="col-md-2">
                <Form.Label>Da</Form.Label>
                <Form.Control type="date" value={filtroDataDa} onChange={(e) => setFiltroDataDa(e.target.value)} />
              </Form.Group>

              <Form.Group className="col-md-2">
                <Form.Label>A</Form.Label>
                <Form.Control type="date" value={filtroDataA} onChange={(e) => setFiltroDataA(e.target.value)} />
              </Form.Group>
            </Form>
          </Card>

          <Card className="p-3 shadow-sm mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">📋 Interventi filtrati: {interventiFiltrati.length}</h5>
              <div className="d-flex gap-2">
                <CSVLink
                  data={interventiFiltrati}
                  headers={intestazioniCSV}
                  filename="interventi_filtrati.csv"
                  className="btn btn-outline-primary btn-sm"
                >
                  📤 CSV
                </CSVLink>
                <Button variant="outline-success" size="sm" onClick={esportaExcel}>
                  📊 Excel
                </Button>
              </div>
            </div>
            <ul>
              {interventiFiltrati.map((i) => (
                <li key={i.id}>
                  <strong>{i.titolo || "Intervento"}</strong> — {i.stato || "Non definito"} — {i.tecnico || "?"}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-3 shadow-sm mb-4">
            <h5 className="mb-3">👨‍🔧 Riepilogo per tecnico</h5>
            {tecniciUnici.length > 0 ? (
              <ul>
                {tecniciUnici.map((tecnico) => {
                  const assegnati = interventi.filter(i => i.tecnico === tecnico);
                  const perStato = assegnati.reduce((acc, i) => {
                    const stato = i.stato || "Non definito";
                    acc[stato] = (acc[stato] || 0) + 1;
                    return acc;
                  }, {});
                  return (
                    <li key={tecnico} className="mb-2">
                      <strong>{tecnico}</strong> — {assegnati.length} interventi
                      <ul className="ms-3">
                        {Object.entries(perStato).map(([stato, count]) => (
                          <li key={stato}>
                            {stato}: {count}
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted">Nessun tecnico assegnato.</p>
            )}
          </Card>
        </>
      ) : (
        <p className="text-muted">🔄 Nessun intervento disponibile al momento.</p>
      )}
    </Container