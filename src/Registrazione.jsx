import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import { toast } from "react-toastify";

function Registrazione() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [ruolo, setRuolo] = useState("tecnico");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !nome) {
      toast.warning("⚠️ Compila tutti i campi obbligatori");
      return;
    }

    if (password.length < 6) {
      toast.warning("🔐 La password deve contenere almeno 6 caratteri");
      return;
    }

    setLoading(true);
    try {
      const credenziali = await createUserWithEmailAndPassword(auth, email, password);
      const uid = credenziali.user.uid;

      await addDoc(collection(db, "UTENTI"), {
        nome,
        email,
        ruolo,
        uid,
        attivo: true,
        dataCreazione: Timestamp.now()
      });

      toast.success("✅ Utente registrato con successo");
      setEmail("");
      setPassword("");
      setNome("");
      setRuolo("tecnico");
    } catch (error) {
      console.error("Errore nella registrazione:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("❌ Email già registrata");
      } else {
        toast.error("❌ Errore nella registrazione");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4">
      <h3 className="mb-3">➕ Registrazione Nuovo Utente</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
        <div className="mb-2">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-2">
          <input
            type="password"
            className="form-control"
            placeholder="Password (min. 6 caratteri)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <select
            className="form-select"
            value={ruolo}
            onChange={(e) => setRuolo(e.target.value)}
          >
            <option value="tecnico">Tecnico</option>
            <option value="cliente">Cliente</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Registrazione in corso..." : "Registra"}
        </button>
      </form>
    </div>
  );
}

export default Registrazione;