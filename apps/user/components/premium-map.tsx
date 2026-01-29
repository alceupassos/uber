"use client";

import MapLibreGL, { type MarkerOptions } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Crown, Clock, Shield, Star, Navigation2, MapPin } from "lucide-react";

// ===============================================
// MAPBOX PREMIUM DARK STYLE - LUXURY OBSIDIAN
// ===============================================
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const PREMIUM_STYLES = {
    // Ultra-dark luxury style - Mapbox Dark with custom adjustments
    dark: `https://api.mapbox.com/styles/v1/mapbox/dark-v11?access_token=${MAPBOX_TOKEN}`,
    // Alternative: Navigation dark for better road visibility
    navigation: `https://api.mapbox.com/styles/v1/mapbox/navigation-night-v1?access_token=${MAPBOX_TOKEN}`,
};

// ===============================================
// MAP CONTEXT
// ===============================================
type MapContextValue = {
    map: MapLibreGL.Map | null;
    isLoaded: boolean;
};

const MapContext = createContext<MapContextValue | null>(null);

function useMap() {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error("useMap must be used within a PremiumMap component");
    }
    return context;
}

// ===============================================
// PREMIUM MAP COMPONENT
// ===============================================
type PremiumMapProps = {
    children?: ReactNode;
    center?: [number, number];
    zoom?: number;
    pitch?: number;
    bearing?: number;
    interactive?: boolean;
    onLoad?: () => void;
    className?: string;
};

export function PremiumMap({
    children,
    center = [-43.1729, -22.9068], // Rio de Janeiro default
    zoom = 14,
    pitch = 45, // 3D tilt for luxury feel
    bearing = -17.6,
    interactive = true,
    onLoad,
    className,
}: PremiumMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapLibreGL.Map | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted || !containerRef.current) return;

        const mapInstance = new MapLibreGL.Map({
            container: containerRef.current,
            style: PREMIUM_STYLES.dark,
            center,
            zoom,
            pitch,
            bearing,
            attributionControl: false,
            interactive,
            antialias: true, // Smoother edges
        });

        mapInstance.on("load", () => {
            setIsLoaded(true);
            onLoad?.();

            // Add 3D buildings layer for ultra-premium feel
            const layers = mapInstance.getStyle()?.layers;
            if (layers) {
                const labelLayerId = layers.find(
                    (layer) => layer.type === "symbol" && layer.layout?.["text-field"]
                )?.id;

                mapInstance.addLayer(
                    {
                        id: "3d-buildings",
                        source: "composite",
                        "source-layer": "building",
                        filter: ["==", "extrude", "true"],
                        type: "fill-extrusion",
                        minzoom: 14,
                        paint: {
                            "fill-extrusion-color": "#1a1a1a",
                            "fill-extrusion-height": ["get", "height"],
                            "fill-extrusion-base": ["get", "min_height"],
                            "fill-extrusion-opacity": 0.8,
                        },
                    },
                    labelLayerId
                );
            }
        });

        mapRef.current = mapInstance;

        return () => {
            mapInstance.remove();
            mapRef.current = null;
        };
    }, [isMounted]);

    return (
        <MapContext.Provider value={{ map: mapRef.current, isLoaded }}>
            <div ref={containerRef} className={cn("relative w-full h-full", className)}>
                {/* Premium Loading State */}
                <AnimatePresence>
                    {!isLoaded && (
                        <motion.div
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 z-20 flex items-center justify-center bg-[#0a0a0a]"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary"
                                />
                                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary/60">
                                    Loading Premium Experience
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Cinematic Vignette Overlay */}
                <div className="absolute inset-0 pointer-events-none z-10">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
                </div>

                {isMounted && children}
            </div>
        </MapContext.Provider>
    );
}

// ===============================================
// PREMIUM MARKER - ANIMATED LUXURY MARKERS
// ===============================================
type PremiumMarkerProps = {
    longitude: number;
    latitude: number;
    type: "pickup" | "destination" | "driver" | "vip";
    label?: string;
    rotation?: number;
    animate?: boolean;
    onClick?: () => void;
};

export function PremiumMarker({
    longitude,
    latitude,
    type,
    label,
    rotation = 0,
    animate = true,
    onClick,
}: PremiumMarkerProps) {
    const { map, isLoaded } = useMap();
    const markerRef = useRef<MapLibreGL.Marker | null>(null);
    const elementRef = useRef<HTMLDivElement | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!isLoaded || !map) return;

        const container = document.createElement("div");
        elementRef.current = container;

        const marker = new MapLibreGL.Marker({
            element: container,
            rotation,
            rotationAlignment: type === "driver" ? "map" : "viewport",
        })
            .setLngLat([longitude, latitude])
            .addTo(map);

        if (onClick) {
            container.addEventListener("click", onClick);
        }

        markerRef.current = marker;
        setIsReady(true);

        return () => {
            if (onClick) container.removeEventListener("click", onClick);
            marker.remove();
            markerRef.current = null;
            elementRef.current = null;
        };
    }, [map, isLoaded]);

    // Smooth position updates for driver tracking
    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.setLngLat([longitude, latitude]);
        }
    }, [longitude, latitude]);

    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.setRotation(rotation);
        }
    }, [rotation]);

    if (!isReady || !elementRef.current) return null;

    return createPortal(
        <MarkerVisual type={type} label={label} animate={animate} />,
        elementRef.current
    );
}

