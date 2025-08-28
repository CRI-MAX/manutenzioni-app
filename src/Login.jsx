import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import "./App.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrore("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin(); // opzionale, se vuoi fare qualcosa dopo il login
    } catch (error) {
      console.error("Errore di login:", error);
      setErrore("Credenziali non valide. Riprova.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src="/logo.png" alt="Logo" className="login-logo" />
        <h2>Accesso al sistema EVI</h2>
        <form onSubmit={handleLogin}>
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
          <button type="submit">Accedi</button>
        </form>
        {errore && <p className="text-danger mt-3">{errore}</p>}
      </div>
    </div>
  );
}

export default Login;