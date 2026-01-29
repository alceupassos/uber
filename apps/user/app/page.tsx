"use client";

import api from "@repo/eden";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  History,
  Search,
  Star,
  MapPin,
  Navigation,
  Car,
  Clock,
  User as UserIcon
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
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      {/* Header / Brand */}
      <div className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-black tracking-tighter italic">UBER</h1>
        <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
          <UserIcon className="w-5 h-5 opacity-70" />
        </div>
      </div>

      <div className="px-6 space-y-6">
        {user ? (
          <>
            {/* Welcome Section */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Hey, <span className="text-primary">{user.name.split(" ")[0]}</span>
              </h2>
              <p className="text-muted-foreground mt-1">Ready for your next trip?</p>
            </div>

            {/* Main Action - Search */}
            <Link href="/book" className="block group">
              <div className="px-5 py-4 bg-secondary/80 backdrop-blur-md border border-border/50 flex items-center gap-3 rounded-2xl font-medium transition-all group-hover:bg-secondary group-hover:scale-[1.01] active:scale-95">
                <div className="p-2 bg-primary rounded-lg text-primary-foreground">
                  <Search className="w-5 h-5" />
                </div>
                <span className="flex-1 opacity-80">Where to?</span>
                <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/history"
                className="p-5 bg-accent/30 border border-border/50 rounded-[2rem] flex flex-col justify-between hover:bg-accent/40 transition-colors group"
              >
                <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <div className="mt-8">
                  <h3 className="font-bold text-lg">Activity</h3>
                  <p className="text-xs text-muted-foreground">View your rides</p>
                </div>
              </Link>

              <Link
                href="/safety"
                className="p-5 bg-accent/30 border border-border/50 rounded-[2rem] flex flex-col justify-between hover:bg-accent/40 transition-colors group"
              >
                <div className="h-12 w-12 bg-green-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6 text-green-500" />
                </div>
                <div className="mt-8">
                  <h3 className="font-bold text-lg">Offers</h3>
                  <p className="text-xs text-muted-foreground">Save on trips</p>
                </div>
              </Link>
            </div>

            {/* Recent Trips Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl">Recent Activity</h3>
                <Link href="/history" className="text-sm text-primary font-medium">See all</Link>
              </div>
              <PreviousTrips />
            </div>

            {/* Bottom Menu / Sign out */}
            <div className="pt-4 opacity-50 hover:opacity-100 transition-opacity">
              <Link href="/auth/signout">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  Not {user.name}? Sign out
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-20 text-center space-y-8">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <Car className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Move with safety</h1>
              <p className="text-muted-foreground mt-2 px-6">
                Join thousands of people moving around your city every day.
              </p>
            </div>
            <div className="w-full space-y-3 pt-8">
              <Link href="/auth/signin" className="w-full block">
                <Button size="lg" className="w-full h-14 rounded-2xl text-lg font-bold">
                  Get Started
                </Button>
              </Link>
              <Link href="/auth/signup" className="w-full block">
                <Button variant="ghost" size="lg" className="w-full h-14 rounded-2xl">
                  Create account
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Nav simulation */}
      {user && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 pb-6 pt-2 bg-gradient-to-t from-background via-background to-transparent">
          <div className="bg-secondary/90 backdrop-blur-xl border border-border/50 h-16 rounded-full flex items-center justify-around px-2 shadow-2xl">
            <button className="flex flex-col items-center gap-1 p-2 text-primary">
              <Navigation className="w-6 h-6" />
              <span className="text-[10px] font-bold">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 opacity-40 hover:opacity-100 transition-opacity">
              <History className="w-6 h-6" />
              <span className="text-[10px] font-bold">Activity</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 opacity-40 hover:opacity-100 transition-opacity">
              <UserIcon className="w-6 h-6" />
              <span className="text-[10px] font-bold">Account</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
