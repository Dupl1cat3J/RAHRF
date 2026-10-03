"use client";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Hotspot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  riskScore: number;
};

function colorOf(score: number) {
  if (score >= 70) return "#8b0000";
  if (score >= 40) return "#f59e0b";
  return "#059669";
}

export default function HazardHeatMap({ hotspots }: { hotspots: Hotspot[] }) {
  return (
    <MapContainer
      center={[7.0067, 100.4967]}
      zoom={15}
      scrollWheelZoom
      className="h-[480px] w-full rounded-xl"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {hotspots.map((h) => (
        <CircleMarker
          key={h.id}
          center={[h.lat, h.lng]}
          radius={10 + h.riskScore / 5}
          pathOptions={{
            color: colorOf(h.riskScore),
            fillColor: colorOf(h.riskScore),
            fillOpacity: 0.45,
          }}
        >
          <Popup>
            <b>{h.name}</b>
            <br />
            Risk score: {h.riskScore}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}