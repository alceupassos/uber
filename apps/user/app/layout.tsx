import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "../components/providers";
import { Toaster } from "sonner";
import { Geist } from "next/font/google";

const font = Geist({
  style: ["normal"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Uber | Ride-Sharing",
  description: "Seamless trip booking and real-time tracking.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Uber",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`bg-background min-h-screen ${font.className}`}>
        <Providers>
          <div className="max-w-md mx-auto min-h-screen bg-background shadow-2xl relative overflow-x-hidden">
            {children}
            <Toaster richColors position="top-center" />
          </div>
        </Providers>
      </body>
    </html>
  );
}