// ===============================================
// MARKER VISUALS - ULTRA PREMIUM DESIGN
// ===============================================
function MarkerVisual({
    type,
    label,
    animate,
}: {
    type: "pickup" | "destination" | "driver" | "vip";
    label?: string;
    animate: boolean;
}) {
    const variants = {
        pickup: {
            icon: MapPin,
            bgColor: "bg-emerald-500",
            glowColor: "shadow-[0_0_30px_rgba(16,185,129,0.6)]",
            pulseColor: "bg-emerald-500/20",
        },
        destination: {
            icon: Navigation2,
            bgColor: "bg-primary",
            glowColor: "shadow-[0_0_30px_rgba(234,179,8,0.6)]",
            pulseColor: "bg-primary/20",
        },
        driver: {
            icon: Crown, // VIP crown for luxury drivers
            bgColor: "bg-gradient-to-br from-primary via-amber-400 to-primary",
            glowColor: "shadow-[0_0_40px_rgba(234,179,8,0.8)]",
            pulseColor: "bg-primary/30",
        },
        vip: {
            icon: Crown,
            bgColor: "bg-gradient-to-br from-purple-500 via-fuchsia-500 to-purple-600",
            glowColor: "shadow-[0_0_40px_rgba(168,85,247,0.8)]",
            pulseColor: "bg-purple-500/30",
        },
    };

    const config = variants[type];
    const Icon = config.icon;

    return (
        <div className="relative flex flex-col items-center cursor-pointer group">
            {/* Pulse animation ring */}
            {animate && (
                <motion.div
                    className={cn(
                        "absolute w-16 h-16 rounded-full",
                        config.pulseColor
                    )}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
            )}

            {/* Main marker */}
            <motion.div
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 15 }}
                whileHover={{ scale: 1.1 }}
                className={cn(
                    "relative z-10 w-12 h-12 rounded-full flex items-center justify-center",
                    "border-2 border-white/30",
                    config.bgColor,
                    config.glowColor,
                    "transition-transform duration-200"
                )}
            >
                <Icon className="w-5 h-5 text-white drop-shadow-lg" />
            </motion.div>

            {/* Label */}
            {label && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="absolute top-full mt-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-sm border border-white/10"
                >
                    <span className="text-[10px] font-black uppercase tracking-wider text-white whitespace-nowrap">
                        {label}
                    </span>
                </motion.div>
            )}

            {/* Luxury badge for VIP */}
            {type === "vip" && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 z-20 w-5 h-5 bg-black rounded-full flex items-center justify-center border border-primary"
                >
                    <Star className="w-3 h-3 text-primary fill-primary" />
                </motion.div>
            )}
        </div>
    );
}

// ===============================================
// PREMIUM ROUTE LINE
// ===============================================
type PremiumRouteProps = {
    coordinates: [number, number][];
    animated?: boolean;
};

export function PremiumRoute({ coordinates, animated = true }: PremiumRouteProps) {
    const { map, isLoaded } = useMap();
    const sourceId = useRef(`route-${Date.now()}`);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isLoaded || !map || coordinates.length < 2) return;

        const id = sourceId.current;

        // Add gradient route
        map.addSource(id, {
            type: "geojson",
            data: {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates,
                },
            },
        });

        // Outer glow layer
        map.addLayer({
            id: `${id}-glow`,
            type: "line",
            source: id,
            paint: {
                "line-color": "#eab308",
                "line-width": 12,
                "line-opacity": 0.15,
                "line-blur": 8,
            },
        });

        // Main route line
        map.addLayer({
            id: `${id}-main`,
            type: "line",
            source: id,
            paint: {
                "line-color": "#eab308",
                "line-width": 4,
                "line-opacity": 0.9,
            },
            layout: {
                "line-cap": "round",
                "line-join": "round",
            },
        });

        // Animated dash layer
        if (animated) {
            map.addLayer({
                id: `${id}-dash`,
                type: "line",
                source: id,
                paint: {
                    "line-color": "#ffffff",
                    "line-width": 2,
                    "line-opacity": 0.6,
                    "line-dasharray": [0, 4, 3],
                },
                layout: {
                    "line-cap": "round",
                    "line-join": "round",
                },
            });

            // Animate the dash
            let dashOffset = 0;
            const animateDash = () => {
                dashOffset = (dashOffset + 1) % 12;
                map.setPaintProperty(`${id}-dash`, "line-dasharray", [
                    dashOffset,
                    4,
                    3,
                ]);
                requestAnimationFrame(animateDash);
            };
            animateDash();
        }

        return () => {
            if (map.getLayer(`${id}-glow`)) map.removeLayer(`${id}-glow`);
            if (map.getLayer(`${id}-main`)) map.removeLayer(`${id}-main`);
            if (map.getLayer(`${id}-dash`)) map.removeLayer(`${id}-dash`);
            if (map.getSource(id)) map.removeSource(id);
        };
    }, [isLoaded, map, coordinates]);

    return null;
}

