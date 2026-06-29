import type { Metadata } from "next";
import { WifiOff, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Hors ligne",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
          <WifiOff className="w-10 h-10 text-blue-300" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Vous êtes hors ligne
        </h1>

        <p className="text-blue-200/70 text-sm leading-relaxed mb-8">
          Pas de connexion internet disponible. Vos données en brouillon sont
          sauvegardées localement et seront synchronisées automatiquement au
          retour de la connexion.
        </p>

        <a
          href="/collecteur"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </a>

        <p className="mt-6 text-xs text-blue-300/40">
          DIGIPARC fonctionne en mode hors-ligne pour la collecte terrain.
        </p>
      </div>
    </div>
  );
}
