"use client";

import { useEffect, useRef, memo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's missing default icon issue
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

function Map({ from, to }: { from: [number, number]; to: [number, number] }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(from, 13);

    // Tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update route when from/to changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers and route
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    // Fetch and draw new route
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data.routes?.length || !map) return;

        const route = data.routes[0].geometry.coordinates;
        const latlngs = route.map(([lng, lat]: number[]) => [lat, lng]);

        const line = L.polyline(latlngs, { color: "blue", weight: 5 }).addTo(
          map,
        );
        routeLineRef.current = line;

        const originMarker = L.marker(from).addTo(map);
        const destMarker = L.marker(to).addTo(map);
        markersRef.current = [originMarker, destMarker];

        map.fitBounds(line.getBounds());
      })
      .catch((err) => console.log("OSRM ERROR", err));
  }, [from, to]);

  return (
    <div
      ref={mapRef}
      style={{
        height: "100%",
        width: "100%",
        minHeight: "400px",
      }}
    />
  );
}

// Memoize to prevent unnecessary re-renders when parent re-renders
export default memo(Map, (prevProps, nextProps) => {
  return (
    prevProps.from[0] === nextProps.from[0] &&
    prevProps.from[1] === nextProps.from[1] &&
    prevProps.to[0] === nextProps.to[0] &&
    prevProps.to[1] === nextProps.to[1]
  );
});