// ===============================================
// ETA DISPLAY - LUXURY INFO CARD
// ===============================================
type ETADisplayProps = {
    minutes: number;
    distance?: string;
    price?: string;
    className?: string;
};

export function ETADisplay({ minutes, distance, price, className }: ETADisplayProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "absolute bottom-4 left-4 right-4 z-20",
                "bg-black/80 backdrop-blur-xl rounded-3xl p-5",
                "border border-white/10",
                "shadow-[0_0_60px_rgba(0,0,0,0.8)]",
                className
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-white">{minutes}</span>
                            <span className="text-sm font-bold text-white/50 uppercase tracking-wider">min</span>
                        </div>
                        {distance && (
                            <span className="text-xs font-bold text-white/40 uppercase tracking-wider">{distance}</span>
                        )}
                    </div>
                </div>

                {price && (
                    <div className="text-right">
                        <div className="text-2xl font-black text-primary">{price}</div>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Estimated</span>
                    </div>
                )}
            </div>

            {/* Luxury indicator */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    Premium Verified Driver
                </span>
            </div>
        </motion.div>
    );
}

// ===============================================
// VEHICLE SELECTOR - PREMIUM FLEET
// ===============================================
type VehicleOption = {
    id: string;
    name: string;
    description: string;
    eta: number;
    price: string;
    multiplier: number;
    icon: string;
    tier: "standard" | "premium" | "black" | "elite";
};

const PREMIUM_VEHICLES: VehicleOption[] = [
    {
        id: "black",
        name: "ONYX Black",
        description: "Luxury sedan experience",
        eta: 3,
        price: "R$ 45,00",
        multiplier: 1.5,
        icon: "🚗",
        tier: "black",
    },
    {
        id: "elite",
        name: "ONYX Elite",
        description: "Premium SUV with amenities",
        eta: 5,
        price: "R$ 75,00",
        multiplier: 2.0,
        icon: "🚙",
        tier: "elite",
    },
    {
        id: "vip",
        name: "ONYX VIP",
        description: "Exclusive chauffeur service",
        eta: 8,
        price: "R$ 150,00",
        multiplier: 3.5,
        icon: "👑",
        tier: "elite",
    },
];

type VehicleSelectorProps = {
    selected: string;
    onSelect: (id: string) => void;
    className?: string;
};

export function VehicleSelector({ selected, onSelect, className }: VehicleSelectorProps) {
    return (
        <div className={cn("space-y-3", className)}>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 px-1">
                Select Your Experience
            </h3>

            {PREMIUM_VEHICLES.map((vehicle, index) => (
                <motion.button
                    key={vehicle.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onSelect(vehicle.id)}
                    className={cn(
                        "w-full p-4 rounded-2xl border transition-all duration-300",
                        "flex items-center gap-4",
                        selected === vehicle.id
                            ? "bg-primary/10 border-primary shadow-[0_0_30px_rgba(234,179,8,0.2)]"
                            : "bg-white/[0.02] border-white/5 hover:border-white/10"
                    )}
                >
                    <div
                        className={cn(
                            "w-14 h-14 rounded-xl flex items-center justify-center text-2xl",
                            vehicle.tier === "elite"
                                ? "bg-gradient-to-br from-primary/20 to-amber-600/20"
                                : "bg-white/5"
                        )}
                    >
                        {vehicle.icon}
                    </div>

                    <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                            <span className="font-black text-white">{vehicle.name}</span>
                            {vehicle.tier === "elite" && (
                                <Crown className="w-4 h-4 text-primary" />
                            )}
                        </div>
                        <p className="text-xs text-white/40">{vehicle.description}</p>
                    </div>

                    <div className="text-right">
                        <div className="font-black text-primary">{vehicle.price}</div>
                        <div className="text-[10px] text-white/40">{vehicle.eta} min</div>
                    </div>
                </motion.button>
            ))}
        </div>
    );
}
