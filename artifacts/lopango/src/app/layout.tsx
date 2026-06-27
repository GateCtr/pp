import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { PWARegister } from "@/components/pwa-register";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://lopango.cd";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lopango - Cartographie et Recensement Parcellaire RDC",
    template: "%s | Lopango",
  },
  description:
    "Plateforme digitale de cartographie, recensement et signalétique parcellaire pour la République Démocratique du Congo. Collecte terrain, gestion des parcelles et génération de plaques d'identification.",
  keywords: [
    "cartographie",
    "recensement",
    "parcellaire",
    "RDC",
    "Congo",
    "collecte terrain",
    "signalétique",
    "plaques",
    "lopango",
    "cadastre",
    "géolocalisation",
  ],
  authors: [{ name: "Lopango", url: SITE_URL }],
  creator: "Lopango",
  publisher: "Lopango",
  applicationName: "Lopango",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // Open Graph
  openGraph: {
    type: "website",
    locale: "fr_CD",
    url: SITE_URL,
    siteName: "Lopango",
    title: "Lopango - Cartographie et Recensement Parcellaire RDC",
    description:
      "Plateforme digitale de cartographie, recensement et signalétique parcellaire pour la République Démocratique du Congo.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lopango - Système de cartographie et recensement parcellaire",
        type: "image/png",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Lopango - Cartographie et Recensement Parcellaire RDC",
    description:
      "Plateforme digitale de cartographie, recensement et signalétique parcellaire pour la République Démocratique du Congo.",
    images: ["/og-image.png"],
    creator: "@lopango_cd",
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },

  // Manifest
  manifest: "/site.webmanifest",

  // Alternate
  alternates: {
    canonical: SITE_URL,
  },

  // App links
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lopango",
  },

  // Category
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1e3a5f" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Bebas+Neue&family=Montserrat:wght@400;600;700;800&family=Playfair+Display:wght@400;600;700&family=Raleway:wght@400;600;700;800&family=Ubuntu:wght@400;700&family=Barlow+Condensed:wght@400;600;700&family=Roboto+Condensed:wght@400;700&family=Cinzel:wght@400;600;700&family=Anton&display=swap" />
          <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Lopango" />
          <meta name="msapplication-TileColor" content="#1e3a5f" />
          <meta name="msapplication-tap-highlight" content="no" />
        </head>
        <body className="antialiased">
          {children}
          <Toaster position="top-center" />
          <PWARegister />
        </body>
      </html>
    </ClerkProvider>
  );
}
