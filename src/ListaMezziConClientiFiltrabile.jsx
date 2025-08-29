import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import { CSVLink } from "react-csv";

const ListaMezziConClientiFiltrabile = () => {
  const [mezzi, setMezzi] = useState([]);
  const [clientiMap, setClientiMap] = useState({});
  const [filtroCliente, setFiltroCliente] = useState("Tutti");
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setCaricamento(true);
      try {
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
      } catch (err) {
        console.error("Errore nel recupero mezzi/clienti:", err);
        setErrore(err);
      } finally {
        setCaricamento(false);
      }
    };

    fetchData();
  }, []);

  const clientiUnici = Object.values(clientiMap)
    .map(c => c.nome)
    .filter(Boolean);

  const mezziFiltrati = filtroCliente === "Tutti"
    ? mezzi
    : mezzi.filter(m => m.cliente?.nome === filtroCliente);

  const intestazioniCSV = [
    { label: "Targa", key: "targa" },
    { label: "Modello", key: "modello" },
    { label: "Cliente", key: "cliente.nome" },
    { label: "Email", key: "cliente.email" }
  ];

  const datiCSV = mezziFiltrati.map(m => ({
    targa: m.targa || "",
    modello: m.modello || "",
    "cliente.nome": m.cliente?.nome || "—",
    "cliente.email": m.cliente?.email || "—"
  }));

  if (caricamento) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" variant="primary" />
        <p className="text-muted mt-2">Caricamento mezzi...</p>
      </div>
    );
  }

  if (errore) {
    return <Alert variant="danger">❌ Errore: {errore.message}</Alert>;
  }

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
        <CSVLink
          data={datiCSV}
          headers={intestazioniCSV}
          filename="mezzi_filtrati.csv"
          className="btn btn-outline-primary btn-sm"
        >
          📤 Esporta CSV
        </CSVLink>
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

export default ListaMezziConClientiFiltrabile;