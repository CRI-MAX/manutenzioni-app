import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import { toast } from "react-toastify";

function Registrazione() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [ruolo, setRuolo] = useState("tecnico"); // default

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setEmail(""); setPassword(""); setNome(""); setRuolo("tecnico");
    } catch (error) {
      console.error("Errore nella registrazione:", error);
      toast.error("❌ Errore nella registrazione");
    }
  };

  return (
    <div className="card p-4">
      <h3>➕ Registrazione Nuovo Utente</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select value={ruolo} onChange={(e) => setRuolo(e.target.value)}>
          <option value="tecnico">Tecnico</option>
          <option value="cliente">Cliente</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="btn btn-primary mt-3">Registra</button>
      </form>
    </div>
  );
}

export default Registrazione;