"use client";

import "leaflet/dist/leaflet.css";
import { OnyxCard } from "@repo/ui/onyx-card";
import { OnyxButton } from "@repo/ui/onyx-button";
import api from "@repo/eden";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  Loader2,
  DollarSign,
  Users,
  ChevronLeft,
  RefreshCw,
  Clock,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const Map = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-white/[0.03] animate-pulse rounded-[2.5rem]" />
});

interface Trip {
  id: string;
  origin: string;
  originLat: number | string | null;
  originLng: number | string | null;
  destination: string;
  destLat: number | string | null;
  destLng: number | string | null;
  capacity: number;
  pricing: number | string;
  otp: string;
  status: string;
}

export default function AvailableTrips() {
  const router = useRouter();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery<{ trips: Trip[] }>({
    queryKey: ["available-trips"],
    queryFn: async () => {
      const res = await api.captain.trips.available.get();
      if (res.status !== 200) throw new Error("Failed to fetch");
      return res.data || { trips: [] };
    },
    refetchInterval: 5000,
  });

  const trips = data?.trips || [];

  const acceptMutation = useMutation({
    mutationFn: async (tripId: string) => {
      const res = await api.captain.trips({ id: tripId }).accept.post();
      if (res.status !== 200) throw new Error("Failed to accept");
      return res.data;
    },
    onSuccess: (data, tripId) => {
      toast.success("Engagement Confirmed", {
        description: "Moving to extraction point.",
      });
      router.push(`/trips/${tripId}`);
    },
    onError: () => {
      toast.error("Resource Unavailable", {
        description: "This trip was successfully claimed by another captain."
      });
    },
  });

  useEffect(() => {
    if (trips && trips.length > 0 && !selectedTrip) {
      setSelectedTrip(trips[0] || null);
    }
  }, [trips, selectedTrip]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
          <Loader2 className="animate-spin h-12 w-12 text-primary relative z-10" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.4em] animate-pulse text-primary">Scanning Area...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-10 overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <OnyxButton
              variant="secondary"
              size="sm"
              onClick={() => router.push("/")}
              className="rounded-full h-11 w-11 p-0 border-white/10 bg-white/5"
            >
              <ChevronLeft className="w-6 h-6" />
            </OnyxButton>
            <div>
              <h1 className="text-2xl font-black italic tracking-tight uppercase leading-none">Scanning</h1>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-1">
                <Zap className="w-3 h-3 animate-pulse" /> High Demand Area
              </p>
            </div>
          </div>
          <OnyxButton
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className={cn("rounded-full h-11 w-11 p-0", isRefetching ? 'animate-spin' : '')}
          >
            <RefreshCw className="w-5 h-5 opacity-40" />
          </OnyxButton>
        </header>

        <div className="px-6 space-y-8">
          {trips.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-32 flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="p-8 bg-white/[0.03] border border-white/5 rounded-full relative">
                <div className="absolute inset-0 bg-primary/5 blur-xl animate-pulse" />
                <Navigation className="w-16 h-16 opacity-20 relative z-10" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black italic uppercase tracking-tighter">Quiet Sector</p>
                <p className="text-sm font-medium text-muted-foreground max-w-[240px]">No active requests found. Maintain position or move to center.</p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Horizontal Trip Scroller */}
              <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-6 px-6 pt-2">
                {trips.map((trip, i) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <OnyxCard
                      hoverEffect={false}
                      className={cn(
                        "min-w-[280px] cursor-pointer transition-all duration-500 border-none relative overflow-hidden",
                        selectedTrip?.id === trip.id
                          ? "bg-primary text-primary-foreground shadow-[0_20px_40px_rgba(234,179,8,0.2)]"
                          : "bg-white/[0.03] border border-white/5 opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0"
                      )}
                      onClick={() => setSelectedTrip(trip)}
                    >
                      {selectedTrip?.id === trip.id && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                      )}

                      <div className="p-6 space-y-6 relative z-10">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-xl transition-colors", selectedTrip?.id === trip.id ? 'bg-white/20' : 'bg-primary/10')}>
                              <DollarSign className={cn("w-5 h-5", selectedTrip?.id === trip.id ? 'text-white' : 'text-primary')} />
                            </div>
                            <span className="text-3xl font-black italic tracking-tighter leading-none">
                              ${typeof trip.pricing === 'number' ? trip.pricing.toFixed(2) : trip.pricing}
                            </span>
                          </div>
                          <div className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest", selectedTrip?.id === trip.id ? 'bg-black/20 text-white' : 'bg-white/5 text-white/40')}>
                            {trip.capacity} Seats
                          </div>
                        </div>

                        <div className="space-y-3 relative">
                          <div className={cn("absolute left-2.5 top-2.5 bottom-2.5 w-[1px] transition-colors", selectedTrip?.id === trip.id ? 'bg-white/20' : 'bg-white/5')} />
                          <div className="flex items-start gap-4 pl-8">
                            <div className={cn("w-2 h-2 rounded-sm mt-1 flex-shrink-0 transition-colors", selectedTrip?.id === trip.id ? 'bg-white' : 'bg-emerald-500')} />
                            <p className="text-xs font-bold line-clamp-1 opacity-80">{trip.origin}</p>
                          </div>
                          <div className="flex items-start gap-4 pl-8">
                            <div className={cn("w-2 h-2 rounded-full mt-1 flex-shrink-0 transition-colors", selectedTrip?.id === trip.id ? 'bg-primary-foreground' : 'bg-primary')} />
                            <p className="text-xs font-bold line-clamp-1 opacity-80">{trip.destination}</p>
                          </div>
                        </div>
                      </div>
                    </OnyxCard>
                  </motion.div>
                ))}
              </div>

              {/* Selected Trip HUD Reveal */}
              <AnimatePresence mode="wait">
                {selectedTrip && (
                  <motion.div
                    key={selectedTrip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6 pb-12"
                  >
                    <div className="relative h-72 w-full rounded-[3.5rem] overflow-hidden border border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.5)] bg-white/[0.02]">
                      {selectedTrip.originLat && selectedTrip.originLng && selectedTrip.destLat && selectedTrip.destLng ? (
                        <Map
                          from={[selectedTrip.originLat, selectedTrip.originLng]}
                          to={[selectedTrip.destLat, selectedTrip.destLng]}
                          key={`${selectedTrip.id}-map-hd`}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20">Visualization unavailable</p>
                        </div>
                      )}

                      <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/10 flex items-center gap-2">
                        <Clock className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Est. 14 MIN</span>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                    </div>

                    <OnyxCard glass className="p-8 border-white/5 space-y-8">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Contract Details</p>
                          <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-primary" />
                            <span className="text-xl font-bold italic tracking-tight uppercase">{selectedTrip.capacity} Passengers</span>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Guaranteed Pay</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs font-bold text-primary opacity-60">$</span>
                            <span className="text-4xl font-black italic tracking-tighter text-white">
                              {typeof selectedTrip.pricing === 'number' ? (selectedTrip.pricing * 0.8).toFixed(2) : selectedTrip.pricing}
                            </span>
                          </div>
                        </div>
                      </div>

                      <OnyxButton
                        size="xl"
                        className="w-full h-20 rounded-[2rem] text-xl tracking-[0.1em] italic uppercase shadow-xl"
                        onClick={() => acceptMutation.mutate(selectedTrip.id)}
                        disabled={acceptMutation.isPending}
                      >
                        {acceptMutation.isPending ? (
                          <Loader2 className="w-8 h-8 animate-spin" />
                        ) : (
                          "Accept Trip"
                        )}
                      </OnyxButton>
                    </OnyxCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
