"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Star,
    Car,
    Clock,
    ShieldCheck,
    Crown,
    ChevronRight,
    TrendingDown,
    TrendingUp
} from "lucide-react";

export type DriverOption = {
    id: string;
    name: string;
    rating: number;
    totalTrips: number;
    carModel: string;
    carPlate: string;
    eta: string;
    price: number;
    isElite?: boolean;
    isVerified?: boolean;
};

type DriverSelectorProps = {
    drivers: DriverOption[];
    onSelect: (driver: DriverOption) => void;
    suggestedPrice: number;
    className?: string;
};

export function DriverSelector({
    drivers,
    onSelect,
    suggestedPrice,
    className
}: DriverSelectorProps) {
    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between mb-2 px-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Motoristas Disponíveis
                </h3>
                <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                    {drivers.length} ONLINE
                </span>
            </div>

            <AnimatePresence mode="popLayout">
                {drivers.map((driver, index) => {
                    const priceDiff = driver.price - suggestedPrice;
                    const isLower = priceDiff < 0;

                    return (
                        <motion.button
                            key={driver.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => onSelect(driver)}
                            className={cn(
                                "w-full p-4 rounded-2xl text-left transition-all",
                                "bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]",
                                "relative overflow-hidden group"
                            )}
                        >
                            {/* Premium Glow on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                            <div className="flex gap-4 relative z-10">
                                {/* Driver Avatar / Initial */}
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10">
                                        <span className="text-xl font-black text-white/50">
                                            {driver.name.charAt(0)}
                                        </span>
                                    </div>
                                    {driver.isElite && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-[0_0_10px_rgba(234,179,8,0.5)] border-2 border-black">
                                            <Crown className="w-3.5 h-3.5 text-black" />
                                        </div>
                                    )}
                                </div>

                                {/* Driver Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-white truncate">{driver.name}</span>
                                        {driver.isVerified && (
                                            <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-white/40 font-medium">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-primary fill-primary" />
                                            <span className="text-white/80">{driver.rating.toFixed(1)}</span>
                                            <span className="text-[10px]">({driver.totalTrips})</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{driver.eta}</span>
                                        </div>
                                    </div>

                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/60">
                                            {driver.carModel}
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing & Selection */}
                                <div className="text-right flex flex-col justify-between">
                                    <div>
                                        <div className="text-lg font-black text-white">
                                            R$ {driver.price.toFixed(2)}
                                        </div>
                                        {priceDiff !== 0 && (
                                            <div className={cn(
                                                "text-[10px] font-bold flex items-center justify-end gap-1",
                                                isLower ? "text-emerald-500" : "text-primary"
                                            )}>
                                                {isLower ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                                                {Math.abs(priceDiff).toFixed(2)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end gap-1 text-primary group-hover:translate-x-1 transition-transform">
                                        <span className="text-[10px] font-black uppercase">Selecionar</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
