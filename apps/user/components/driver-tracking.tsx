"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    PremiumMap,
    PremiumMarker,
    PremiumRoute,
    ETADisplay,
} from "./premium-map";
import {
    Phone,
    MessageCircle,
    Share2,
    Shield,
    X,
    Car,
    Star,
    MapPin,
    Navigation,
} from "lucide-react";

// ===============================================
// DRIVER TRACKING COMPONENT
// Real-time tracking with smooth 60fps animations
// ===============================================

type DriverInfo = {
    id: string;
    name: string;
    photo?: string;
    rating: number;
    trips: number;
    vehicle: {
        make: string;
        model: string;
        color: string;
        plate: string;
    };
    currentLocation: [number, number];
    heading: number;
};

type TrackingState = {
    status: "searching" | "driver_assigned" | "arriving" | "arrived" | "on_trip" | "completed";
    eta?: number;
    distance?: string;
};

type DriverTrackingProps = {
    origin: { longitude: number; latitude: number; name: string };
    destination: { longitude: number; latitude: number; name: string };
    driver?: DriverInfo;
    trackingState: TrackingState;
    route?: [number, number][];
    onCall?: () => void;
    onMessage?: () => void;
    onShare?: () => void;
    onCancel?: () => void;
    className?: string;
};

export function DriverTracking({
    origin,
    destination,
    driver,
    trackingState,
    route,
    onCall,
    onMessage,
    onShare,
    onCancel,
    className,
}: DriverTrackingProps) {
    const [showDetails, setShowDetails] = useState(false);

    // Calculate map center based on tracking state
    const mapCenter = driver?.currentLocation || [origin.longitude, origin.latitude];

    return (
        <div className={cn("relative h-full", className)}>
            {/* Premium Map */}
            <PremiumMap
                center={mapCenter as [number, number]}
                zoom={15}
                pitch={trackingState.status === "on_trip" ? 60 : 45}
            >
                {/* Origin Marker */}
                <PremiumMarker
                    longitude={origin.longitude}
                    latitude={origin.latitude}
                    type="pickup"
                    label={origin.name.substring(0, 20)}
                    animate={trackingState.status === "arriving"}
                />

                {/* Destination Marker */}
                <PremiumMarker
                    longitude={destination.longitude}
                    latitude={destination.latitude}
                    type="destination"
                    label={destination.name.substring(0, 20)}
                />

                {/* Driver Marker */}
                {driver && (
                    <PremiumMarker
                        longitude={driver.currentLocation[0]}
                        latitude={driver.currentLocation[1]}
                        type="driver"
                        rotation={driver.heading}
                        animate
                    />
                )}

                {/* Route */}
                {route && route.length > 0 && (
                    <PremiumRoute coordinates={route} animated />
                )}
            </PremiumMap>

            {/* Status Card Overlay */}
            <AnimatePresence>
                {trackingState.status === "searching" && (
                    <SearchingOverlay onCancel={onCancel} />
                )}

                {driver && trackingState.status !== "searching" && (
                    <DriverCard
                        driver={driver}
                        trackingState={trackingState}
                        showDetails={showDetails}
                        onToggleDetails={() => setShowDetails(!showDetails)}
                        onCall={onCall}
                        onMessage={onMessage}
                        onShare={onShare}
                        onCancel={onCancel}
                    />
                )}
            </AnimatePresence>

            {/* ETA Display */}
            {trackingState.eta && !showDetails && (
                <ETADisplay
                    minutes={trackingState.eta}
                    distance={trackingState.distance}
                />
            )}
        </div>
    );
}

// ===============================================
// SEARCHING OVERLAY - PREMIUM ANIMATION
// ===============================================
function SearchingOverlay({ onCancel }: { onCancel?: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute bottom-0 left-0 right-0 z-30"
        >
            <div className="bg-black/90 backdrop-blur-2xl rounded-t-[2rem] p-6 border-t border-white/10">
                {/* Radar Animation */}
                <div className="flex justify-center mb-6">
                    <div className="relative w-24 h-24">
                        {/* Pulse rings */}
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                className="absolute inset-0 rounded-full border-2 border-primary/30"
                                animate={{
                                    scale: [1, 2],
                                    opacity: [0.6, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.5,
                                    ease: "easeOut",
                                }}
                            />
                        ))}

                        {/* Center icon */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <Car className="w-10 h-10 text-primary" />
                        </motion.div>
                    </div>
                </div>

                <div className="text-center space-y-2 mb-6">
                    <h3 className="text-xl font-black text-white">Finding Your Driver</h3>
                    <p className="text-sm text-white/50">
                        Connecting you with a premium chauffeur nearby...
                    </p>
                </div>

                {/* Cancel Button */}
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="w-full py-4 rounded-2xl border border-white/10 text-white/60 font-bold text-sm uppercase tracking-wider hover:bg-white/5 transition-colors"
                    >
                        Cancel Request
                    </button>
                )}
            </div>
        </motion.div>
    );
}

// ===============================================
// DRIVER CARD - PREMIUM DRIVER INFO
// ===============================================
type DriverCardProps = {
    driver: DriverInfo;
    trackingState: TrackingState;
    showDetails: boolean;
    onToggleDetails: () => void;
    onCall?: () => void;
    onMessage?: () => void;
    onShare?: () => void;
    onCancel?: () => void;
};

