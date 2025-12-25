"use client";

import { useEffect, useRef, useState } from "react";
import api from "@repo/eden";

interface LocationTrackingOptions {
  tripId?: string | null;
  enabled?: boolean;
}

export function useLocationTracking({
  tripId = null,
  enabled = true,
}: LocationTrackingOptions = {}) {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLocation, setLastLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      // Stop tracking if disabled
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        setIsTracking(false);
      }
      return;
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    // Start watching position
    setIsTracking(true);
    setError(null);

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Send location to server
          await api.captain.location.post({
            lat: latitude,
            lng: longitude,
            tripId: tripId || undefined,
          });

          // Update last known location
          setLastLocation({ lat: latitude, lng: longitude });
          setError(null);
        } catch (err) {
          console.error("Failed to send location:", err);
          setError("Failed to send location to server");
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError(err.message || "Failed to get location");
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000, // 3 seconds cache
        timeout: 5000, // 5 seconds timeout
      },
    );

    watchIdRef.current = watchId;

    // Cleanup on unmount or when dependencies change
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        setIsTracking(false);
      }
    };
  }, [tripId, enabled]);

  return {
    isTracking,
    error,
    lastLocation,
  };
}
