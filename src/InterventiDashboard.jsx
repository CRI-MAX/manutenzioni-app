import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import FiltroAvanzatoInterventi from "./FiltroAvanzatoInterventi";
import InterventiFiltratiTable from "./InterventiFiltratiTable";
import InviaReportEmailForm from "./InviaReportEmailForm";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";

const InterventiDashboard = () => {
  const [interventi, setInterventi] = useState([]);
  const [cliente, setCliente] = useState("");
  const [tipo, setTipo] = useState("");
  const [tecnico, setTecnico] = useState("");
  const [dataDa, setDataDa] = useState(null);
  const [dataA, setDataA] = useState(null);
  const [allegatiPresenti, setAllegatiPresenti] = useState(false);

  useEffect(() => {
    const fetchInterventi = async () => {
      const snapshot = await getDocs(collection(db, "INTERVENTI"));
      const dati = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInterventi(dati);
    };
    fetchInterventi();
  }, []);

  const filtrati = interventi.filter((i) => {
    const matchCliente = cliente === "" || (i.cliente || "").toLowerCase().includes(cliente.toLowerCase());
    const matchTipo = tipo === "" || i.tipo === tipo;
    const matchTecnico = tecnico === "" || i.tecnico === tecnico;

    const dataIntervento = i.data?.toDate?.() || null;
    const matchDataDa = !dataDa || (dataIntervento && dataIntervento >= dataDa);
    const matchDataA = !dataA || (dataIntervento && dataIntervento <= dataA);

    const matchAllegati = !allegatiPresenti || (Array.isArray(i.allegati) && i.allegati.length > 0);

    return matchCliente && matchTipo && matchTecnico && matchDataDa && matchDataA && matchAllegati;
  });

  const conteggioStati = filtrati.reduce((acc, i) => {
    const stato = i.stato || "Non definito";
    acc[stato] = (acc[stato] || 0) + 1;
    return acc;
  }, {});

  const conteggioTecnici = filtrati.reduce((acc, i) => {
    const nome = i.tecnico || "—";
    acc[nome] = (acc[nome] || 0) + 1;
    return acc;
  }, {});

  const riepilogoTecnici = Object.entries(conteggioTecnici).map(([nome, count]) => {
    const interventiTecnico = filtrati.filter(i => i.tecnico === nome);
    const stati = interventiTecnico.reduce((acc, i) => {
      const stato = i.stato || "Non definito";
      acc[stato] = (acc[stato] || 0) + 1;
      return acc;
    }, {});
    return { nome, count, stati };
  });

  const coloriStato = {
    Effettuato: "#28a745",
    Programmato: "#ffc107",
    "In Ritardo": "#dc3545",
    "Non definito": "#6c757d"
  };

  const dataGraficoStato = {
    labels: Object.keys(conteggioStati),
    datasets: [{
      data: Object.values(conteggioStati),
      backgroundColor: Object.keys(conteggioStati).map(stato => coloriStato[stato] || "#999")
    }]
  };

  const dataGraficoTecnici = {
    labels: Object.keys(conteggioTecnici),
    datasets: [{
      label: "Interventi per tecnico",
      data: Object.values(conteggioTecnici),
      backgroundColor: "#0d6efd"
    }]
  };

  const handleReset = () => {
    setCliente("");
    setTipo("");
    setTecnico("");
    setDataDa(null);
    setDataA(null);
    setAllegatiPresenti(false);
  };

  return (
    <Container className="mt-4">
      <h3 className="mb-4">🛠️ Dashboard Interventi</h3>

      <FiltroAvanzatoInterventi
        cliente={cliente}
        tipo={tipo}
        tecnico={tecnico}
        dataDa={dataDa}
        dataA={dataA}
        allegatiPresenti={allegatiPresenti}
        onClienteChange={setCliente}
        onTipoChange={setTipo}
        onTecnicoChange={setTecnico}
        onDataDaChange={setDataDa}
        onDataAChange={setDataA}
        onAllegatiToggle={() => setAllegatiPresenti(!allegatiPresenti)}
        onReset={handleReset}
        tecniciDisponibili={[...new Set(interventi.map(i => i.tecnico).filter(Boolean))]}
        tipiDisponibili={[...new Set(interventi.map(i => i.tipo).filter(Boolean))]}
      />

      {filtrati.length > 0 && (
        <>
          <div className="mb-4">
            <h5 className="mb-3">📊 Distribuzione Stato Interventi</h5>
            <Pie data={dataGraficoStato} />
          </div>

          <div className="mb-4">
            <h5 className="mb-3">👨‍🔧 Interventi per Tecnico</h5>
            <Bar data={dataGraficoTecnici} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>

          <Card className="p-3 shadow-sm mb-4">
            <h5 className="mb-3">📋 Riepilogo per tecnico</h5>
            <ul>
              {riepilogoTecnici.map(({ nome, count, stati }) => (
                <li key={nome} className="mb-2">
                  <strong>{nome}</strong> — {count} interventi
                  <ul className="ms-3">
                    {Object.entries(stati).map(([stato, n]) => (
                      <li key={stato}>{stato}: {n}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}

      <InterventiFiltratiTable
        cliente={cliente}
        tipo={tipo}
        tecnico={tecnico}
        dataDa={dataDa}
        dataA={dataA}
        allegatiPresenti={allegatiPresenti}
      />

      <InviaReportEmailForm interventi={filtrati} />
    </Container>
  );
};

export default InterventiDashboard;