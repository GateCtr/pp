"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ParcelleActions({ parcelleId }: { parcelleId: string }) {
  const [loading, setLoading] = useState<"valide" | "rejete" | null>(null);
  const router = useRouter();

  async function handleAction(action: "valide" | "rejete") {
    setLoading(action);
    try {
      const res = await fetch(`/api/parcelles/${parcelleId}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: action }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Erreur");
        return;
      }

      toast.success(
        action === "valide"
          ? "Parcelle validée ! Plaque en cours de génération..."
          : "Parcelle rejetée."
      );
      router.refresh();
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="h-8 px-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-xs font-medium shadow-sm shadow-emerald-500/20"
        onClick={() => handleAction("valide")}
        disabled={loading !== null}
      >
        {loading === "valide" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
        ) : (
          <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
        )}
        Valider
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8 px-3 text-xs font-medium text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
        onClick={() => handleAction("rejete")}
        disabled={loading !== null}
      >
        {loading === "rejete" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
        ) : (
          <XCircle className="w-3.5 h-3.5 mr-1.5" />
        )}
        Rejeter
      </Button>
    </div>
  );
}
