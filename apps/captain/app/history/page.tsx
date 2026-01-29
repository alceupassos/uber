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
  DollarSign,
  History as HistoryIcon,
  CircleCheck,
  Zap,
  Clock,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function History() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["captain-history"],
    queryFn: async () => {
      const res = await api.captain.history.get();
      if (res.status !== 200) {
        throw new Error("Failed to fetch history");
      }
      return res.data;
    },
  });

  const trips = (data as any)?.trips || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Decrypting Logs</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20 relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[30%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full" />
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
              <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Earnings</h1>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1">Operational History</p>
            </div>
          </div>
          <Link href="/stats">
            <OnyxButton variant="secondary" size="sm" className="rounded-full px-4 border-white/5 bg-white/5 backdrop-blur-xl">
              <TrendingUp className="w-4 h-4 text-primary" />
            </OnyxButton>
          </Link>
        </header>

        {/* HUD Summary */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <OnyxCard className="p-6 bg-white/[0.03] border-white/5">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2">Total Yield</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-primary">$</span>
              <span className="text-3xl font-black italic tracking-tighter">1,240</span>
            </div>
          </OnyxCard>
          <OnyxCard className="p-6 bg-white/[0.03] border-white/5">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2">Engagements</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black italic tracking-tighter">48</span>
              <span className="text-[10px] uppercase font-black opacity-30 px-1">Successful</span>
            </div>
          </OnyxCard>
        </div>

        {!trips || trips.length === 0 ? (
          <OnyxCard glass className="p-12 text-center border-white/5 mt-6">
            <div className="flex flex-col items-center gap-6">
              <div className="p-6 bg-white/5 rounded-full">
                <Zap className="w-12 h-12 opacity-20" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black italic uppercase tracking-tighter">No Active Logs</p>
                <p className="text-sm font-medium text-muted-foreground">Go online to start recording performance data.</p>
              </div>
              <Link href="/" className="pt-4">
                <OnyxButton variant="primary" size="lg" className="rounded-2xl">
                  Go Online
                </OnyxButton>
              </Link>
            </div>
          </OnyxCard>
        ) : (
          <div className="space-y-6">
            {trips.map((trip: any, i: number) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <OnyxCard glass className="p-6 border-white/5">
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 flex items-center gap-1.5">
                          <CircleCheck className="w-3 h-3" />
                          COMPLETED
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest opacity-30">
                          <Clock className="h-3 w-3" />
                          {new Date(trip.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div className="space-y-3 relative">
                        <div className="absolute left-2 top-2 bottom-2 w-[1px] bg-white/10" />
                        <div className="flex items-start gap-4 pl-6 relative">
                          <div className="w-1.5 h-1.5 rounded-sm mt-1.5 bg-white/40" />
                          <p className="text-xs font-bold opacity-60 line-clamp-1">{trip.origin}</p>
                        </div>
                        <div className="flex items-start gap-4 pl-6 relative">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 bg-primary" />
                          <p className="text-xs font-bold opacity-90 line-clamp-1">{trip.destination}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-black italic tracking-tighter text-white">
                        +${Number(trip.pricing * 0.8).toFixed(2)}
                      </p>
                      <p className="text-[10px] font-black uppercase opacity-20 tracking-widest mt-1">Net Earnings</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-20">Ref: #{trip.id.slice(0, 8)}</p>
                    <OnyxButton variant="ghost" size="sm" className="h-8 text-[9px] uppercase tracking-widest opacity-40 hover:opacity-100">
                      View Receipt
                    </OnyxButton>
                  </div>
                </OnyxCard>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </main>
  );
}
