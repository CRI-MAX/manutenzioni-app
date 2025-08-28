import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";

function DashboardInterventi() {
  const [interventi, setInterventi] = useState([]);

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
    const stato = i.stato || "Non definito";
    acc[stato] = (acc[stato] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(conteggioStati),
    datasets: [{
      data: Object.values(conteggioStati),
      backgroundColor: ["#28a745", "#ffc107", "#dc3545", "#6c757d"]
    }]
  };

  return (
    <div className="container mt-4">
      <h3>📊 Riepilogo Interventi</h3>

      {interventi.length > 0 ? (
        <>
          <Pie data={data} />
          <ul className="mt-4">
            {Object.entries(conteggioStati).map(([stato, count]) => (
              <li key={stato}>
                <strong>{stato}:</strong> {count}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-muted">🔄 Nessun intervento disponibile al momento.</p>
      )}
    </div>
  );
}

export default DashboardInterventi;