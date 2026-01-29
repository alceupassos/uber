"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Check,
    X,
    Clock,
    Zap,
    Crown,
    Users,
    Sparkles,
    ChevronUp,
    ChevronDown,
    MessageCircle,
} from "lucide-react";

// ===============================================
// TYPES
// ===============================================
export type PriceOffer = {
    id: string;
    amount: number;
    proposedBy: "user" | "captain";
    captainId?: string;
    captainName?: string;
    captainRating?: number;
    status: "pending" | "accepted" | "rejected" | "expired" | "countered";
    createdAt: Date;
    expiresAt: Date;
};

export type NegotiationState = {
    userOffer: number;
    suggestedPrice: number;
    minPrice: number;
    maxPrice: number;
    activeOffers: PriceOffer[];
    status: "idle" | "proposing" | "waiting" | "negotiating" | "accepted";
};

// ===============================================
// PRICE NEGOTIATION SLIDER
// Ultra-premium slider for price proposal
// ===============================================
type PriceSliderProps = {
    value: number;
    min: number;
    max: number;
    suggested: number;
    onChange: (value: number) => void;
    currency?: string;
    className?: string;
};

export function PriceSlider({
    value,
    min,
    max,
    suggested,
    onChange,
    currency = "R$",
    className,
}: PriceSliderProps) {
    const percentage = ((value - min) / (max - min)) * 100;
    const suggestedPercentage = ((suggested - min) / (max - min)) * 100;

    // Quick adjustment buttons
    const adjustments = [
        { label: "-10", value: -10, icon: TrendingDown },
        { label: "-5", value: -5, icon: ChevronDown },
        { label: "+5", value: 5, icon: ChevronUp },
        { label: "+10", value: 10, icon: TrendingUp },
    ];

    const handleAdjust = (amount: number) => {
        const newValue = Math.min(max, Math.max(min, value + amount));
        onChange(newValue);
    };

    return (
        <div className={cn("space-y-6", className)}>
            {/* Current Offer Display */}
            <div className="text-center">
                <motion.div
                    key={value}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-baseline gap-2"
                >
                    <span className="text-2xl font-bold text-white/50">{currency}</span>
                    <span className="text-6xl font-black text-white tabular-nums">
                        {value.toFixed(2)}
                    </span>
                </motion.div>

                {/* Price comparison indicator */}
                <div className="flex items-center justify-center gap-2 mt-2">
                    {value < suggested ? (
                        <>
                            <TrendingDown className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-bold text-emerald-500">
                                {((1 - value / suggested) * 100).toFixed(0)}% abaixo da média
                            </span>
                        </>
                    ) : value > suggested ? (
                        <>
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <span className="text-sm font-bold text-primary">
                                {((value / suggested - 1) * 100).toFixed(0)}% acima da média
                            </span>
                        </>
                    ) : (
                        <>
                            <Zap className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-bold text-blue-500">Preço sugerido</span>
                        </>
                    )}
                </div>
            </div>

            {/* Premium Slider Track */}
            <div className="relative h-16 flex items-center">
                {/* Track background */}
                <div className="absolute inset-x-0 h-3 rounded-full bg-white/5 overflow-hidden">
                    {/* Gradient fill */}
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-primary to-red-500"
                        style={{ width: `${percentage}%` }}
                        layoutId="slider-fill"
                    />
                </div>

                {/* Suggested price marker */}
                <motion.div
                    className="absolute top-0 h-full flex flex-col items-center justify-end"
                    style={{ left: `${suggestedPercentage}%` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="w-0.5 h-8 bg-white/30" />
                    <span className="text-[10px] font-bold text-white/40 mt-1">
                        Média
                    </span>
                </motion.div>

                {/* Thumb */}
                <motion.div
                    className="absolute z-10 cursor-grab active:cursor-grabbing"
                    style={{ left: `calc(${percentage}% - 24px)` }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary via-amber-400 to-primary shadow-[0_0_30px_rgba(234,179,8,0.5)] flex items-center justify-center border-2 border-white/20">
                        <DollarSign className="w-5 h-5 text-black" />
                    </div>
                </motion.div>

                {/* Hidden range input for accessibility */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={1}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-grab"
                />
            </div>

            {/* Quick Adjustment Buttons */}
            <div className="flex items-center justify-center gap-2">
                {adjustments.map((adj) => (
                    <motion.button
                        key={adj.label}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAdjust(adj.value)}
                        className={cn(
                            "px-4 py-2 rounded-xl flex items-center gap-1 transition-all",
                            "border bg-white/5 hover:bg-white/10",
                            adj.value < 0 ? "border-emerald-500/30 text-emerald-500" : "border-primary/30 text-primary"
                        )}
                    >
                        <adj.icon className="w-4 h-4" />
                        <span className="font-bold">{adj.label}</span>
                    </motion.button>
                ))}
            </div>

            {/* Price Range Labels */}
            <div className="flex items-center justify-between text-xs font-bold text-white/30">
                <span>{currency} {min.toFixed(2)}</span>
                <span>{currency} {max.toFixed(2)}</span>
            </div>
        </div>
    );
}

// ===============================================
// CAPTAIN OFFER CARD
// Displays an offer from a captain
// ===============================================
type CaptainOfferCardProps = {
    offer: PriceOffer;
    onAccept: () => void;
    onReject: () => void;
    onCounter: () => void;
};

export function CaptainOfferCard({
    offer,
    onAccept,
    onReject,
    onCounter,
}: CaptainOfferCardProps) {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            const expires = new Date(offer.expiresAt).getTime();
            const remaining = Math.max(0, Math.floor((expires - now) / 1000));
            setTimeLeft(remaining);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [offer.expiresAt]);

    const isExpiring = timeLeft <= 30;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={cn(
                "p-4 rounded-2xl border backdrop-blur-xl transition-all",
                isExpiring
                    ? "bg-red-500/10 border-red-500/30 animate-pulse"
                    : "bg-white/5 border-white/10"
            )}
        >
            {/* Timer Badge */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-lg font-black text-primary">
                            {offer.captainName?.charAt(0) || "C"}
                        </span>
                    </div>
                    <div>
                        <p className="font-bold text-white">{offer.captainName || "Captain"}</p>
                        <div className="flex items-center gap-1 text-xs text-white/50">
                            <Crown className="w-3 h-3 text-primary" />
                            <span>{offer.captainRating?.toFixed(1) || "4.9"}</span>
                        </div>
                    </div>
                </div>

                <div
                    className={cn(
                        "px-3 py-1.5 rounded-full flex items-center gap-1.5",
                        isExpiring
                            ? "bg-red-500/20 text-red-500"
                            : "bg-white/10 text-white/60"
                    )}
                >
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs font-black tabular-nums">
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                    </span>
                </div>
            </div>

            {/* Offer Amount */}
            <div className="text-center py-4">
                <span className="text-lg text-white/50">Oferta do motorista</span>
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-black text-primary mt-1"
                >
                    R$ {offer.amount.toFixed(2)}
                </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onReject}
                    className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 font-bold flex items-center justify-center gap-2"
                >
                    <X className="w-4 h-4" />
                    Recusar
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCounter}
                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold flex items-center justify-center gap-2"
                >
                    <MessageCircle className="w-4 h-4" />
                    Contrapropor
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onAccept}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-amber-400 text-black font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                >
                    <Check className="w-4 h-4" />
                    Aceitar
                </motion.button>
            </div>
        </motion.div>
    );
}

