"use client";

import api from "@repo/eden";
import { OnyxButton } from "@repo/ui/onyx-button";
import { OnyxCard } from "@repo/ui/onyx-card";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  History,
  Search,
  Star,
  MapPin,
  Navigation,
  Car,
  Clock,
  User as UserIcon,
  ShieldCheck,
  CreditCard,
  Gift
} from "lucide-react";
import { PreviousTrips } from "@/components/previous-trips";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["user-info"],
    queryFn: async () => {
      const res = await api.user.get();
      if (res.status !== 200) {
        throw new Error("Failed to fetch user info");
      }
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-8 bg-background min-h-screen">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-24 bg-white/5" />
          <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-2/3 bg-white/5" />
          <Skeleton className="h-6 w-1/2 bg-white/5" />
        </div>
        <Skeleton className="h-16 w-full rounded-2xl bg-white/5" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-40 rounded-[2.5rem] bg-white/5" />
          <Skeleton className="h-40 rounded-[2.5rem] bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-24 overflow-x-hidden">
      {/* Cinematic Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          {/* Header */}
          <header className="p-6 flex justify-between items-center">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-black tracking-tighter italic bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent"
            >
              ONYX
            </motion.h1>
            <OnyxButton variant="secondary" size="sm" className="rounded-full h-10 w-10 p-0 border-white/10">
              <UserIcon className="w-5 h-5 opacity-70" />
            </OnyxButton>
          </header>

          <div className="px-6 space-y-8">
            {user ? (
              <>
                {/* Welcome Section */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-1"
                >
                  <h2 className="text-4xl font-black tracking-tight leading-none">
                    Welcome, <span className="text-primary">{user.name.split(" ")[0]}</span>
                  </h2>
                  <p className="text-muted-foreground font-medium text-lg">Your elite transport awaits.</p>
                </motion.section>

                {/* Main Search Action */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link href="/book" className="block outline-none">
                    <OnyxCard glass className="p-1 group border-white/10 hover:border-primary/30 transition-colors">
                      <div className="px-5 py-4 flex items-center gap-4">
                        <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-[0_0_15px_rgba(234,179,8,0.3)] group-hover:scale-110 transition-transform">
                          <Search className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold opacity-60 group-hover:opacity-100 transition-opacity flex-1">Where to?</span>
                        <div className="h-10 w-10 flex items-center justify-center opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                          <ChevronRight className="w-6 h-6" />
                        </div>
                      </div>
                    </OnyxCard>
                  </Link>
                </motion.div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Link href="/history" className="block outline-none">
                      <OnyxCard className="p-6 h-full flex flex-col justify-between group h-44 border-white/5">
                        <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                          <Clock className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-black text-xl leading-none">History</h3>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Your Rides</p>
                        </div>
                      </OnyxCard>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Link href="/offers" className="block outline-none">
                      <OnyxCard className="p-6 h-full flex flex-col justify-between group h-44 border-white/5">
                        <div className="h-12 w-12 bg-amber-500/10 rounded-2xl flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                          <Gift className="w-6 h-6 text-amber-500" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-black text-xl leading-none">Rewards</h3>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Exclusive</p>
                        </div>
                      </OnyxCard>
                    </Link>
                  </motion.div>
                </div>

                {/* Recent Activity Section */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-2xl italic tracking-tight uppercase">Recent Activity</h3>
                    <Link href="/history" className="text-xs font-black uppercase text-primary tracking-widest hover:underline">
                      View all
                    </Link>
                  </div>
                  <OnyxCard glass={false} className="bg-white/[0.02] border-white/5 p-4 rounded-3xl">
                    <PreviousTrips />
                  </OnyxCard>
                </motion.section>

                {/* Extra Actions Scroll */}
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
                  {[
                    { icon: ShieldCheck, label: "Safety", color: "text-emerald-500" },
                    { icon: CreditCard, label: "Wallet", color: "text-primary" },
                    { icon: Star, label: "Special", color: "text-purple-500" },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 min-w-[80px]">
                      <div className="h-16 w-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                        <item.icon className={cn("w-6 h-6", item.color)} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tighter opacity-50">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Signout footer */}
                <div className="pt-8 text-center">
                  <Link href="/auth/signout" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-opacity">
                    Logout - {user.email}
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center pt-24 text-center space-y-12">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="w-32 h-32 bg-primary/10 rounded-[2.5rem] flex items-center justify-center border border-primary/20 shadow-[0_0_50px_rgba(234,179,8,0.1)] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent" />
                  <Car className="w-16 h-16 text-primary relative z-10" />
                </motion.div>

                <div className="space-y-4">
                  <h1 className="text-5xl font-black tracking-tighter leading-none italic uppercase">
                    Luxury on <br /> <span className="text-primary tracking-normal not-italic">demand</span>
                  </h1>
                  <p className="text-muted-foreground font-medium text-lg px-8">
                    Elevate your mobility with our ultra-premium fleet and elite service.
                  </p>
                </div>

                <div className="w-full space-y-4 pt-4">
                  <Link href="/auth/signin" className="w-full block decoration-none">
                    <OnyxButton size="xl" className="w-full rounded-3xl h-18 text-xl">
                      Get Started
                    </OnyxButton>
                  </Link>
                  <Link href="/auth/signup" className="w-full block decoration-none">
                    <OnyxButton variant="ghost" size="lg" className="w-full opacity-60 hover:opacity-100">
                      Create premium account
                    </OnyxButton>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Nav Bottom */}
          {user && (
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 pb-6 pt-2 pointer-events-none">
              <div className="bg-black/40 backdrop-blur-2xl border border-white/10 h-18 rounded-full flex items-center justify-around px-2 shadow-2xl pointer-events-auto overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
                <button className="flex flex-col items-center gap-1 p-2 text-primary relative z-10 transition-transform active:scale-90">
                  <Navigation className="w-6 h-6 fill-primary/20" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Home</span>
                </button>
                <Link href="/history" className="flex flex-col items-center gap-1 p-2 opacity-30 hover:opacity-100 transition-all relative z-10 active:scale-90">
                  <History className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">History</span>
                </Link>
                <Link href="/profile" className="flex flex-col items-center gap-1 p-2 opacity-30 hover:opacity-100 transition-all relative z-10 active:scale-90">
                  <UserIcon className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Account</span>
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
