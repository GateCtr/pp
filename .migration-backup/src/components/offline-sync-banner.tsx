"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RefreshCw, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import {
  countPending,
  syncPendingParcelles,
  isOnline,
} from "@/lib/offline-storage";

export function OfflineSyncBanner() {
  const [online, setOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshCount = useCallback(async () => {
    try {
      const count = await countPending();
      setPendingCount(count);
    } catch {
      // IndexedDB not available
    }
  }, []);

  useEffect(() => {
    setOnline(isOnline());
    refreshCount();

    function handleOnline() {
      setOnline(true);
      toast.success("Connexion rétablie !");
      refreshCount();
    }
    function handleOffline() {
      setOnline(false);
      toast.error("Connexion perdue — mode hors-ligne activé");
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Listen for SW sync messages
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "SYNC_AVAILABLE") {
          refreshCount();
        }
      });
    }

    // Periodic check
    const interval = setInterval(refreshCount, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [refreshCount]);

  async function handleSync() {
    setSyncing(true);
    try {
      const { synced, failed } = await syncPendingParcelles();
      if (synced > 0) {
        toast.success(`${synced} fiche(s) synchronisée(s) !`);
      }
      if (failed > 0) {
        toast.error(`${failed} fiche(s) en échec`);
      }
      await refreshCount();
    } catch {
      toast.error("Erreur de synchronisation");
    } finally {
      setSyncing(false);
    }
  }

  // Don't show if online and nothing pending
  if (online && pendingCount === 0) return null;

  return (
    <div
      className={`mb-4 px-4 py-3 rounded-xl border flex items-center justify-between gap-3 ${
        online
          ? "bg-amber-50 border-amber-200"
          : "bg-red-50 border-red-200"
      }`}
    >
      <div className="flex items-center gap-3">
        {online ? (
          <Wifi className="w-4 h-4 text-amber-600 flex-shrink-0" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-600 flex-shrink-0" />
        )}
        <div>
          <p className={`text-xs font-medium ${online ? "text-amber-800" : "text-red-800"}`}>
            {online
              ? `${pendingCount} fiche(s) en attente de synchronisation`
              : "Mode hors-ligne — les données sont sauvegardées localement"}
          </p>
          {!online && (
            <p className="text-[10px] text-red-600 mt-0.5">
              Vos fiches seront synchronisées dès le retour de la connexion
            </p>
          )}
        </div>
      </div>

      {online && pendingCount > 0 && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-[10px] border-amber-300 text-amber-700 hover:bg-amber-100"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : (
            <RefreshCw className="w-3 h-3 mr-1" />
          )}
          Synchroniser
        </Button>
      )}

      {online && pendingCount === 0 && (
        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
      )}
    </div>
  );
}
