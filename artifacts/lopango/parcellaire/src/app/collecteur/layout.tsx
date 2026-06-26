"use client";

import { usePathname } from "next/navigation";
import { CollectorSessionProvider } from "@/components/collecteur/session-provider";
import { CollectorHeader } from "@/components/collecteur/collector-header";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

export default function CollecteurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/collecteur/login";

  // Login page gets rendered without the app shell (header, bg, container)
  if (isLoginPage) {
    return (
      <CollectorSessionProvider>
        {children}
        <PWAInstallPrompt />
      </CollectorSessionProvider>
    );
  }

  return (
    <CollectorSessionProvider>
      <div className="min-h-screen bg-gray-50">
        <CollectorHeader />
        <main className="container mx-auto px-4 py-6 max-w-2xl animate-fade-in">
          {children}
        </main>
        <PWAInstallPrompt />
      </div>
    </CollectorSessionProvider>
  );
}
