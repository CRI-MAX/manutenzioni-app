import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db, storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const NuovoIntervento = ({ onInserimento }) => {
  const [mezzi, setMezzi] = useState([]);
  const [mezzoId, setMezzoId] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [tipo, setTipo] = useState("Ordinario");
  const [tecnico, setTecnico] = useState("");
  const [note, setNote] = useState("");
  const [cadenza, setCadenza] = useState("Trimestrale");
  const [file, setFile] = useState(null);
  const [dataIntervento, setDataIntervento] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMezzi = async () => {
      try {
        const snapshot = await getDocs(collection(db, "MEZZI"));
        setMezzi(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Errore nel caricamento dei mezzi:", error);
      }
    };
    fetchMezzi();
  }, []);

  useEffect(() => {
    const fetchCliente = async () => {
      const mezzo = mezzi.find(m => m.id === mezzoId);
      if (mezzo?.clienteId) {
        try {
          const snapshot = await getDocs(collection(db, "CLIENTI"));
          const clienti = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const cliente = clienti.find(c => c.id === mezzo.clienteId);
          setClienteNome(cliente?.ragioneSociale || "—");
        } catch (error) {
          console.error("Errore nel caricamento cliente:", error);
        }
      } else {
        setClienteNome("");
      }
    };
    fetchCliente();
  }, [mezzoId, mezzi]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.size < 10 * 1024 * 1024) {
      setFile(selected);
    } else {
      alert("❌ Il file è troppo grande o non valido.");
      setFile(null);
    }
  };

  const calcolaScadenza = (data, cadenza) => {
    const d = new Date(data);
    if (cadenza === "Trimestrale") d.setMonth(d.getMonth() + 3);
    if (cadenza === "Semestrale") d.setMonth(d.getMonth() + 6);
    if (cadenza === "Annuale") d.setFullYear(d.getFullYear() + 1);
    return Timestamp.fromDate(d);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mezzoId || !tecnico.trim()) {
      alert("Compila tutti i campi obbligatori.");
      return;
    }

    setLoading(true);
    let fileURL = "";
    try {
      if (file) {
        const storageRef = ref(storage, `interventi/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        fileURL = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, "INTERVENTI"), {
        mezzoId,
        tipo,
        tecnico: tecnico.trim(),
        note: note.trim(),
        stato: "Effettuato",
        data: Timestamp.fromDate(dataIntervento),
        prossimaScadenza: calcolaScadenza(dataIntervento, cadenza),
        allegato: fileURL,
      });

      setMezzoId("");
      setTipo("Ordinario");
      setTecnico("");
      setNote("");
      setCadenza("Trimestrale");
      setFile(null);
      setClienteNome("");
      setDataIntervento(new Date());

      if (onInserimento) onInserimento();
    } catch (error) {
      console.error("Errore nel salvataggio intervento:", error);
      alert("❌ Errore nel salvataggio. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4 p-3 border rounded bg-light">
      <h4 className="mb-3">➕ Inserisci nuovo intervento</h4>

      <Form.Group className="mb-2">
        <Form.Label>Mezzo</Form.Label>
        <Form.Select value={mezzoId} onChange={(e) => setMezzoId(e.target.value)} required>
          <option value="">Seleziona mezzo</option>
          {mezzi.map((m) => (
            <option key={m.id} value={m.id}>
              {m.modello} ({m.id})
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {clienteNome && (
        <Form.Group className="mb-2">
          <Form.Label>Cliente associato</Form.Label>
          <Form.Control value={clienteNome} disabled />
        </Form.Group>
      )}

      <Form.Group className="mb-2">
        <Form.Label>Tipo intervento</Form.Label>
        <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option>Ordinario</option>
          <option>Straordinario</option>
          <option>Controllo</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Data intervento</Form.Label><br />
        <DatePicker
          selected={dataIntervento}
          onChange={(date) => setDataIntervento(date)}
          dateFormat="dd/MM/yyyy"
          className="form-control"
        />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Tecnico</Form.Label>
        <Form.Control value={tecnico} onChange={(e) => setTecnico(e.target.value)} required />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Note</Form.Label>
        <Form.Control value={note} onChange={(e) => setNote(e.target.value)} />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Cadenza</Form.Label>
        <Form.Select value={cadenza} onChange={(e) => setCadenza(e.target.value)}>
          <option>Trimestrale</option>
          <option>Semestrale</option>
          <option>Annuale</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Allega foto o documento</Form.Label>
        <Form.Control type="file" onChange={handleFileChange} />
        {file && <div className="mt-2 text-muted">📎 File selezionato: {file.name}</div>}
      </Form.Group>

      <Button type="submit" variant="primary" disabled={loading}>
        {loading ? "Salvataggio in corso..." : "Salva intervento"}
      </Button>
    </Form>
  );
};

export default NuovoIntervento;