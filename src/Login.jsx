import React, { useState, useRef, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import "./App.css";
import LogoAziendale from "./components/LogoAziendale";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState("");
  const [caricamento, setCaricamento] = useState(false);
  const emailRef = useRef();

  useEffect(() => {
    if (emailRef.current) emailRef.current.focus();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrore("");
    setCaricamento(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (onLogin) onLogin();
    } catch (error) {
      console.error("Errore di login:", error);
      setErrore("❌ Credenziali non valide. Riprova.");
    } finally {
      setCaricamento(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <LogoAziendale altezza={60} className="login-logo mb-3" />
        <h2>Accesso al sistema EVI</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            aria-label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            ref={emailRef}
          />
          <input
            type="password"
            placeholder="Password"
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={caricamento}>
            {caricamento ? "⏳ Accesso in corso..." : "Accedi"}
          </button>
        </form>
        {errore && <p className="text-danger mt-3">{errore}</p>}
      </div>
    </div>
  );
}

export default Login;