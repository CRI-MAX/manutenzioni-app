import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

const RecuperaPassword = () => {
  const [email, setEmail] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [caricamento, setCaricamento] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setMessaggio("");
    setCaricamento(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessaggio(`✅ Email di recupero inviata a ${email}`);
      setEmail("");
    } catch (error) {
      console.error("Errore invio email:", error);
      setMessaggio("❌ Impossibile inviare l'email. Controlla l'indirizzo.");
    } finally {
      setCaricamento(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-light">
      <h5 className="mb-3">🔐 Recupera Password</h5>
      <Form onSubmit={handleReset}>
        <Form.Group className="mb-3">
          <Form.Label>Inserisci la tua email</Form.Label>
          <Form.Control
            type="email"
            placeholder="es. mario.rossi@email.it"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Button type="submit" variant="primary" disabled={caricamento}>
          {caricamento ? "⏳ Invio in corso..." : "Invia email di recupero"}
        </Button>
      </Form>

      {messaggio && (
        <Alert
          variant={messaggio.startsWith("✅") ? "success" : "danger"}
          className="mt-3"
        >
          {messaggio}
        </Alert>
      )}
    </div>
  );
};

export default RecuperaPassword;