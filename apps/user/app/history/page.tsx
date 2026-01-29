"use client";

import api from "@repo/eden";
import { OnyxButton } from "@repo/ui/onyx-button";
import { OnyxCard } from "@repo/ui/onyx-card";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  MapPin,
  Navigation,
  Loader2,
  Calendar,
  ChevronLeft,
  Search,
  History as HistoryIcon,
  CircleCheck,
  XCircle,
  Clock
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type TripStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "ON_TRIP"
  | "COMPLETED"
  | "CANCELLED";

export default function History() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      const res = await api.user.history.get();
      if (res.status !== 200) {
        throw new Error("Failed to fetch history");
      }
      return res.data;
    },
  });

  const trips = (data as any)?.trips || [];

  const getStatusInfo = (status: TripStatus) => {
    switch (status) {
      case "COMPLETED":
        return { color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CircleCheck };
      case "CANCELLED":
        return { color: "text-red-500", bg: "bg-red-500/10", icon: XCircle };
      case "ON_TRIP":
        return { color: "text-blue-500", bg: "bg-blue-500/10", icon: Navigation };
      case "ACCEPTED":
        return { color: "text-primary", bg: "bg-primary/20", icon: Clock };
      default:
        return { color: "text-white/40", bg: "bg-white/5", icon: HistoryIcon };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Retrieving Records</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20 relative overflow-x-hidden">
      {/* Cinematic Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 px-6">
        <header className="py-8 flex items-center justify-between">
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
              <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">History</h1>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1">Activity Log</p>
            </div>
          </div>
        </header>

        {!trips || trips.length === 0 ? (
          <OnyxCard glass className="p-12 text-center border-white/5 mt-10">
            <div className="flex flex-col items-center gap-6">
              <div className="p-6 bg-white/5 rounded-full">
                <HistoryIcon className="w-12 h-12 opacity-20" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black italic uppercase tracking-tighter">No Trips Yet</p>
                <p className="text-sm font-medium text-muted-foreground">Your elite travel history will appear here.</p>
              </div>
              <Link href="/book" className="pt-4">
                <OnyxButton variant="primary" size="lg" className="rounded-2xl">
                  Book First Ride
                </OnyxButton>
              </Link>
            </div>
          </OnyxCard>
        ) : (
          <div className="space-y-6">
            {trips.map((trip: any, i: number) => {
              const status = getStatusInfo(trip.status);
              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <OnyxCard glass className="p-6 border-white/5 hover:border-primary/20 transition-colors">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5", status.bg, status.color)}>
                            <status.icon className="w-3 h-3" />
                            {trip.status}
                          </div>
                          <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest opacity-30">
                            <Calendar className="h-3 w-3" />
                            {new Date(trip.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="space-y-3 relative">
                          <div className="absolute left-2 top-2 bottom-2 w-[1px] bg-white/5" />
                          <div className="flex items-start gap-4 pl-6 relative">
                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 bg-emerald-500" />
                            <p className="text-sm font-bold opacity-80 leading-none">{trip.origin}</p>
                          </div>
                          <div className="flex items-start gap-4 pl-6 relative">
                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 bg-primary" />
                            <p className="text-sm font-bold opacity-80 leading-none">{trip.destination}</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-black italic tracking-tighter leading-none">
                          ${Number(trip.pricing).toFixed(2)}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1">
                          {trip.capacity} PAX
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex gap-3">
                      <Link href={`/book/${trip.id}`} className="flex-1">
                        <OnyxButton variant="secondary" size="md" className="w-full rounded-xl bg-white/5 h-11 text-[10px] uppercase">
                          Details
                        </OnyxButton>
                      </Link>
                      <OnyxButton variant="outline" size="md" className="flex-1 rounded-xl h-11 text-[10px] uppercase border-white/10 opacity-60">
                        Reorder
                      </OnyxButton>
                    </div>
                  </OnyxCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </main>
  );
}
