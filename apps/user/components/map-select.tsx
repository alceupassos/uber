"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Location = {
  lat: number;
  lng: number;
  label: string;
};

function ClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function MapPicker({ onSelect, setLoading, origin }: any) {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);

  async function pick(lat: number, lng: number) {
    setPos({ lat, lng });
    setLoading(true);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    setLoading(false);
    onSelect({
      latitude: lat,
      longitude: lng,
      name: data.display_name,
    });
  }

  // Default center if origin is not available
  const center = origin
    ? [origin.latitude, origin.longitude]
    : [28.6139, 77.209]; // Default to Delhi coordinates

  return (
    <div className="h-[420px] w-full rounded-lg overflow-hidden">
      <MapContainer
        // the user location
        center={center as [number, number]}
        zoom={13}
        className="h-full w-full">
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler onPick={pick} />

        {pos && <Marker position={[pos.lat, pos.lng]} icon={markerIcon} />}
      </MapContainer>
    </div>
  );
}
