import React from "react";
import Button from "react-bootstrap/Button";
import { getDocs, collection } from "firebase/firestore";
import { db } from "./firebase";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

function EsportaStatisticheMezzi() {
  const handleExport = async () => {
    try {
      const snapshot = await getDocs(collection(db, "MEZZI"));
      const mezzi = snapshot.docs.map(doc => doc.data());

      const perCliente = {};
      const perMarca = {};

      mezzi.forEach(m => {
        const cliente = m.clienteId || "—";
        const marca = m.marca || "—";
        perCliente[cliente] = (perCliente[cliente] || 0) + 1;
        perMarca[marca] = (perMarca[marca] || 0) + 1;
      });

      const sheetCliente = XLSX.utils.json_to_sheet(
        Object.entries(perCliente).map(([cliente, count]) => ({
          Cliente: cliente,
          Mezzi: count
        }))
      );

      const sheetMarca = XLSX.utils.json_to_sheet(
        Object.entries(perMarca).map(([marca, count]) => ({
          Marca: marca,
          Mezzi: count
        }))
      );

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, sheetCliente, "PerCliente");
      XLSX.utils.book_append_sheet(wb, sheetMarca, "PerMarca");

      XLSX.writeFile(wb, "statistiche_mezzi.xlsx");
      toast.success("✅ Statistiche esportate con successo");
    } catch (error) {
      console.error("Errore esportazione:", error);
      toast.error("❌ Errore durante l'esportazione");
    }
  };

  return (
    <Button variant="info" onClick={handleExport}>
      📤 Esporta Statistiche Excel
    </Button>
  );
}

export default EsportaStatisticheMezzi;