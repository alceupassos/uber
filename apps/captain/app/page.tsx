"use client";

import api from "@repo/eden";
import { useLocationTracking } from "../hooks/useLocationTracking";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
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
  Bell
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

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
      toast.success("You are now online", {
        description: "Waiting for trip requests near you.",
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
      toast.info("You are now offline", {
        description: "You won't receive new requests.",
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
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-10 w-2/3 rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!captain) return null;

  return (
    <main className="min-h-screen bg-background text-foreground pb-24">
      {/* Top Header */}
      <div className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-black tracking-tighter italic">CAPTAIN</h1>
        <div className="flex gap-3">
          <button className="h-10 w-10 rounded-full bg-accent flex items-center justify-center relative">
            <Bell className="w-5 h-5 opacity-70" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
          </button>
          <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center overflow-hidden border border-border">
            <UserIcon className="w-5 h-5 opacity-70" />
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Welcome & Stats */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Capt. <span className="text-primary">{captain.name.split(" ")[0]}</span>
            </h2>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-foreground">4.92</span>
              <span className="mx-1">•</span>
              <span>Pro Driver</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase font-black">Today's Profit</p>
            <p className="text-2xl font-black text-primary">$142.50</p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-accent/20 border-none rounded-2xl">
            <CardContent className="p-4 flex flex-col items-center gap-1">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="text-lg font-bold">12</span>
              <span className="text-[10px] uppercase opacity-50">Trips</span>
            </CardContent>
          </Card>
          <Card className="bg-accent/20 border-none rounded-2xl">
            <CardContent className="p-4 flex flex-col items-center gap-1">
              <Navigation className="w-5 h-5 text-emerald-500" />
              <span className="text-lg font-bold">4.2</span>
              <span className="text-[10px] uppercase opacity-50">Hours</span>
            </CardContent>
          </Card>
          <Card className="bg-accent/20 border-none rounded-2xl">
            <CardContent className="p-4 flex flex-col items-center gap-1">
              <Shield className="w-5 h-5 text-purple-500" />
              <span className="text-lg font-bold">100%</span>
              <span className="text-[10px] uppercase opacity-50">Safe</span>
            </CardContent>
          </Card>
        </div>

        {/* Status Mode Card */}
        <Card className={`overflow-hidden border-none rounded-3xl transition-all duration-500 ${isOnline ? 'bg-emerald-500/10' : 'bg-secondary/50'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-bold">
                  {isOnline ? "You're Online" : "Go Online"}
                </h3>
                <p className="text-sm opacity-70">
                  {isOnline ? "Looking for nearby rides..." : "Start your shift to earn money"}
                </p>
              </div>
              <button
                onClick={handleToggleOnline}
                disabled={onlineMutation.isPending || offlineMutation.isPending}
                className={`h-16 w-16 rounded-full flex items-center justify-center transition-all ${isOnline ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-primary shadow-xl'} active:scale-90 disabled:opacity-50`}
              >
                {onlineMutation.isPending || offlineMutation.isPending ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <Power className="w-8 h-8 text-white" />
                )}
              </button>
            </div>

            {isOnline && (
              <div className="mt-6 pt-6 border-t border-emerald-500/20 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {isTracking ? "GPS Signal Strong" : "Calibrating GPS..."}
                </div>
                {lastLocation && (
                  <p className="text-[10px] mt-1 opacity-50">
                    Active Coordinates: {lastLocation.lat.toFixed(6)}, {lastLocation.lng.toFixed(6)}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map Simulation / Visual */}
        <div className="relative h-48 w-full rounded-3xl bg-accent/30 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center animate-ping absolute" />
            <MapIcon className="w-8 h-8 text-primary relative z-10" />
            <span className="text-sm font-bold opacity-50">Interactive Map</span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-background/80 backdrop-blur-md p-3 rounded-2xl border border-border/50">
            <span className="text-xs font-medium">Lapa, Rio de Janeiro</span>
            <span className="text-xs py-1 px-2 bg-primary/20 text-primary rounded-lg font-bold">Busy Area</span>
          </div>
        </div>

        {/* Recent Navigation Items */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg px-1">Navigation</h3>
          <Link href="/trips" className="block p-4 bg-secondary/30 rounded-2xl border border-border/10 hover:bg-secondary/50 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Navigation className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-bold">Available Requests</p>
                  <p className="text-xs text-muted-foreground">Find trips near you</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
          <Link href="/history" className="block p-4 bg-secondary/30 rounded-2xl border border-border/10 hover:bg-secondary/50 transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <History className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-bold">Trip History</p>
                  <p className="text-xs text-muted-foreground">Detailed logs of your earnings</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        </div>
      </div>

      {/* Driver Floating Nav */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 pb-6 pt-2 bg-gradient-to-t from-background via-background to-transparent">
        <div className="bg-secondary/90 backdrop-blur-xl border border-border/50 h-16 rounded-full flex items-center justify-around px-2 shadow-2xl">
          <button className="flex flex-col items-center gap-1 p-2 text-primary">
            <TrendingUp className="w-6 h-6" />
            <span className="text-[10px] font-bold">Dash</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 opacity-40 hover:opacity-100 transition-opacity" onClick={() => router.push('/trips')}>
            <MapIcon className="w-6 h-6" />
            <span className="text-[10px] font-bold">Trips</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 opacity-40 hover:opacity-100 transition-opacity" onClick={() => router.push('/auth/signout')}>
            <UserIcon className="w-6 h-6" />
            <span className="text-[10px] font-bold">Account</span>
          </button>
        </div>
      </div>
    </main>
  );
}
