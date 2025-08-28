import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import "./App.css";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ErrorBoundary from "./ErrorBoundary";
import Sidebar from "./Sidebar";
import Login from "./Login";
import Registrazione from "./Registrazione";
import DashboardInterventi from "./DashboardInterventi";
import NuovoIntervento from "./NuovoIntervento";
import RecuperoPassword from "./RecuperoPassword";
import GestioneUtenti from "./GestioneUtenti";
import DashboardAdmin from "./DashboardAdmin";
import LogAttivita from "./LogAttivita";
import CsvUploader from "./CsvUploader";
import ClientiTable from "./ClientiTable";
import MezziTable from "./MezziTable";

function App() {
  const [utente, setUtente] = useState(null);
  const [ruoloUtente, setRuoloUtente] = useState("");
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUtente(user);
      if (user) {
        try {
          const snapshot = await getDocs(collection(db, "UTENTI"));
          const utenti = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          const trovato = utenti.find(u =>
            u.UId === user.uid ||
            u.uid === user.uid ||
            u.UID === user.uid ||
            u.Assigned_username === user.uid
          );

          const ruolo = (
            trovato?.Ruolo ||
            trovato?.Role ||
            trovato?.ruolo
          )?.trim().toLowerCase() || "";

          setRuoloUtente(ruolo);
        } catch (error) {
          console.error("Errore nel recupero ruolo:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const creaNotifica = async (messaggio, tipo = "info") => {
    try {
      await addDoc(collection(db, "NOTIFICHE"), {
        messaggio,
        tipo,
        utente: utente?.email || "sconosciuto",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Errore nella creazione notifica:", error);
    }
  };

  const salvaSuFirebase = async (collezione, dati) => {
    try {
      for (const item of dati) {
        await addDoc(collection(db, collezione), item);
      }
      toast.success(`✅ ${dati.length} record salvati in "${collezione}"`);
      await creaNotifica(`Importati ${dati.length} record in ${collezione}`, "success");
    } catch (error) {
      console.error("Errore nel salvataggio:", error);
      toast.error("❌ Errore nel salvataggio dei dati.");
      await creaNotifica(`Errore nel salvataggio in ${collezione}`, "error");
    }
  };

  if (!utente) return <Login onLogin={() => {}} />;
  if (!ruoloUtente) return <p className="text-muted p-3">🔄 Caricamento ruolo utente...</p>;
  if (!["admin", "tecnico", "cliente"].includes(ruoloUtente)) {
    return <p className="text-danger p-3">⚠️ Ruolo non riconosciuto: "{ruoloUtente}"</p>;
  }

  return (
    <ErrorBoundary>
      <div className="app-layout">
        <Sidebar ruolo={ruoloUtente} />
        <div className="main-content">
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <div className="d-flex align-items-center mb-4">
                    <img
                      src="/logo.png"
                      alt="Logo Aziendale"
                      onError={(e) => { e.target.style.display = "none"; }}
                      style={{ height: "60px", marginRight: "1rem" }}
                    />
                    <h2 className="mb-0">Gestione Interventi</h2>
                  </div>

                  <NuovoIntervento onInserimento={() => setRefresh(!refresh)} />
                  <DashboardInterventi key={refresh} />
                </>
              }
            />

            <Route
              path="/clienti"
              element={
                ruoloUtente === "admin"
                  ? <>
                      <CsvUploader titolo="Importa Clienti" onUpload={(dati) => salvaSuFirebase("CLIENTI", dati)} />
                      <ClientiTable />
                    </>
                  : <h5 className="text-danger">⛔ Accesso negato</h5>
              }
            />

            <Route
              path="/mezzi"
              element={
                ["admin", "tecnico"].includes(ruoloUtente)
                  ? <>
                      <CsvUploader titolo="Importa Mezzi" onUpload={(dati) => salvaSuFirebase("MEZZI", dati)} />
                      <MezziTable />
                    </>
                  : <h5 className="text-danger">⛔ Accesso negato</h5>
              }
            />

            <Route path="/report" element={<h3>📊 Sezione Report (in costruzione)</h3>} />

            <Route
              path="/registrazione"
              element={
                ruoloUtente === "admin"
                  ? <Registrazione />
                  : <h5 className="text-danger">⛔ Solo gli admin possono registrare nuovi utenti</h5>
              }
            />

            <Route path="/recupero" element={<RecuperoPassword />} />

            <Route
              path="/utenti"
              element={
                ruoloUtente === "admin"
                  ? <GestioneUtenti />
                  : <h5 className="text-danger">⛔ Solo gli admin possono gestire gli utenti</h5>
              }
            />

            <Route
              path="/admin"
              element={
                ruoloUtente === "admin"
                  ? <DashboardAdmin />
                  : <h5 className="text-danger">⛔ Accesso riservato agli amministratori</h5>
              }
            />

            <Route
              path="/log"
              element={
                ruoloUtente === "admin"
                  ? <LogAttivita />
                  : <h5 className="text-danger">⛔ Accesso riservato agli amministratori</h5>
              }
            />
          </Routes>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;