import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { PWARegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lopango - Système de Cartographie et Recensement RDC",
  description:
    "Plateforme digitale de cartographie, recensement et signalétique parcellaire - République Démocratique du Congo",
};

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Vérifier si les clés Clerk sont valides
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;

// Désactiver Clerk temporairement pour résoudre la boucle de redirection
// Mettre à true seulement quand Clerk est correctement configuré
const isClerkEnabled = true; // Réactivé pour l'interface admin

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (isClerkEnabled) {
    return (
      <ClerkProvider>
        <html lang="fr">
          <head>
            <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
            <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
            <link rel="shortcut icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/site.webmanifest" />
          </head>
          <body className="antialiased">
            {children}
            <Toaster position="top-center" />
            <PWARegister />
          </body>
        </html>
      </ClerkProvider>
    );
  } else {
    // Mode sans Clerk - pour le développement
    return (
      <html lang="fr">
        <head>
          <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/site.webmanifest" />
        </head>
        <body className="antialiased">
          {children}
          <Toaster position="top-center" />
          <PWARegister />
        </body>
      </html>
    );
  }
}
