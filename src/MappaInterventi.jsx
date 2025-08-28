import React, { useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
  const clusterRendered = useRef(false);

  // 🔒 Protezione contro doppio rendering
  if (clusterRendered.current) return null;
  clusterRendered.current = true;

  if (!Array.isArray(interventi) || interventi.length === 0) return null;

  return (
    <MapContainer center={[44.7, 10.8]} zoom={8} style={{ height: "600px", width: "100%" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MarkerClusterGroup>
        {interventi.map((int) => {
          const { id, lat, lng, titolo, descrizione, stato } = int;
          if (typeof lat !== "number" || typeof lng !== "number") return null;

          return (
            <Marker key={id || `${lat}-${lng}`} position={[lat, lng]}>
              <Popup>
                <strong>{titolo || "Intervento"}</strong><br />
                {descrizione || "—"}<br />
                Stato: {stato || "—"}
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default MappaInterventi;