function DriverCard({
    driver,
    trackingState,
    showDetails,
    onToggleDetails,
    onCall,
    onMessage,
    onShare,
    onCancel,
}: DriverCardProps) {
    const statusMessages = {
        driver_assigned: "Driver assigned",
        arriving: "Arriving at pickup",
        arrived: "Your driver has arrived",
        on_trip: "On the way to destination",
        completed: "Trip completed",
        searching: "Searching...",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute bottom-0 left-0 right-0 z-30"
        >
            <div className="bg-black/95 backdrop-blur-2xl rounded-t-[2rem] p-6 border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.8)]">
                {/* Drag Handle */}
                <button
                    onClick={onToggleDetails}
                    className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 hover:bg-white/30 transition-colors"
                />

                {/* Status Badge */}
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-center gap-2 mb-6"
                >
                    <div
                        className={cn(
                            "px-4 py-2 rounded-full flex items-center gap-2",
                            trackingState.status === "arrived"
                                ? "bg-emerald-500/20 border border-emerald-500/30"
                                : "bg-primary/20 border border-primary/30"
                        )}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className={cn(
                                "w-2 h-2 rounded-full",
                                trackingState.status === "arrived" ? "bg-emerald-500" : "bg-primary"
                            )}
                        />
                        <span
                            className={cn(
                                "text-xs font-black uppercase tracking-wider",
                                trackingState.status === "arrived" ? "text-emerald-500" : "text-primary"
                            )}
                        >
                            {statusMessages[trackingState.status]}
                        </span>
                    </div>
                </motion.div>

                {/* Driver Info */}
                <div className="flex items-center gap-4 mb-6">
                    {/* Driver Photo */}
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-600/20 flex items-center justify-center overflow-hidden border-2 border-primary/30">
                            {driver.photo ? (
                                <img
                                    src={driver.photo}
                                    alt={driver.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-2xl font-black text-primary">
                                    {driver.name.charAt(0)}
                                </span>
                            )}
                        </div>
                        {/* Verified Badge */}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-black">
                            <Shield className="w-3 h-3 text-black" />
                        </div>
                    </div>

                    {/* Driver Details */}
                    <div className="flex-1">
                        <h3 className="text-lg font-black text-white">{driver.name}</h3>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-primary fill-primary" />
                                <span className="font-bold text-white">{driver.rating}</span>
                            </div>
                            <span className="text-white/40">•</span>
                            <span className="text-white/50">{driver.trips}+ trips</span>
                        </div>
                    </div>

                    {/* ETA */}
                    {trackingState.eta && (
                        <div className="text-right">
                            <div className="text-3xl font-black text-primary">{trackingState.eta}</div>
                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                                MIN
                            </div>
                        </div>
                    )}
                </div>

                {/* Vehicle Info */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <Car className="w-5 h-5 text-white/60" />
                        </div>
                        <div>
                            <p className="font-bold text-white">
                                {driver.vehicle.make} {driver.vehicle.model}
                            </p>
                            <p className="text-xs text-white/40">{driver.vehicle.color}</p>
                        </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30">
                        <span className="text-sm font-black text-primary tracking-wider">
                            {driver.vehicle.plate}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <ActionButton icon={Phone} label="Call" onClick={onCall} />
                    <ActionButton icon={MessageCircle} label="Chat" onClick={onMessage} />
                    <ActionButton icon={Share2} label="Share" onClick={onShare} />
                    {trackingState.status !== "on_trip" && onCancel && (
                        <ActionButton icon={X} label="Cancel" onClick={onCancel} variant="danger" />
                    )}
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                    {showDetails && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-6 mt-6 border-t border-white/10">
                                {/* Trip Details */}
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                            <MapPin className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white/40 uppercase tracking-wider">
                                                Pickup
                                            </p>
                                            <p className="text-white font-medium">Your current location</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                                            <Navigation className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white/40 uppercase tracking-wider">
                                                Destination
                                            </p>
                                            <p className="text-white font-medium">Selected destination</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
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

// ===============================================
// HOOK: Use Driver Tracking with WebSocket
// ===============================================
export function useDriverTracking(tripId: string) {
    const [driver, setDriver] = useState<DriverInfo | undefined>();
    const [trackingState, setTrackingState] = useState<TrackingState>({
        status: "searching",
    });
    const [route, setRoute] = useState<[number, number][]>([]);

    useEffect(() => {
        // Connect to WebSocket for real-time updates
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001/ws";
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "subscribe_trip", tripId }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case "driver_assigned":
                        setDriver(data.driver);
                        setTrackingState({ status: "driver_assigned", eta: data.eta });
                        break;

                    case "driver_location":
                        setDriver((prev) =>
                            prev
                                ? {
                                    ...prev,
                                    currentLocation: data.location,
                                    heading: data.heading,
                                }
                                : undefined
                        );
                        setTrackingState((prev) => ({
                            ...prev,
                            eta: data.eta,
                            distance: data.distance,
                        }));
                        break;

                    case "trip_update":
                        setTrackingState((prev) => ({
                            ...prev,
                            status: data.status,
                        }));
                        break;

                    case "route_update":
                        setRoute(data.coordinates);
                        break;
                }
            } catch (err) {
                console.error("WebSocket message error:", err);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        return () => {
            ws.close();
        };
    }, [tripId]);

    return { driver, trackingState, route };
}
