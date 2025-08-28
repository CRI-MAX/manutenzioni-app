import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Form from "react-bootstrap/Form";
import "./MappaInterventi.css"; // opzionale per stile

// ✅ Fix icona marker per Leaflet
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const MappaInterventi = ({ interventi = [] }) => {
  const [filtroStato, setFiltroStato] = useState("");
  const [filtroTecnico, setFiltroTecnico] = useState("");

  const tecniciDisponibili = [...new Set(interventi.map(i => i.tecnico).filter(Boolean))];

  const interventiFiltrati = interventi.filter(i =>
    (!filtroStato || i.stato === filtroStato) &&
    (!filtroTecnico || i.tecnico === filtroTecnico)
  );

  if (!Array.isArray(interventi) || interventi.length === 0) return null;

  return (
    <div className="mappa-layout d-flex flex-wrap">
      {/* 👉 Pannello laterale */}
      <div className="mappa-sidebar p-3 border-end bg-light" style={{ minWidth: "300px", maxHeight: "600px", overflowY: "auto" }}>
        <h5 className="mb-3">📋 Interventi visibili</h5>

        <Form.Select
          value={filtroStato}
          onChange={(e) => setFiltroStato(e.target.value)}
          className="mb-2"
        >
          <option value="">Tutti gli stati</option>
          <option value="Effettuato">✅ Effettuato</option>
          <option value="Programmato">📅 Programmato</option>
          <option value="In Ritardo">⏰ In Ritardo</option>
        </Form.Select>

        <Form.Select
          value={filtroTecnico}
          onChange={(e) => setFiltroTecnico(e.target.value)}
          className="mb-3"
        >
          <option value="">Tutti i tecnici</option>
          {tecniciDisponibili.map((nome, i) => (
            <option key={i} value={nome}>{nome}</option>
          ))}
        </Form.Select>

        {interventiFiltrati.length > 0 ? (
          <ul className="list-group">
            {interventiFiltrati.map((int) => (
              <li key={int.id} className="list-group-item">
                <strong>{int.titolo || "Intervento"}</strong><br />
                <small>{int.tecnico || "—"} • {int.stato || "—"}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">Nessun intervento corrispondente ai filtri.</p>
        )}
      </div>

      {/* 👉 Mappa */}
      <div className="flex-grow-1">
        <MapContainer center={[44.7, 10.8]} zoom={8} style={{ height: "600px", width: "100%" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MarkerClusterGroup>
            {interventiFiltrati.map((int) => {
              const { id, lat, lng, titolo, descrizione, stato, tecnico } = int;
              if (typeof lat !== "number" || typeof lng !== "number") return null;

              return (
                <Marker key={id || `${lat}-${lng}`} position={[lat, lng]}>
                  <Popup>
                    <strong>{titolo || "Intervento"}</strong><br />
                    {descrizione || "—"}<br />
                    Stato: {stato || "—"}<br />
                    Tecnico: {tecnico || "—"}
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
};

export default MappaInterventi;