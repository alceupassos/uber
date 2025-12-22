"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import api from "@repo/eden";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Reset() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [token] = useQueryState("token");

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.auth.reset.post(
        {
          password: newPassword,
        },
        {
          query: {
            token,
          },
        }
      );
      if (res.status === 200) {
        toast.success("Password updated successfully");
        router.push("/auth/login");
      } else {
        toast.error("An error occured");
      }
    },
  });

  return (
    <div>
      <h1>Reset Password</h1>
      <div>
        <Input
          className="w-full"
          required
          type="password"
          placeholder="New Password"
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button onClick={() => mutate()} disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          Reset Password
        </Button>
      </div>
    </div>
  );
}
