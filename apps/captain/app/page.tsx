"use client";

import api from "@repo/eden";
import { useLocationTracking } from "../hooks/useLocationTracking";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { OnyxButton } from "@repo/ui/onyx-button";
import { OnyxCard } from "@repo/ui/onyx-card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Power,
  TrendingUp,
  History,
  Star,
  Navigation,
  User as UserIcon,
  Shield,
  Map as MapIcon,
  ChevronRight,
  Bell,
  Zap,
  DollarSign
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CaptainDashboard() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);

  const { data: captain, isLoading } = useQuery({
    queryKey: ["captain-info"],
    queryFn: async () => {
      const res = await api.captain.get();
      if (res.status === 401) {
        router.push("/auth/signin");
        return null;
      }
      if (res.status !== 200) throw new Error("Failed to fetch");
      return res.data;
    },
  });

  const { isTracking, lastLocation } = useLocationTracking({
    enabled: isOnline,
  });

  const onlineMutation = useMutation({
    mutationFn: async () => {
      const res = await api.captain.online.post();
      if (res.status !== 200) throw new Error("Failed");
    },
    onSuccess: () => {
      setIsOnline(true);
      toast.success("Shift Started", {
        description: "Your elite status is now active.",
      });
    }
  });

  const offlineMutation = useMutation({
    mutationFn: async () => {
      const res = await api.captain.offline.post();
      if (res.status !== 200) throw new Error("Failed");
    },
    onSuccess: () => {
      setIsOnline(false);
      toast.info("Shift Ended", {
        description: "You are currently offline.",
      });
    }
  });

  const handleToggleOnline = async () => {
    try {
      if (!isOnline) {
        await onlineMutation.mutateAsync();
      } else {
        await offlineMutation.mutateAsync();
      }
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-8 bg-background min-h-screen">
        <div className="flex justify-between items-center">
          <Skeleton className="h-12 w-12 rounded-full bg-white/5" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
            <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/2 bg-white/5" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-3xl bg-white/5" />
            <Skeleton className="h-24 rounded-3xl bg-white/5" />
            <Skeleton className="h-24 rounded-3xl bg-white/5" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-[2.5rem] bg-white/5" />
      </div>
    );
  }

  if (!captain) return null;

  return (
    <main className="min-h-screen bg-background text-foreground pb-28 relative overflow-x-hidden">
      {/* Cinematic Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={cn(
          "absolute -top-[10%] -right-[10%] w-[60%] h-[60%] blur-[120px] rounded-full transition-colors duration-1000",
          isOnline ? "bg-emerald-500/10" : "bg-primary/5"
        )} />
        <div className="absolute bottom-[20%] -left-[10%] w-[40%] h-[40%] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10"
      >
        {/* Top Header */}
        <header className="p-6 flex justify-between items-center">
          <motion.h1
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-2xl font-black tracking-tighter italic bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent"
          >
            ONYX CAPTAIN
          </motion.h1>
          <div className="flex gap-3">
            <OnyxButton variant="secondary" size="sm" className="rounded-full h-11 w-11 p-0 border-white/5 bg-white/5 backdrop-blur-xl">
              <Bell className="w-5 h-5 opacity-50 font-bold" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
            </OnyxButton>
            <OnyxButton variant="secondary" size="sm" className="rounded-full h-11 w-11 p-0 border-white/5 overflow-hidden bg-white/5 backdrop-blur-xl">
              <UserIcon className="w-5 h-5 opacity-50" />
            </OnyxButton>
          </div>
        </header>

        <div className="px-6 space-y-8">
          {/* Welcome & Earnings HUD */}
          <section className="flex justify-between items-end">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-1">Elite Captain</p>
              <h2 className="text-4xl font-black tracking-tight leading-none italic">
                {captain.name.split(" ")[0]}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={cn("w-3 h-3 transition-colors", i <= 4 ? "text-primary fill-primary" : "text-white/20")} />
                  ))}
                </div>
                <span className="text-xs font-black bg-white/10 px-2 py-0.5 rounded-md border border-white/5">4.92</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-right"
            >
              <div className="flex items-center justify-end gap-1 mb-1">
                <Zap className="w-3 h-3 text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Today's Profit</span>
              </div>
              <p className="text-4xl font-black tracking-tighter text-white font-mono">$142.50</p>
            </motion.div>
          </section>

          {/* HUD Grid Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: TrendingUp, value: "12", label: "Trips", ref: "blue" },
              { icon: Navigation, value: "4.2", label: "Hours", ref: "emerald" },
              { icon: Shield, value: "100%", label: "Safe", ref: "primary" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <OnyxCard className="p-4 bg-white/[0.03] border-white/5 rounded-3xl flex flex-col items-center gap-1 hover:bg-white/[0.06] transition-colors cursor-pointer group">
                  <stat.icon className={cn("w-5 h-5 mb-1 group-hover:scale-110 transition-transform",
                    stat.ref === "blue" ? "text-blue-500" :
                      stat.ref === "emerald" ? "text-emerald-500" : "text-primary")}
                  />
                  <span className="text-2xl font-black italic leading-none">{stat.value}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-30 group-hover:opacity-60">{stat.label}</span>
                </OnyxCard>
              </motion.div>
            ))}
          </div>

          {/* Master Status CTA */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <OnyxCard
              glass
              className={cn(
                "p-8 border-none rounded-[2.5rem] relative overflow-hidden transition-all duration-700",
                isOnline ? "bg-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.1)]" : "bg-white/[0.03]"
              )}
            >
              {/* Animated pulses behind button */}
              {isOnline && (
                <div className="absolute top-1/2 right-12 -translate-y-1/2">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping scale-150" />
                  <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping delay-300 scale-[2]" />
                </div>
              )}

              <div className="flex items-center justify-between relative z-10">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black italic tracking-tight uppercase">
                    {isOnline ? "You're Online" : "Ready to Earn?"}
                  </h3>
                  <p className="text-sm font-medium opacity-50 max-w-[180px]">
                    {isOnline ? "Scanning for nearby elite requests..." : "Slide to start your Shift and accept trips."}
                  </p>
                </div>

                <OnyxButton
                  onClick={handleToggleOnline}
                  disabled={onlineMutation.isPending || offlineMutation.isPending}
                  variant={isOnline ? "outline" : "primary"}
                  className={cn(
                    "h-20 w-20 rounded-full border-2 p-0",
                    isOnline ? "border-emerald-500/50 hover:bg-emerald-500/10" : "border-primary/20"
                  )}
                >
                  {onlineMutation.isPending || offlineMutation.isPending ? (
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  ) : (
                    <Power className={cn("w-10 h-10 transition-all", isOnline ? "text-emerald-500 rotate-90" : "text-white")} />
                  )}
                </OnyxButton>
              </div>

              <AnimatePresence>
                {isOnline && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-8 pt-8 border-t border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      <span className="text-sm font-black uppercase tracking-widest text-emerald-500">Live GPS Tracking</span>
                    </div>
                    {lastLocation && (
                      <p className="text-[10px] font-mono mt-2 opacity-30">
                        LAT {lastLocation.lat.toFixed(6)} • LON {lastLocation.lng.toFixed(6)}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </OnyxCard>
          </motion.div>

          {/* Interactive Navigation HUD */}
          <div className="space-y-4">
            <h3 className="font-black text-xl italic tracking-tight uppercase px-1">Cockpit Controls</h3>

            <div className="space-y-3">
              {[
                { href: "/trips", icon: MapIcon, label: "Available Trips", sub: "Scan requests", color: "text-blue-500" },
                { href: "/history", icon: History, label: "Trip History", sub: "Detailed earnings", color: "text-purple-500" },
                { href: "/safety", icon: Shield, label: "Safety Center", sub: "Emergency tools", color: "text-emerald-500" },
              ].map((nav, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                >
                  <Link href={nav.href} className="block group">
                    <OnyxCard glass={false} className="bg-white/[0.02] border-white/5 hover:bg-white/[0.05] p-5 rounded-3xl group-active:scale-[0.98] transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                            <nav.icon className={cn("w-6 h-6", nav.color)} />
                          </div>
                          <div>
                            <p className="text-lg font-black leading-none uppercase italic group-active:text-primary transition-colors">{nav.label}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{nav.sub}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </OnyxCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Bottom HUD */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 pb-6 pt-2 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-2xl border border-white/10 h-18 rounded-full flex items-center justify-around px-2 shadow-2xl pointer-events-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

            <button className="flex flex-col items-center gap-1 p-2 text-primary relative z-10">
              <TrendingUp className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Dash</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 opacity-30 hover:opacity-100 transition-all active:scale-95" onClick={() => router.push('/trips')}>
              <MapIcon className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Trips</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 opacity-30 hover:opacity-100 transition-all active:scale-95" onClick={() => router.push('/auth/signout')}>
              <UserIcon className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Profile</span>
            </button>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
