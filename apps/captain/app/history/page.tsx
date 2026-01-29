"use client";

import { Card, CardContent } from "@/components/ui/card";
import api from "@repo/eden";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Navigation, Loader2, Calendar, ChevronLeft, ArrowRight, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type TripStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "ON_TRIP"
  | "COMPLETED"
  | "CANCELLED";

interface Trip {
  id: string;
  origin: string;
  destination: string;
  status: TripStatus;
  pricing: any;
  capacity: number;
  createdAt: any;
  user: {
    name: any;
    email: string;
  };
}

export default function CaptainHistory() {
  const { data, isLoading } = useQuery<{ trips: Trip[] }>({
    queryKey: ["captain-history"],
    queryFn: async () => {
      const res = await api.captain.history.get();
      if (res.status !== 200) throw new Error("Failed to fetch");
      return res.data || { trips: [] };
    },
  });

  const trips = data?.trips || [];

  const getStatusDisplay = (status: TripStatus) => {
    switch (status) {
      case "COMPLETED":
        return { label: "Completed", color: "bg-emerald-500/10 text-emerald-500" };
      case "CANCELLED":
        return { label: "Cancelled", color: "bg-red-500/10 text-red-500" };
      case "ON_TRIP":
        return { label: "On Trip", color: "bg-blue-500/10 text-blue-500" };
      case "ACCEPTED":
        return { label: "In Progress", color: "bg-yellow-500/10 text-yellow-500" };
      default:
        return { label: status, color: "bg-secondary text-muted-foreground" };
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-48 rounded-xl" />
        </div>
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-3xl" />)}
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
          asChild
          className="rounded-full bg-accent/50"
        >
          <Link href="/">
            <ChevronLeft className="w-6 h-6" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-black italic tracking-tight uppercase">History</h1>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest leading-none">Your Performance</p>
        </div>
      </div>

      <div className="px-6 space-y-4">
        {!trips || trips.length === 0 ? (
          <div className="py-24 text-center space-y-4 opacity-50">
            <div className="p-6 bg-accent/20 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
              <Calendar className="w-10 h-10" />
            </div>
            <p className="font-black text-xl">No rides yet</p>
            <p className="text-sm">Complete your first trip to start tracking your history.</p>
          </div>
        ) : (
          trips.map((trip) => {
            const status = getStatusDisplay(trip.status);
            return (
              <Card key={trip.id} className="bg-secondary/20 border border-border/10 rounded-[2rem] overflow-hidden group">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-[10px] font-bold opacity-30">
                        {new Date(trip.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xl font-black text-primary">
                      ${Number(trip.pricing).toFixed(2)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 relative px-1">
                    <div className="absolute left-[3px] top-2 bottom-2 w-[1px] bg-foreground/10" />
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      <p className="text-[11px] font-medium line-clamp-1">{trip.origin}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      <p className="text-[11px] font-medium line-clamp-1">{trip.destination}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                        <UserIcon className="w-4 h-4 opacity-50" />
                      </div>
                      <span className="text-xs font-bold">{trip.user.name}</span>
                    </div>
                    {trip.status === "ACCEPTED" && (
                      <Link href={`/trips/${trip.id}`}>
                        <Button size="sm" variant="outline" className="rounded-xl text-[10px] font-black h-8">
                          VIEW DETAILS <ArrowRight className="ml-1 w-3 h-3" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </main>
  );
}
