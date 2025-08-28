import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const StatisticheDashboard = () => {
  const [stats, setStats] = useState({
    clienti: 0,
    mezzi: 0,
    interventi: 0,
    utenti: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientiSnap, mezziSnap, interventiSnap, utentiSnap] = await Promise.all([
          getDocs(collection(db, "CLIENTI")),
          getDocs(collection(db, "MEZZI")),
          getDocs(collection(db, "INTERVENTI")),
          getDocs(collection(db, "UTENTI")),
        ]);

        setStats({
          clienti: clientiSnap.size,
          mezzi: mezziSnap.size,
          interventi: interventiSnap.size,
          utenti: utentiSnap.size,
        });
      } catch (error) {
        console.error("Errore nel caricamento delle statistiche:", error);
      }
    };

    fetchStats();
  }, []);

  const titoli = {
    clienti: "🏢 Clienti",
    mezzi: "🚚 Mezzi",
    interventi: "🛠️ Interventi",
    utenti: "👤 Utenti",
  };

  return (
    <Row className="mt-4">
      {Object.entries(stats).map(([key, value]) => (
        <Col md={3} sm={6} xs={12} className="mb-3" key={key}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>{titoli[key]}</Card.Title>
              <h4 className="text-primary">{value}</h4>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatisticheDashboard;