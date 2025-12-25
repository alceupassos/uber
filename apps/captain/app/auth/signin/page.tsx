"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { MButton } from "@/components/mutation-button";
import api from "@repo/eden";
import { useRouter } from "next/navigation";

export default function CaptainSignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.auth.captain.login.post({
        email,
        password,
      });
      if (res.status === 200) {
        // IMPORTANT: Captain login returns just the token string, not an object
        const token = res.data as unknown as string;
        localStorage.setItem("token", token);
        toast.success("Sign in successful");
        router.push("/");
      } else {
        toast.error("Invalid credentials");
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Captain Sign In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            placeholder="Email"
            type="email"
          />
          <Input
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            type="password"
            placeholder="Password"
          />
          <MButton mutation={mutation} className="w-full">
            Sign In
          </MButton>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
