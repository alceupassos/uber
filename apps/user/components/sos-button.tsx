"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Phone, Users, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SOSState = "idle" | "holding" | "active" | "canceled";

export function SOSButton() {
    const [state, setState] = useState<SOSState>("idle");
    const [holdProgress, setHoldProgress] = useState(0);
    const holdInterval = useRef<NodeJS.Timeout | null>(null);

    const startHolding = () => {
        if (state === "active") return;
        setState("holding");
        setHoldProgress(0);

        holdInterval.current = setInterval(() => {
            setHoldProgress((prev) => {
                if (prev >= 100) {
                    triggerSOS();
                    return 100;
                }
                return prev + 2; // ~1 second to fill (50 steps * 20ms)
            });
        }, 20);

        // Haptic feedback (if supported)
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate([200, 100, 200]);
        }
    };

    const stopHolding = () => {
        if (state !== "holding") return;
        if (holdInterval.current) clearInterval(holdInterval.current);
        setState("idle");
        setHoldProgress(0);
    };

    const triggerSOS = () => {
        if (holdInterval.current) clearInterval(holdInterval.current);
        setState("active");
        toast.error("MODO DE EMERGÊNCIA ATIVADO", {
            description: "Autoridades e contatos de confiança foram notificados.",
            duration: 10000,
        });

        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate([500, 200, 500, 200, 500]);
        }
    };

    return (
        <div className="fixed top-24 right-6 z-50">
            <AnimatePresence>
                {state === "active" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute bottom-full right-0 mb-4 w-72 bg-red-600 rounded-3xl p-6 shadow-[0_0_50px_rgba(220,38,38,0.5)] border border-white/20"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-8 h-8 text-white animate-pulse" />
                            <h3 className="text-xl font-black text-white italic">EMERGÊNCIA</h3>
                        </div>

                        <div className="space-y-3">
                            <button className="w-full py-3 rounded-xl bg-white text-red-600 font-bold flex items-center justify-center gap-2 hover:bg-gray-100">
                                <Phone className="w-4 h-4" /> Ligar 190
                            </button>
                            <button className="w-full py-3 rounded-xl bg-white/20 text-white font-bold flex items-center justify-center gap-2 hover:bg-white/30">
                                <Users className="w-4 h-4" /> Avisar Contatos
                            </button>
                            <button
                                onClick={() => setState("idle")}
                                className="w-full py-2 text-white/60 text-xs font-bold uppercase tracking-widest hover:text-white"
                            >
                                Falso Alarme / Cancelar
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative">
                {/* Hold Progress Circle */}
                <svg className="w-16 h-16 absolute -inset-0 -rotate-90 pointer-events-none">
                    <circle
                        cx="32"
                        cy="32"
                        r="30"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="4"
                    />
                    <motion.circle
                        cx="32"
                        cy="32"
                        r="30"
                        fill="none"
                        stroke={state === "active" ? "#ef4444" : "#eab308"}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="188.5"
                        strokeDashoffset={188.5 - (188.5 * holdProgress) / 100}
                    />
                </svg>

                <motion.button
                    onMouseDown={startHolding}
                    onMouseUp={stopHolding}
                    onMouseLeave={stopHolding}
                    onTouchStart={startHolding}
                    onTouchEnd={stopHolding}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 relative z-10",
                        state === "active"
                            ? "bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.8)]"
                            : "bg-black/80 backdrop-blur-xl border border-white/10"
                    )}
                >
                    {state === "active" ? (
                        <X className="w-8 h-8 text-white" />
                    ) : (
                        <ShieldAlert className={cn(
                            "w-8 h-8 transition-colors",
                            state === "holding" ? "text-primary" : "text-red-500"
                        )} />
                    )}
                </motion.button>

                {state === "holding" && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute right-full mr-4 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-white uppercase tracking-widest"
                    >
                        Segure para SOS
                    </motion.div>
                )}
            </div>
        </div>
    );
}
