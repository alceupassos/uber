"use client";

import api from "@repo/eden";
import { useQuery } from "@tanstack/react-query";

export function useUser() {
  return useQuery({
    queryKey: ["user-info"],
    queryFn: async () => {
      const res = await api.user.info.post({});
      if (res.status === 200) {
        return res.data;
      } else {
        throw new Error("Failed to fetch user info");
      }
    },
  });
}

export default function UserInfo() {
  const { data } = useUser();

  return (
    <span className="inline-flex gap-2 mb-2">
      You are {data?.name && <div>{data.name}</div>} and email
      {data?.email && <div>{data.email}</div>}
    </span>
  );
}
