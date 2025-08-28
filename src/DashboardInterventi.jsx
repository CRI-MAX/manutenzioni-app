import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Pie } from "react-chartjs-2";
import 'chart.js/auto';

function DashboardInterventi() {
  const [interventi, setInterventi] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "INTERVENTI"));
      const dati = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInterventi(dati);
    };
    fetchData();
  }, []);

  const conteggioStati = interventi.reduce((acc, i) => {
    acc[i.stato] = (acc[i.stato] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(conteggioStati),
    datasets: [{
      data: Object.values(conteggioStati),
      backgroundColor: ["#28a745", "#ffc107", "#dc3545"]
    }]
  };

  return (
    <div className="container mt-4">
      <h3>📊 Riepilogo Interventi</h3>
      <Pie data={data} />
      <ul className="mt-4">
        {Object.entries(conteggioStati).map(([stato, count]) => (
          <li key={stato}>{stato}: {count}</li>
        ))}
      </ul>
    </div>
  );
}

export default DashboardInterventi;