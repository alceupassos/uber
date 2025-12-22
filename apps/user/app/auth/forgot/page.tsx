"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import api from "@repo/eden";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Reset() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.auth.forgot.post({
        email,
      });
      if (res.status === 200) {
        toast.success("Email to reset is sent!");
        router.push("/");
      } else {
        toast.error("Email not found");
      }
    },
  });

  return (
    <div>
      <h1>Send Reset Email</h1>
      <div>
        <Input
          className="w-full"
          required
          placeholder="Your email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={() => mutate()} disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          Send Reset Email
        </Button>
      </div>
    </div>
  );
}
