"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="relative z-10 border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Lopango</h1>
            <p className="text-blue-300/70 text-xs hidden sm:block">Cartographie & Recensement</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/collecteur/login">
            <Button size="sm" className="bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm">
              Espace Collecteur
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
