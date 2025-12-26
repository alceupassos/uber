"use client";

import { NuqsAdapter } from "nuqs/adapters/next";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <NuqsAdapter>{children}</NuqsAdapter>;
}
