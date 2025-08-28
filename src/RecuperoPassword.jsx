import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";

const RecuperoPassword = () => {
  const [email, setEmail] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessaggio("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessaggio("📧 Email di recupero inviata con successo!");
    } catch (error) {
      console.error("Errore nel recupero password:", error);
      setMessaggio("❌ Errore: email non valida o non registrata.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="login-container">
      <h4 className="mb-3 text-center">🔒 Recupera password</h4>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email registrata</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </Form.Group>
        <Button type="submit" variant="primary" disabled={loading} className="w-100">
          {loading ? "Invio in corso..." : "Invia email"}
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

export default RecuperoPassword;