// ===============================================
// NEGOTIATION PANEL
// Full negotiation interface
// ===============================================
type NegotiationPanelProps = {
    suggestedPrice: number;
    minPrice?: number;
    maxPrice?: number;
    onPropose: (amount: number) => void;
    onAcceptOffer: (offerId: string) => void;
    onRejectOffer: (offerId: string) => void;
    onCounter: (offerId: string, newAmount: number) => void;
    activeOffers?: PriceOffer[];
    status?: NegotiationState["status"];
    className?: string;
};

export function NegotiationPanel({
    suggestedPrice,
    minPrice,
    maxPrice,
    onPropose,
    onAcceptOffer,
    onRejectOffer,
    onCounter,
    activeOffers = [],
    status = "idle",
    className,
}: NegotiationPanelProps) {
    const min = minPrice || suggestedPrice * 0.5;
    const max = maxPrice || suggestedPrice * 2;
    const [offerAmount, setOfferAmount] = useState(suggestedPrice);
    const [showCounterInput, setShowCounterInput] = useState<string | null>(null);
    const [counterAmount, setCounterAmount] = useState(suggestedPrice);

    const handlePropose = useCallback(() => {
        onPropose(offerAmount);
    }, [offerAmount, onPropose]);

    const handleCounter = useCallback(
        (offerId: string) => {
            onCounter(offerId, counterAmount);
            setShowCounterInput(null);
        },
        [counterAmount, onCounter]
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("space-y-6", className)}
        >
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-xs font-black uppercase tracking-wider text-primary">
                        Negociação de Preço
                    </span>
                </div>
                <h2 className="text-2xl font-black text-white">
                    Proponha seu valor
                </h2>
                <p className="text-sm text-white/50 mt-1">
                    Motoristas próximos podem aceitar ou fazer contrapropostas
                </p>
            </div>

            {/* Price Slider */}
            <PriceSlider
                value={offerAmount}
                min={min}
                max={max}
                suggested={suggestedPrice}
                onChange={setOfferAmount}
            />

            {/* Active Offers from Captains */}
            <AnimatePresence mode="popLayout">
                {activeOffers.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                    >
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            <span className="text-sm font-bold text-white/60">
                                {activeOffers.length} motorista(s) interessado(s)
                            </span>
                        </div>

                        {activeOffers.map((offer) => (
                            <CaptainOfferCard
                                key={offer.id}
                                offer={offer}
                                onAccept={() => onAcceptOffer(offer.id)}
                                onReject={() => onRejectOffer(offer.id)}
                                onCounter={() => {
                                    setCounterAmount(offer.amount);
                                    setShowCounterInput(offer.id);
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Counter Offer Modal */}
            <AnimatePresence>
                {showCounterInput && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center"
                        onClick={() => setShowCounterInput(null)}
                    >
                        <motion.div
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg bg-[#0a0a0a] rounded-t-3xl p-6 border-t border-white/10"
                        >
                            <h3 className="text-xl font-black text-white text-center mb-6">
                                Sua contraproposta
                            </h3>

                            <PriceSlider
                                value={counterAmount}
                                min={min}
                                max={max}
                                suggested={suggestedPrice}
                                onChange={setCounterAmount}
                            />

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowCounterInput(null)}
                                    className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleCounter(showCounterInput)}
                                    className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-primary to-amber-400 text-black font-bold"
                                >
                                    Enviar Proposta
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Propose Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePropose}
                disabled={status === "waiting"}
                className={cn(
                    "w-full py-5 rounded-2xl font-black text-lg uppercase tracking-wider transition-all",
                    status === "waiting"
                        ? "bg-white/10 text-white/30 cursor-not-allowed"
                        : "bg-gradient-to-r from-primary via-amber-400 to-primary text-black shadow-[0_0_30px_rgba(234,179,8,0.4)]"
                )}
            >
                {status === "waiting" ? (
                    <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        Aguardando motoristas...
                    </motion.span>
                ) : (
                    <>
                        <Zap className="w-5 h-5 inline mr-2" />
                        Propor R$ {offerAmount.toFixed(2)}
                    </>
                )}
            </motion.button>

            {/* Info Text */}
            <p className="text-center text-xs text-white/30">
                Sua proposta será enviada para motoristas próximos.
                <br />
                Eles podem aceitar imediatamente ou fazer contrapropostas.
            </p>
        </motion.div>
    );
}

// ===============================================
// HOOK: Use Price Negotiation
// ===============================================
export function usePriceNegotiation(tripId: string) {
    const [state, setState] = useState<NegotiationState>({
        userOffer: 0,
        suggestedPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        activeOffers: [],
        status: "idle",
    });

    useEffect(() => {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001/ws";
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "subscribe_negotiation", tripId }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case "offer_received":
                        setState((prev) => ({
                            ...prev,
                            activeOffers: [...prev.activeOffers, data.offer],
                            status: "negotiating",
                        }));
                        break;

                    case "offer_accepted":
                        setState((prev) => ({
                            ...prev,
                            status: "accepted",
                        }));
                        break;

                    case "offer_rejected":
                        setState((prev) => ({
                            ...prev,
                            activeOffers: prev.activeOffers.filter((o) => o.id !== data.offerId),
                        }));
                        break;

                    case "offer_expired":
                        setState((prev) => ({
                            ...prev,
                            activeOffers: prev.activeOffers.filter((o) => o.id !== data.offerId),
                        }));
                        break;
                }
            } catch (err) {
                console.error("WebSocket message error:", err);
            }
        };

        return () => {
            ws.close();
        };
    }, [tripId]);

    const proposePrice = useCallback((amount: number) => {
        setState((prev) => ({ ...prev, userOffer: amount, status: "waiting" }));
        // TODO: Send to API
    }, []);

    const acceptOffer = useCallback((offerId: string) => {
        setState((prev) => ({ ...prev, status: "accepted" }));
        // TODO: Send to API
    }, []);

    const rejectOffer = useCallback((offerId: string) => {
        setState((prev) => ({
            ...prev,
            activeOffers: prev.activeOffers.filter((o) => o.id !== offerId),
        }));
        // TODO: Send to API - will use offerId
    }, []);

    const counterOffer = useCallback((_offerId: string, _newAmount: number) => {
        // TODO: Send to API - will use offerId and newAmount
    }, []);

    return {
        state,
        proposePrice,
        acceptOffer,
        rejectOffer,
        counterOffer,
    };
}
