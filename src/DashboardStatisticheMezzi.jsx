import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Bar, Pie } from "react-chartjs-2";
import Button from "react-bootstrap/Button";
import EsportaStatisticheMezzi from "./EsportaStatisticheMezzi";
import "chart.js/auto";

function DashboardStatisticheMezzi() {
  const [mezzi, setMezzi] = useState([]);
  const [caricamento, setCaricamento] = useState(true);

  useEffect(() => {
    const fetchMezzi = async () => {
      try {
        const snapshot = await getDocs(collection(db, "MEZZI"));
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMezzi(lista);
      } catch (error) {
        console.error("Errore nel recupero mezzi:", error);
      } finally {
        setCaricamento(false);
      }
    };
    fetchMezzi();
  }, []);

  const conteggioPerCliente = mezzi.reduce((acc, m) => {
    const cliente = m.clienteId || "—";
    acc[cliente] = (acc[cliente] || 0) + 1;
    return acc;
  }, {});

  const conteggioPerMarca = mezzi.reduce((acc, m) => {
    const marca = m.marca || "—";
    acc[marca] = (acc[marca] || 0) + 1;
    return acc;
  }, {});

  const palette = ["#0d6efd", "#198754", "#ffc107", "#dc3545", "#6c757d", "#20c997", "#6610f2"];

  const graficoCliente = {
    labels: Object.keys(conteggioPerCliente),
    datasets: [
      {
        label: "Mezzi per Cliente",
        data: Object.values(conteggioPerCliente),
        backgroundColor: "#0d6efd"
      }
    ]
  };

  const graficoMarca = {
    labels: Object.keys(conteggioPerMarca),
    datasets: [
      {
        label: "Mezzi per Marca",
        data: Object.values(conteggioPerMarca),
        backgroundColor: Object.keys(conteggioPerMarca).map((_, i) => palette[i % palette.length])
      }
    ]
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>📊 Statistiche Mezzi</h3>
        <EsportaStatisticheMezzi />
      </div>

      {caricamento ? (
        <p className="text-muted">🔄 Caricamento dati...</p>
      ) : mezzi.length === 0 ? (
        <p className="text-muted">Nessun dato disponibile per generare statistiche.</p>
      ) : (
        <Row>
          <Col md={6} className="mb-4">
            <Card className="p-3 shadow-sm">
              <h5 className="mb-3">👥 Mezzi per Cliente</h5>
              <Bar
                data={graficoCliente}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } }
                }}
              />
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="p-3 shadow-sm">
              <h5 className="mb-3">🚚 Mezzi per Marca</h5>
              <Pie
                data={graficoMarca}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "bottom" } }
                }}
              />
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default DashboardStatisticheMezzi;