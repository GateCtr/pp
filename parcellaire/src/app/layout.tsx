import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { PWARegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Parcellaire RDC - Système de Cartographie et Recensement",
  description:
    "Plateforme digitale de cartographie, recensement et signalétique parcellaire - République Démocratique du Congo",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body className="antialiased">
          {children}
          <Toaster position="top-center" />
          <PWARegister />
        </body>
      </html>
    </ClerkProvider>
  );
}
