import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db, storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const NuovoIntervento = ({ onInserimento }) => {
  const [clienti, setClienti] = useState([]);
  const [mezzi, setMezzi] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [mezzoId, setMezzoId] = useState("");
  const [tipo, setTipo] = useState("Ordinario");
  const [tecnico, setTecnico] = useState("");
  const [firmaTecnico, setFirmaTecnico] = useState("");
  const [urgente, setUrgente] = useState(false);
  const [note, setNote] = useState("");
  const [cadenza, setCadenza] = useState("Trimestrale");
  const [file, setFile] = useState(null);
  const [dataIntervento, setDataIntervento] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const [nuovoMezzo, setNuovoMezzo] = useState({
    modello: "",
    marca: "",
    targa: "",
    matricola: "",
    note: ""
  });
  const [salvataggioMezzo, setSalvataggioMezzo] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientiSnap = await getDocs(collection(db, "CLIENTI"));
        const mezziSnap = await getDocs(collection(db, "MEZZI"));
        setClienti(clientiSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setMezzi(mezziSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Errore nel caricamento dati:", error);
      }
    };
    fetchData();
  }, []);

  const mezziFiltrati = mezzi.filter(m => m.clienteId === clienteId);

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

  const handleSalvaNuovoMezzo = async () => {
    if (!clienteId || !nuovoMezzo.modello.trim()) {
      alert("Compila almeno il modello e seleziona un cliente.");
      return;
    }

    setSalvataggioMezzo(true);
    try {
      const docRef = await addDoc(collection(db, "MEZZI"), {
        clienteId,
        clienteNome: clienti.find(c => c.id === clienteId)?.ragioneSociale || "",
        ...nuovoMezzo,
        importatoIl: Timestamp.now()
      });

      const nuovo = { id: docRef.id, clienteId, ...nuovoMezzo };
      setMezzi(prev => [...prev, nuovo]);
      setMezzoId(docRef.id);
      setNuovoMezzo({ modello: "", marca: "", targa: "", matricola: "", note: "" });
    } catch (error) {
      console.error("Errore nel salvataggio mezzo:", error);
      alert("❌ Errore nel salvataggio del mezzo.");
    } finally {
      setSalvataggioMezzo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mezzoId || !tecnico.trim() || !firmaTecnico.trim()) {
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
        firmaTecnico: firmaTecnico.trim(),
        urgente,
        note: note.trim(),
        stato: "Effettuato",
        data: Timestamp.fromDate(dataIntervento),
        prossimaScadenza: calcolaScadenza(dataIntervento, cadenza),
        allegato: fileURL,
      });

      setClienteId("");
      setMezzoId("");
      setTipo("Ordinario");
      setTecnico("");
      setFirmaTecnico("");
      setUrgente(false);
      setNote("");
      setCadenza("Trimestrale");
      setFile(null);
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
        <Form.Label>Cliente</Form.Label>
        <Form.Select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
          <option value="">Seleziona cliente</option>
          {clienti.map((c) => (
            <option key={c.id} value={c.id}>
              {c.ragioneSociale}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Mezzo associato</Form.Label>
        <Form.Select value={mezzoId} onChange={(e) => setMezzoId(e.target.value)} required>
          <option value="">Seleziona mezzo</option>
          {mezziFiltrati.map((m) => (
            <option key={m.id} value={m.id}>
              {m.modello} ({m.Targa || m.Matricola || m.id})
            </option>
          ))}
          <option value="nuovo">➕ Aggiungi nuovo mezzo</option>
        </Form.Select>
      </Form.Group>

      {mezzoId === "nuovo" && (
        <div className="border rounded p-3 mb-3 bg-white">
          <h6>➕ Inserisci nuovo mezzo</h6>

          <Form.Group className="mb-2">
            <Form.Label>Modello *</Form.Label>
            <Form.Control
              value={nuovoMezzo.modello}
              onChange={(e) => setNuovoMezzo({ ...nuovoMezzo, modello: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Marca</Form.Label>
            <Form.Control
              value={nuovoMezzo.marca}
              onChange={(e) => setNuovoMezzo({ ...nuovoMezzo, marca: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Targa</Form.Label>
            <Form.Control
              value={nuovoMezzo.targa}
              onChange={(e) => setNuovoMezzo({ ...nuovoMezzo, targa: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Matricola</Form.Label>
            <Form.Control
              value={nuovoMezzo.matricola}
              onChange={(e) => setNuovoMezzo({ ...nuovoMezzo, matricola: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Note</Form.Label>
            <Form.Control
              value={nuovoMezzo.note}
              onChange={(e) => setNuovoMezzo({ ...nuovoMezzo, note: e.target.value })}
            />
          </Form.Group>

                    <Button variant="success" onClick={handleSalvaNuovoMezzo} disabled={salvataggioMezzo}>
            {salvataggioMezzo ? "Salvataggio..." : "💾 Salva mezzo"}
          </Button>
        </div>
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
        <Form.Label>Firma del tecnico</Form.Label>
        <Form.Control value={firmaTecnico} onChange={(e) => setFirmaTecnico(e.target.value)} required />
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Check
          type="checkbox"
          label="🚨 Intervento urgente"
          checked={urgente}
          onChange={(e) => setUrgente(e.target.checked)}
        />
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