import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

const StatisticheDashboard = () => {
  const [stats, setStats] = useState({
    clienti: 0,
    mezzi: 0,
    interventi: 0,
    utenti: 0,
  });
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
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

      setLastUpdate(new Date().toLocaleString("it-IT"));
    } catch (error) {
      console.error("Errore nel caricamento delle statistiche:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const titoli = {
    clienti: "🏢 Clienti",
    mezzi: "🚚 Mezzi",
    interventi: "🛠️ Interventi",
    utenti: "👤 Utenti",
  };

  const colori = {
    clienti: "primary",
    mezzi: "success",
    interventi: "warning",
    utenti: "info",
  };

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>📊 Statistiche Generali</h4>
        <Button variant="outline-secondary" onClick={fetchStats} disabled={loading}>
          {loading ? "Aggiornamento..." : "🔄 Aggiorna"}
        </Button>
      </div>

      <Row>
        {Object.entries(stats).map(([key, value]) => (
          <Col md={3} sm={6} xs={12} className="mb-3" key={key}>
            <Card className={`text-center border-${colori[key]} shadow-sm`}>
              <Card.Body>
                <Card.Title>{titoli[key]}</Card.Title>
                <h4 className={`text-${colori[key]}`}>{value}</h4>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {lastUpdate && (
        <p className="text-muted text-end mt-2" style={{ fontSize: "0.9em" }}>
          Ultimo aggiornamento: {lastUpdate}
        </p>
      )}
    </div>
  );
};

export default StatisticheDashboard;