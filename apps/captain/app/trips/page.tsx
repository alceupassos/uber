"use client";

import "leaflet/dist/leaflet.css";
import { Card, CardContent } from "@/components/ui/card";
import api from "@repo/eden";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MapPin, Navigation, Loader2, DollarSign, Users, ChevronLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => <div className="h-48 w-full bg-accent animate-pulse rounded-2xl" />
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
      toast.success("Trip Accepted!", {
        description: "Moving to pick up point.",
      });
      router.push(`/trips/${tripId}`);
    },
    onError: () => {
      toast.error("Could not accept trip", {
        description: "It might have been taken by another captain."
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
      <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-sm font-medium animate-pulse">Scanning for requests...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-10">
      {/* Header */}
      <div className="p-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
          className="rounded-full bg-accent/50"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-black italic tracking-tight">AVAILABLE</h1>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest leading-none">Scanning Area</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          className={`rounded-full ${isRefetching ? 'animate-spin' : ''}`}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="px-6 space-y-6">
        {!trips || trips.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <div className="p-6 bg-accent/20 rounded-full">
              <Navigation className="w-12 h-12" />
            </div>
            <div>
              <p className="text-xl font-bold">Quiet Zone</p>
              <p className="text-sm max-w-[200px]">No active requests right now. Try moving to a busier area.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Horizontal Trip Scroller */}
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
              {trips.map((trip) => (
                <Card
                  key={trip.id}
                  className={`min-w-[280px] cursor-pointer transition-all border-none ${selectedTrip?.id === trip.id
                      ? "bg-primary text-primary-foreground scale-[1.02] shadow-xl shadow-primary/20"
                      : "bg-secondary/40 hover:bg-secondary/60"
                    } rounded-3xl`}
                  onClick={() => setSelectedTrip(trip)}
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${selectedTrip?.id === trip.id ? 'bg-white/20' : 'bg-primary/10'}`}>
                          <DollarSign className={`w-5 h-5 ${selectedTrip?.id === trip.id ? 'text-white' : 'text-primary'}`} />
                        </div>
                        <span className="text-2xl font-black">
                          ${typeof trip.pricing === 'number' ? trip.pricing.toFixed(2) : trip.pricing}
                        </span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${selectedTrip?.id === trip.id ? 'bg-white/20 text-white' : 'bg-accent text-accent-foreground'}`}>
                        {trip.capacity} Seats
                      </div>
                    </div>

                    <div className="space-y-3 relative">
                      <div className="absolute left-2 top-2 bottom-2 w-[1px] bg-current opacity-20" />
                      <div className="flex items-start gap-3 pl-6">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <p className="text-xs font-bold line-clamp-1 opacity-90">{trip.origin}</p>
                      </div>
                      <div className="flex items-start gap-3 pl-6">
                        <Navigation className="h-4 w-4 mt-0.5" />
                        <p className="text-xs font-bold line-clamp-1 opacity-90">{trip.destination}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selected Trip Details & Map */}
            {selectedTrip && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative h-64 w-full rounded-[2.5rem] overflow-hidden border border-border/50 shadow-2xl">
                  {selectedTrip.originLat && selectedTrip.originLng && selectedTrip.destLat && selectedTrip.destLng ? (
                    <Map
                      from={[selectedTrip.originLat, selectedTrip.originLng]}
                      to={[selectedTrip.destLat, selectedTrip.destLng]}
                      key={`${selectedTrip.id}-map-detail`}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                      <p className="text-xs opacity-50">Map unavailable for this route</p>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-border/50">
                    <p className="text-[10px] font-black uppercase opacity-50 leading-tight">Est. Travel Time</p>
                    <p className="text-sm font-black">12-15 min</p>
                  </div>
                </div>

                <div className="bg-secondary/20 p-6 rounded-[2.5rem] space-y-6 border border-border/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-50">Payload</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="w-5 h-5 text-primary" />
                        <span className="font-bold">{selectedTrip.capacity} Passengers</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase opacity-50">Your Cut</p>
                      <p className="text-2xl font-black text-primary mt-1">
                        ${typeof selectedTrip.pricing === 'number' ? (selectedTrip.pricing * 0.8).toFixed(2) : selectedTrip.pricing}
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    onClick={() => acceptMutation.mutate(selectedTrip.id)}
                    disabled={acceptMutation.isPending}
                  >
                    {acceptMutation.isPending ? (
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    ) : (
                      "ACCEPT THIS TRIP"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
