"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import api from "@repo/eden";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { MButton } from "@/components/mutation-button";
import { useRouter } from "next/navigation";

export default function CaptainSignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [capacity, setCapacity] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const capacityNum = parseInt(capacity);
      if (isNaN(capacityNum) || capacityNum <= 0) {
        toast.error("Capacity must be a positive number");
        throw new Error("Invalid capacity");
      }

      const res = await api.auth.captain.signup.post({
        email,
        name,
        vehicle,
        capacity: capacityNum,
        password,
        confirmPassword,
      });
      if (res.status === 200) {
        toast.success("Sign up successful! Please sign in.");
        router.push("/auth/signin");
      } else {
        toast.error(res.data?.message || "Sign up failed");
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Captain Sign Up</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            placeholder="Full Name"
          />
          <Input
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            placeholder="Email"
            type="email"
          />
          <Input
            value={vehicle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setVehicle(e.target.value)
            }
            placeholder="Vehicle Type (e.g., Sedan, SUV)"
          />
          <Input
            value={capacity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCapacity(e.target.value)
            }
            placeholder="Passenger Capacity"
            type="number"
            min="1"
          />
          <Input
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            type="password"
            placeholder="Password"
          />
          <Input
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmPassword(e.target.value)
            }
            type="password"
            placeholder="Confirm Password"
          />
          <MButton mutation={mutation} className="w-full">
            Sign Up
          </MButton>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
