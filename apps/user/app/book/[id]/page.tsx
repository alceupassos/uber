"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import api from "@repo/eden";
import { cn } from "@/lib/utils";
import {
  PremiumMap,
  PremiumMarker,
  PremiumRoute,
} from "@/components/premium-map";
import { SOSButton } from "@/components/sos-button";
import { PremiumChat } from "@/components/premium-chat";
import {
  Phone,
  MessageCircle,
  Share2,
  Shield,
  X,
  Car,
  Star,
  Crown,
  Copy,
  Check,
} from "lucide-react";

// ===============================================
// TYPES
// ===============================================
type TripStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "ON_TRIP"
  | "COMPLETED"
  | "CANCELLED";

type Captain = {
  id: string;
  name: string;
  vehicle?: string;
  location?: { lat: string; lng: string };
};

// ===============================================
// RIDE DETAILS PAGE - PREMIUM EXPERIENCE
// ===============================================
export default function RideDetails() {
  const params = useParams();
  const router = useRouter();
  const rideId = params.id as string;
  const [copiedOTP, setCopiedOTP] = useState(false);
  const [route, setRoute] = useState<[number, number][]>([]);

  // Fetch trip data
  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", rideId],
    queryFn: async () => {
      const res = await api.user.trip({ id: rideId }).get();
      if (res.status !== 200) {
        throw new Error("Failed to fetch trip details");
      }
      return res.data;
    },
    refetchInterval: (query) => {
      const tripData = query.state.data;
      if (!tripData) return 3000;
      if (tripData.status === "COMPLETED" || tripData.status === "CANCELLED") {
        return false;
      }
      if (tripData.status === "ACCEPTED" || tripData.status === "ON_TRIP") {
        return 2000;
      }
      return 3000;
    },
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await api.user.cancel.post({ id: rideId });
      if (res.status !== 200) {
        throw new Error("Failed to cancel trip");
      }
    },
    onSuccess: () => {
      toast.success("Trip cancelled");
    },
    onError: () => {
      toast.error("Failed to cancel trip");
    },
  });

  // Fetch route when we have origin and destination
  useEffect(() => {
    if (!trip?.originLat || !trip?.originLng || !trip?.destLat || !trip?.destLng) return;

    async function fetchRoute() {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${trip.originLng},${trip.originLat};${trip.destLng},${trip.destLat}?overview=full&geometries=geojson`
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
  }, [trip?.originLat, trip?.originLng, trip?.destLat, trip?.destLng]);

  // Copy OTP to clipboard
  const copyOTP = () => {
    if (trip?.otp) {
      navigator.clipboard.writeText(trip.otp);
      setCopiedOTP(true);
      setTimeout(() => setCopiedOTP(false), 2000);
      toast.success("OTP copied to clipboard");
    }
  };

  const [isChatOpen, setIsChatOpen] = useState(false);

  // Fetch active offers for this trip (for Phase 3: Selection)
  const { data: offersResponse } = useQuery({
    queryKey: ["offers", rideId],
    queryFn: async () => {
      // Use any to avoid type issues with custom route
      const res = await (api as { negotiation: { offers: (p: { tripId: string }) => { get: () => Promise<{ status: number, data: { offers: { id: string; captainName: string; captainRating: number; captainTrips: number; captainVehicle: string; amount: number; }[] } }> } } }).negotiation.offers({ tripId: rideId }).get();
      if (res.status !== 200) return { offers: [] };
      return res.data;
    },
    enabled: status === "REQUESTED",
    refetchInterval: status === "REQUESTED" ? 2000 : false,
  });

  const activeOffers = offersResponse?.offers || [];

  // Accept offer mutation
  const acceptOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const res = await (api as { negotiation: { accept: { post: (b: { offerId: string, userId: string }) => Promise<{ status: number, data: { success: boolean; tripId: string; captainId: string; finalPrice: number; } }> } } }).negotiation.accept.post({
        offerId,
        userId: "current-user-id", // TODO: Get from auth
      });
      if (res.status !== 200) throw new Error("Failed to accept offer");
      return res.data;
    },
    onSuccess: () => {
      toast.success("Driver selected! Enjoy your premium ride.");
    },
  });

  // Loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!trip) {
    return null;
  }

  const hasCoordinates = trip.originLat && trip.originLng && trip.destLat && trip.destLng;
  const status = trip.status as TripStatus;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Safety & SOS */}
      <SOSButton />

      {/* Premium Map - Full Screen */}
      <div className="fixed inset-0 z-0">
        {hasCoordinates && (
          <PremiumMap
            center={[Number(trip.originLng), Number(trip.originLat)]}
            zoom={14}
            pitch={status === "ON_TRIP" ? 60 : 45}
          >
            {/* Origin Marker */}
            <PremiumMarker
              longitude={Number(trip.originLng)}
              latitude={Number(trip.originLat)}
              type="pickup"
              label="Pickup"
              animate={status === "REQUESTED" || status === "ACCEPTED"}
            />

            {/* Destination Marker */}
            <PremiumMarker
              longitude={Number(trip.destLng)}
              latitude={Number(trip.destLat)}
              type="destination"
              label="Destination"
            />

            {/* Captain Location */}
            {trip.captain?.location && (
              <PremiumMarker
                longitude={Number(trip.captain.location.lng)}
                latitude={Number(trip.captain.location.lat)}
                type="driver"
                animate
              />
            )}

            {/* Route */}
            {route.length > 0 && <PremiumRoute coordinates={route} animated />}
          </PremiumMap>
        )}
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col pointer-events-none">
        {/* Header */}
        <Header status={status} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Sheet */}
        <div className="pointer-events-auto">
          <AnimatePresence mode="wait">
            {status === "REQUESTED" && (
              <SearchingSheet
                offers={activeOffers}
                suggestedPrice={Number(trip.pricing)}
                onSelectDriver={(offerId) => acceptOfferMutation.mutate(offerId)}
                onCancel={() => cancelMutation.mutate()}
              />
            )}

            {(status === "ACCEPTED" || status === "ON_TRIP") && trip.captain && (
              <DriverSheet
                captain={trip.captain}
                status={status}
                otp={trip.otp}
                copiedOTP={copiedOTP}
                onCopyOTP={copyOTP}
                onOpenChat={() => setIsChatOpen(true)}
                onCancel={status === "ACCEPTED" ? () => cancelMutation.mutate() : undefined}
              />
            )}

            {status === "COMPLETED" && (
              <CompletedSheet
                pricing={trip.pricing.toString()}
                onRate={() => router.push("/")}
              />
            )}

            {status === "CANCELLED" && (
              <CancelledSheet onGoBack={() => router.push("/")} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Premium Chat */}
      {trip.captain && (
        <PremiumChat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          driverName={trip.captain.name}
        />
      )}
    </div>
  );
}


// ===============================================
// LOADING SCREEN
// ===============================================
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary"
      />
    </div>
  );
}

// ===============================================
// HEADER
// ===============================================
function Header({ status }: { status: TripStatus }) {
  const statusConfig = {
    REQUESTED: { label: "Finding Driver", color: "bg-amber-500" },
    ACCEPTED: { label: "Driver En Route", color: "bg-blue-500" },
    ON_TRIP: { label: "Trip in Progress", color: "bg-emerald-500" },
    COMPLETED: { label: "Trip Completed", color: "bg-gray-500" },
    CANCELLED: { label: "Trip Cancelled", color: "bg-red-500" },
  };

  const config = statusConfig[status];

  return (
    <div className="p-6 pointer-events-auto">
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={cn("w-3 h-3 rounded-full", config.color)}
        />
        <span className="text-sm font-black uppercase tracking-wider text-white/60">
          {config.label}
        </span>
      </div>
    </div>
  );
}

import { DriverSelector } from "@/components/driver-selector";

// ===============================================
// SEARCHING SHEET - PREMIUM RADAR ANIMATION
// ===============================================
function SearchingSheet({
  offers = [],
  suggestedPrice,
  onSelectDriver,
  onCancel
}: {
  offers?: {
    id: string;
    captainName: string;
    captainRating: number;
    captainTrips: number;
    captainVehicle: string;
    amount: number;
  }[];
  suggestedPrice: number;
  onSelectDriver: (offerId: string) => void;
  onCancel: () => void;
}) {
  const hasOffers = offers.length > 0;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="bg-black/95 backdrop-blur-2xl rounded-t-[2rem] p-6 border-t border-white/10"
    >
      <AnimatePresence mode="wait">
        {!hasOffers ? (
          <motion.div
            key="searching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Radar Animation */}
            <div className="flex justify-center mb-6">
              <div className="relative w-28 h-28">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-primary/40"
                    animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.6,
                      ease: "easeOut",
                    }}
                  />
                ))}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Car className="w-12 h-12 text-primary" />
                </motion.div>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-white mb-2">
                Finding Your Premium Driver
              </h2>
              <p className="text-white/50 text-sm">
                Connecting you with an elite chauffeur nearby...
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="offers"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <DriverSelector
              suggestedPrice={suggestedPrice}
              drivers={offers.map(o => ({
                id: o.id,
                name: o.captainName,
                rating: Number(o.captainRating),
                totalTrips: o.captainTrips || 100,
                carModel: o.captainVehicle || "Tesla Model S",
                carPlate: "ONYX-001",
                eta: "3-5 min",
                price: Number(o.amount),
                isElite: Number(o.captainRating) >= 4.9,
                isVerified: true
              }))}
              onSelect={(driver) => onSelectDriver(driver.id)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={onCancel}
        className="w-full py-4 rounded-2xl border border-white/10 text-white/50 font-bold text-sm uppercase tracking-wider hover:bg-white/5 transition-all"
      >
        Cancel Request
      </button>
    </motion.div>
  );
}


// ===============================================
// DRIVER SHEET - PREMIUM DRIVER INFO
// ===============================================
function DriverSheet({
  captain,
  status,
  otp,
  copiedOTP,
  onCopyOTP,
  onCancel,
}: {
  captain: Captain;
  status: TripStatus;
  otp: string;
  copiedOTP: boolean;
  onCopyOTP: () => void;
  onOpenChat: () => void;
  onCancel?: () => void;
}) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="bg-black/95 backdrop-blur-2xl rounded-t-[2rem] p-6 border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.8)]"
    >
      {/* Status Badge */}
      <div className="flex justify-center mb-6">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className={cn(
            "px-4 py-2 rounded-full flex items-center gap-2",
            status === "ON_TRIP"
              ? "bg-emerald-500/20 border border-emerald-500/30"
              : "bg-primary/20 border border-primary/30"
          )}
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className={cn(
              "w-2 h-2 rounded-full",
              status === "ON_TRIP" ? "bg-emerald-500" : "bg-primary"
            )}
          />
          <span
            className={cn(
              "text-xs font-black uppercase tracking-wider",
              status === "ON_TRIP" ? "text-emerald-500" : "text-primary"
            )}
          >
            {status === "ON_TRIP" ? "On Trip" : "Driver Arriving"}
          </span>
        </motion.div>
      </div>

      {/* Driver Info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-600/20 flex items-center justify-center border-2 border-primary/30">
            <span className="text-2xl font-black text-primary">
              {captain.name.charAt(0)}
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-black">
            <Shield className="w-3 h-3 text-black" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-black text-white">{captain.name}</h3>
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="font-bold text-white">4.9</span>
            <span className="text-white/40">• Elite Driver</span>
          </div>
        </div>

        <Crown className="w-6 h-6 text-primary" />
      </div>

      {/* Vehicle Info */}
      {captain.vehicle && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 mb-6">
          <div className="flex items-center gap-3">
            <Car className="w-5 h-5 text-white/60" />
            <span className="font-bold text-white">{captain.vehicle}</span>
          </div>
        </div>
      )}

      {/* OTP Section */}
      <div className="mb-6">
        <button
          onClick={onCopyOTP}
          className="w-full p-4 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-between group hover:bg-primary/20 transition-all"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <div className="text-left">
              <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
                Your Verification Code
              </p>
              <p className="text-3xl font-black text-primary tracking-[0.3em]">
                {otp}
              </p>
            </div>
          </div>
          {copiedOTP ? (
            <Check className="w-5 h-5 text-emerald-500" />
          ) : (
            <Copy className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
          )}
        </button>
        <p className="text-[10px] text-white/30 text-center mt-2 uppercase tracking-wider">
          Share this code with your driver to start the trip
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <ActionButton icon={Phone} label="Call" />
        <ActionButton icon={MessageCircle} label="Chat" onClick={onOpenChat} />
        <ActionButton icon={Share2} label="Share" />
        {onCancel && (
          <ActionButton icon={X} label="Cancel" onClick={onCancel} variant="danger" />
        )}
      </div>
    </motion.div>
  );
}

// ===============================================
// COMPLETED SHEET
// ===============================================
function CompletedSheet({
  pricing,
  onRate,
}: {
  pricing: string;
  onRate: () => void;
}) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="bg-black/95 backdrop-blur-2xl rounded-t-[2rem] p-6 border-t border-white/10"
    >
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30"
        >
          <Check className="w-10 h-10 text-emerald-500" />
        </motion.div>
        <h2 className="text-2xl font-black text-white mb-2">Trip Completed</h2>
        <p className="text-4xl font-black text-primary">R$ {pricing}</p>
      </div>

      <button
        onClick={onRate}
        className="w-full py-4 rounded-2xl bg-primary text-black font-black text-sm uppercase tracking-wider hover:bg-primary/90 transition-all"
      >
        Rate Your Trip
      </button>
    </motion.div>
  );
}

// ===============================================
// CANCELLED SHEET
// ===============================================
function CancelledSheet({ onGoBack }: { onGoBack: () => void }) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="bg-black/95 backdrop-blur-2xl rounded-t-[2rem] p-6 border-t border-white/10"
    >
      <div className="text-center mb-6">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
          <X className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Trip Cancelled</h2>
        <p className="text-white/50">This trip has been cancelled</p>
      </div>

      <button
        onClick={onGoBack}
        className="w-full py-4 rounded-2xl bg-white/10 text-white font-black text-sm uppercase tracking-wider hover:bg-white/20 transition-all"
      >
        Book Another Ride
      </button>
    </motion.div>
  );
}

// ===============================================
// ACTION BUTTON
// ===============================================
function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = "default",
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl transition-all",
        variant === "danger"
          ? "bg-red-500/10 border border-red-500/20 hover:bg-red-500/20"
          : "bg-white/5 border border-white/5 hover:bg-white/10"
      )}
    >
      <Icon
        className={cn(
          "w-5 h-5",
          variant === "danger" ? "text-red-500" : "text-white/60"
        )}
      />
      <span
        className={cn(
          "text-[10px] font-black uppercase tracking-wider",
          variant === "danger" ? "text-red-500/80" : "text-white/40"
        )}
      >
        {label}
      </span>
    </button>
  );
}
