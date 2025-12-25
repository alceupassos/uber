"use client";

import { useLocationTracking } from "../hooks/useLocationTracking";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CaptainDashboard() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { isTracking, error, lastLocation } = useLocationTracking({
    enabled: isOnline,
  });

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/signin");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleToggleOnline = () => {
    if (!isOnline) {
      // Going online - start tracking
      setIsOnline(true);
      toast.success("You are now online and accepting trips");
    } else {
      // Going offline - stop tracking
      setIsOnline(false);
      toast.info("You are now offline");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    router.push("/auth/signin");
  };

  // Don't render until auth check is complete
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header with logout button */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Captain Dashboard
            </h1>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>

          {/* Online/Offline Toggle */}
          <div className="mb-8">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h2 className="text-xl font-semibold text-gray-700">
                  {isOnline ? "🟢 Online" : "⚫ Offline"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isOnline ? "Accepting trips nearby" : "Not accepting trips"}
                </p>
              </div>
              <button
                onClick={handleToggleOnline}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  isOnline
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {isOnline ? "Go Offline" : "Go Online"}
              </button>
            </div>
          </div>

          {/* Location Tracking Status */}
          {isOnline && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Location Tracking
              </h3>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                {isTracking ? (
                  <div>
                    <p className="text-green-600 font-medium mb-2">
                      ✓ Location tracking active
                    </p>
                    {lastLocation && (
                      <p className="text-sm text-gray-600">
                        Last update: Lat {lastLocation.lat.toFixed(6)}, Lng{" "}
                        {lastLocation.lng.toFixed(6)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Your location is being shared every 3 seconds to match
                      with nearby trips.
                    </p>
                  </div>
                ) : (
                  <p className="text-yellow-600 font-medium">
                    ⚠ Waiting for location permissions...
                  </p>
                )}
              </div>

              {error && (
                <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 font-medium">Error: {error}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Please enable location permissions in your browser settings.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              How it works
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Click &quot;Go Online&quot; to start accepting trips</li>
              <li>Allow location permissions when prompted</li>
              <li>Your location will be shared every 3 seconds</li>
              <li>
                You&apos;ll be matched with nearby trip requests automatically
              </li>
              <li>Accept trips and navigate to pickup location</li>
            </ol>
          </div>

          {/* Coming Soon Features */}
          <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Coming Soon
            </h3>
            <ul className="space-y-1 text-sm text-gray-500">
              <li>• Active trip display</li>
              <li>• Trip acceptance/rejection</li>
              <li>• Navigation to pickup</li>
              <li>• OTP verification</li>
              <li>• Trip completion</li>
              <li>• Earnings dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
