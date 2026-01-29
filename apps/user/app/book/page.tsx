"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "@repo/eden";
import { cn } from "@/lib/utils";
import {
  PremiumMap,
  PremiumMarker,
  PremiumRoute,
  VehicleSelector,
} from "@/components/premium-map";
import { LocationDialog } from "@/components/location-picker";
import { NegotiationPanel } from "@/components/price-negotiation";
import {
  MapPin,
  Navigation,
  Pencil,
  Sparkles,
  Crown,
  Clock,
  Zap,
  DollarSign,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

// ===============================================
// BOOK PAGE - PREMIUM RIDE BOOKING
// ===============================================
export default function BookPage() {
  const router = useRouter();
  const [selectedVehicle, setSelectedVehicle] = useState("black");
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [choosingOrigin, setChoosingOrigin] = useState(true);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [negotiationEnabled, setNegotiationEnabled] = useState(false);
  const [showNegotiation, setShowNegotiation] = useState(false);

  const [origin, setOrigin] = useState<{
    name: string;
    latitude: number;
    longitude: number;
  }>();

  const [destination, setDestination] = useState<{
    name: string;
    latitude: number;
    longitude: number;
  }>();

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({
          name: "Current Location",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        console.error("Geolocation error:", err.message);
        toast.error("Unable to get location");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Get price estimate
  const { data: expectedPrice } = useQuery({
    queryKey: ["price", origin, destination, selectedVehicle],
    queryFn: async () => {
      if (!origin || !destination) return null;

      // Get capacity based on vehicle
      const capacityMap: Record<string, number> = {
        black: 3,
        elite: 4,
        vip: 4,
      };

      const res = await api.price.post({
        origin,
        destination,
        capacity: capacityMap[selectedVehicle] || 3,
      });

      if (res.status === 200) {
        return res.data?.price;
      }
      return null;
    },
    enabled: !!origin && !!destination,
  });

  // Fetch route when we have both locations
  useEffect(() => {
    if (!origin || !destination) return;

    async function fetchRoute() {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        if (data.routes?.[0]?.geometry?.coordinates) {
          setRoute(data.routes[0].geometry.coordinates);
        }
      } catch (error) {
        console.error("Failed to fetch route:", error);
      }
    }

    fetchRoute();
  }, [origin, destination]);

  // Book ride mutation
  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!origin || !destination) return;

      const capacityMap: Record<string, number> = {
        black: 3,
        elite: 4,
        vip: 4,
      };

      const res = await api.user.request.post({
        origin,
        destination,
        capacity: capacityMap[selectedVehicle] || 3,
      });

      if (res.status === 200) {
        router.push(`/book/${res.data?.id}`);
        toast.success("Finding your premium driver...");
      } else {
        toast.error("Failed to book ride");
      }
    },
  });

  const handlePropose = async (amount: number) => {
    if (!origin || !destination) return;

    // For now, book with the proposed price and redirect
    // The negotiation flow will be handled by the booking page
    toast.success(`Proposta de R$ ${amount.toFixed(2)} enviada!`);
    setShowNegotiation(false);

    // Book the ride with negotiation mode
    const capacityMap: Record<string, number> = {
      black: 3,
      elite: 4,
      vip: 4,
    };

    const res = await api.user.request.post({
      origin,
      destination,
      capacity: capacityMap[selectedVehicle] || 3,
    });

    if (res.status === 200) {
      router.push(`/book/${res.data?.id}?negotiate=true&price=${amount}`);
    }
  };

  const canBook = origin && destination && !bookMutation.isPending;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Premium Map - Full Screen Background */}
      <div className="fixed inset-0 z-0">
        <PremiumMap
          center={
            origin
              ? [origin.longitude, origin.latitude]
              : [-43.1729, -22.9068]
          }
          zoom={origin && destination ? 13 : 14}
          pitch={45}
        >
          {/* Origin Marker */}
          {origin && (
            <PremiumMarker
              longitude={origin.longitude}
              latitude={origin.latitude}
              type="pickup"
              label="Pickup"
              animate={!destination}
            />
          )}

          {/* Destination Marker */}
          {destination && (
            <PremiumMarker
              longitude={destination.longitude}
              latitude={destination.latitude}
              type="destination"
              label="Destination"
            />
          )}

          {/* Route */}
          {route.length > 0 && <PremiumRoute coordinates={route} animated />}
        </PremiumMap>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col pointer-events-none">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 pointer-events-auto"
        >
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-black tracking-tight italic">
              ONYX <span className="text-primary">RIDE</span>
            </h1>
          </div>
        </motion.header>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Sheet */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="pointer-events-auto bg-black/95 backdrop-blur-2xl rounded-t-[2rem] border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.8)]"
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
          </div>

          <div className="p-6 pt-2">
            {/* Location Inputs */}
            <div className="space-y-3 mb-6">
              <LocationInput
                icon={MapPin}
                iconColor="text-emerald-500"
                label="Pickup"
                value={origin?.name || "Set pickup location"}
                onClick={() => {
                  setChoosingOrigin(true);
                  setLocationDialogOpen(true);
                }}
              />

              <LocationInput
                icon={Navigation}
                iconColor="text-primary"
                label="Destination"
                value={destination?.name || "Where to?"}
                onClick={() => {
                  setChoosingOrigin(false);
                  setLocationDialogOpen(true);
                }}
              />
            </div>

            {/* Vehicle Selection */}
            <AnimatePresence>
              {destination && !showNegotiation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <VehicleSelector
                    selected={selectedVehicle}
                    onSelect={setSelectedVehicle}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Negotiation Toggle - inDrive style */}
            <AnimatePresence>
              {destination && !showNegotiation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <button
                    onClick={() => setNegotiationEnabled(!negotiationEnabled)}
                    className={cn(
                      "w-full p-4 rounded-2xl flex items-center justify-between transition-all",
                      negotiationEnabled
                        ? "bg-emerald-500/10 border border-emerald-500/30"
                        : "bg-white/5 border border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        negotiationEnabled ? "bg-emerald-500/20" : "bg-white/5"
                      )}>
                        <DollarSign className={cn(
                          "w-5 h-5",
                          negotiationEnabled ? "text-emerald-500" : "text-white/60"
                        )} />
                      </div>
                      <div className="text-left">
                        <p className={cn(
                          "font-bold",
                          negotiationEnabled ? "text-emerald-500" : "text-white"
                        )}>
                          Negociar Preço
                        </p>
                        <p className="text-xs text-white/40">
                          Estilo inDrive - proponha seu valor
                        </p>
                      </div>
                    </div>
                    {negotiationEnabled ? (
                      <ToggleRight className="w-8 h-8 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-white/30" />
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Negotiation Panel */}
            <AnimatePresence>
              {showNegotiation && expectedPrice && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <NegotiationPanel
                    suggestedPrice={expectedPrice}
                    onPropose={handlePropose}
                    onAcceptOffer={() => { }}
                    onRejectOffer={() => { }}
                    onCounter={() => { }}
                  />
                  <button
                    onClick={() => setShowNegotiation(false)}
                    className="w-full mt-4 py-3 rounded-xl text-white/50 text-sm font-bold hover:text-white/70 transition-colors"
                  >
                    Cancelar negociação
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Price & Book Button */}
            <AnimatePresence>
              {!showNegotiation && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {expectedPrice && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between p-4 rounded-2xl bg-primary/10 border border-primary/30"
                    >
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-primary" />
                        <span className="text-sm font-bold text-primary/80">
                          Estimated Price
                        </span>
                      </div>
                      <span className="text-2xl font-black text-primary">
                        R$ {expectedPrice.toFixed(2)}
                      </span>
                    </motion.div>
                  )}

                  {/* Two buttons when negotiation is enabled */}
                  {negotiationEnabled && destination ? (
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowNegotiation(true)}
                        className="flex-1 py-5 rounded-2xl font-black text-lg uppercase tracking-wider bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                      >
                        <DollarSign className="w-5 h-5 inline mr-2" />
                        Negociar
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: canBook ? 1.02 : 1 }}
                        whileTap={{ scale: canBook ? 0.98 : 1 }}
                        onClick={() => bookMutation.mutate()}
                        disabled={!canBook}
                        className="flex-1 py-5 rounded-2xl font-black text-lg uppercase tracking-wider bg-gradient-to-r from-primary via-amber-400 to-primary text-black shadow-[0_0_30px_rgba(234,179,8,0.4)]"
                      >
                        <Sparkles className="w-5 h-5 inline mr-2" />
                        Aceitar
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: canBook ? 1.02 : 1 }}
                      whileTap={{ scale: canBook ? 0.98 : 1 }}
                      onClick={() => bookMutation.mutate()}
                      disabled={!canBook}
                      className={cn(
                        "w-full py-5 rounded-2xl font-black text-lg uppercase tracking-wider transition-all",
                        canBook
                          ? "bg-gradient-to-r from-primary via-amber-400 to-primary text-black shadow-[0_0_30px_rgba(234,179,8,0.4)]"
                          : "bg-white/10 text-white/30 cursor-not-allowed"
                      )}
                    >
                      {bookMutation.isPending ? (
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          Finding Driver...
                        </motion.span>
                      ) : !destination ? (
                        "Select Destination"
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 inline mr-2" />
                          Book Premium Ride
                        </>
                      )}
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Premium Features */}
            {!showNegotiation && (
              <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-white/5">
                {[
                  { icon: Clock, label: "Fast Pickup" },
                  { icon: Crown, label: "Elite Drivers" },
                  { icon: Sparkles, label: "Premium Cars" },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/30">
                    <feature.icon className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      {feature.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Location Dialog */}
      <LocationDialog
        origin={origin}
        open={locationDialogOpen}
        onClose={() => setLocationDialogOpen(false)}
        setOrigin={setOrigin}
        setDestination={setDestination}
        choose={choosingOrigin}
      />
    </div>
  );
}

// ===============================================
// LOCATION INPUT
// ===============================================
function LocationInput({
  icon: Icon,
  iconColor,
  label,
  value,
  onClick,
}: {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 text-left group hover:border-white/10 transition-all"
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          "bg-white/5 group-hover:bg-white/10 transition-colors"
        )}
      >
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
          {label}
        </p>
        <p className="font-bold text-white truncate">{value}</p>
      </div>

      <Pencil className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
    </button>
  );
}
