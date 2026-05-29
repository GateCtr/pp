"use client";

import { useCollectorSession } from "./session-provider";
import { Logo } from "@/components/ui/logo";
import { LogOut } from "lucide-react";
import Link from "next/link";

export function CollectorHeader() {
  const { session, loading } = useCollectorSession();

  if (loading || !session) return null;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div>
            <span className="font-semibold text-gray-900 text-sm">Lopango</span>
            <span className="text-gray-400 text-xs ml-2 hidden sm:inline">Collecte terrain</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-blue-700 text-xs font-medium">{session.nom}</span>
          </div>
          <Link
            href="/api/auth/collector/logout"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
