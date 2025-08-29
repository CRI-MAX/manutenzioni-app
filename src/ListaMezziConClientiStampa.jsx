import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const ListaMezziConClientiStampa = () => {
  const [mezzi, setMezzi] = useState([]);
  const [clientiMap, setClientiMap] = useState({});
  const [filtroCliente, setFiltroCliente] = useState("Tutti");
  const tableRef = useRef();

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

  const stampaTabella = () => {
    const contenuto = tableRef.current.innerHTML;
    const finestra = window.open("", "", "width=800,height=600");
    finestra.document.write(`
      <html>
        <head>
          <title>Stampa Mezzi</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f8f8f8; }
          </style>
        </head>
        <body>
          <h2>Elenco Mezzi con Cliente Associato</h2>
          ${contenuto}
        </body>
      </html>
    `);
    finestra.document.close();
    finestra.print();
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
        <Button variant="outline-secondary" size="sm" onClick={stampaTabella}>
          🖨️ Stampa tabella
        </Button>
      </div>

      <div ref={tableRef}>
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
    </div>
  );
};

export default ListaMezziConClientiStampa;