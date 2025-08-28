import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";

const Registrazione = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ruolo, setRuolo] = useState("tecnico");
  const [messaggio, setMessaggio] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessaggio("");
    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await addDoc(collection(db, "utenti"), {
        uid: userCred.user.uid,
        email: email.trim(),
        ruolo,
      });

      setMessaggio("✅ Utente registrato con successo");
      setEmail("");
      setPassword("");
      setRuolo("tecnico");
    } catch (err) {
      console.error("Errore nella registrazione:", err);
      setMessaggio("❌ Errore nella registrazione. Controlla i dati o riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: "400px" }}>
      <h4 className="mb-3 text-center">👤 Registrazione nuovo utente</h4>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-2">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Ruolo</Form.Label>
          <Form.Select value={ruolo} onChange={(e) => setRuolo(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="tecnico">Tecnico</option>
            <option value="cliente">Cliente</option>
          </Form.Select>
        </Form.Group>

        <Button type="submit" variant="primary" disabled={loading} className="w-100">
          {loading ? "Registrazione in corso..." : "Registra utente"}
        </Button>

        {messaggio && (
          <div className={`mt-3 text-center ${messaggio.startsWith("❌") ? "text-danger" : "text-success"}`}>
            {messaggio}
          </div>
        )}
      </Form>
    </Container>
  );
};

export default Registrazione;