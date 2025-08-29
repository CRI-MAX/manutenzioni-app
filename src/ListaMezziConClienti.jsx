import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const ListaMezziConClientiPDF = () => {
  const [mezzi, setMezzi] = useState([]);
  const [clientiMap, setClientiMap] = useState({});
  const [filtroCliente, setFiltroCliente] = useState("Tutti");

  useEffect(() => {
    const fetchData = async () => {
      const clientiSnapshot = await getDocs(collection(db, "CLIENTI"));
      const clienti = {};
      clientiSnapshot.forEach(doc => {
        clienti[doc.id] = doc.data();
      });
      setClientiMap(clienti);

      const mezziSnapshot = await getDocs(collection(db, "MEZZI"));
      const datiMezzi = mezziSnapshot.docs.map(doc => {
        const data = doc.data();
        const cliente = clienti[data.clienteId] || null;
        return {
          id: doc.id,
          ...data,
          cliente
        };
      });

      setMezzi(datiMezzi);
    };

    fetchData();
  }, []);

  const clientiUnici = Object.values(clientiMap)
    .map(c => c.nome)
    .filter(Boolean);

  const mezziFiltrati = filtroCliente === "Tutti"
    ? mezzi
    : mezzi.filter(m => m.cliente?.nome === filtroCliente);

  const generaPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Elenco Mezzi con Cliente Associato", 14, 20);

    const rows = mezziFiltrati.map(m => [
      m.targa || "—",
      m.modello || "—",
      m.cliente?.nome || "Non associato",
      m.cliente?.email || "—"
    ]);

    doc.autoTable({
      head: [["Targa", "Modello", "Cliente", "Email"]],
      body: rows,
      startY: 30
    });

    doc.save("mezzi_con_clienti.pdf");
  };

  return (
    <div className="mt-4">
      <h4 className="mb-3">🚚 Elenco Mezzi con Cliente Associato</h4>

      <Form.Select
        value={filtroCliente}
        onChange={(e) => setFiltroCliente(e.target.value)}
        className="mb-3"
        style={{ maxWidth: "300px" }}
      >
        <option value="Tutti">Tutti i clienti</option>
        {clientiUnici.map((nome) => (
          <option key={nome} value={nome}>{nome}</option>
        ))}
      </Form.Select>

      <div className="d-flex justify-content-end mb-2">
        <Button variant="outline-dark" size="sm" onClick={generaPDF}>
          🖨️ Esporta PDF
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Targa</th>
            <th>Modello</th>
            <th>Cliente</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {mezziFiltrati.map((m) => (
            <tr key={m.id}>
              <td>{m.targa || "—"}</td>
              <td>{m.modello || "—"}</td>
              <td>{m.cliente?.nome || "Non associato"}</td>
              <td>{m.cliente?.email || "—"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ListaMezziConClientiPDF;