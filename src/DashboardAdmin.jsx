import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import NotifichePanel from "./NotifichePanel";

const DashboardAdmin = () => {
  const [stats, setStats] = useState({
    utenti: 0,
    interventi: 0,
    mezzi: 0,
    clienti: 0,
    effettuati: 0,
    programmati: 0,
    inRitardo: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [utentiSnap, interventiSnap, mezziSnap, clientiSnap] = await Promise.all([
          getDocs(collection(db, "UTENTI")),
          getDocs(collection(db, "INTERVENTI")),
          getDocs(collection(db, "MEZZI")),
          getDocs(collection(db, "CLIENTI")),
        ]);

        const interventi = interventiSnap.docs.map((doc) => doc.data());

        setStats({
          utenti: utentiSnap.size,
          interventi: interventiSnap.size,
          mezzi: mezziSnap.size,
          clienti: clientiSnap.size,
          effettuati: interventi.filter((i) => i.stato === "Effettuato").length,
          programmati: interventi.filter((i) => i.stato === "Programmato").length,
          inRitardo: interventi.filter((i) => i.stato === "In Ritardo").length,
        });
      } catch (error) {
        console.error("Errore nel caricamento delle statistiche:", error);
      }
    };

    fetchStats();
  }, []);

  const titoli = {
    utenti: "👤 Utenti registrati",
    interventi: "🛠️ Interventi totali",
    mezzi: "🚚 Mezzi censiti",
    clienti: "🏢 Clienti attivi",
    effettuati: "✅ Interventi effettuati",
    programmati: "📅 Programmati",
    inRitardo: "⏰ In ritardo",
  };

  return (
    <Container className="mt-4">
      <h3 className="mb-4">📊 Dashboard Amministratore</h3>
      <Row>
        {Object.entries(stats).map(([key, value]) => (
          <Col md={4} sm={6} xs={12} className="mb-3" key={key}>
            <Card className="shadow-sm text-center">
              <Card.Body>
                <Card.Title>{titoli[key] || key}</Card.Title>
                <h4 className="text-primary">{value}</h4>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="mt-5">
        <NotifichePanel />
      </div>
    </Container>
  );
};

export default DashboardAdmin;