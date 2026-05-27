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
          ? "Parcelle validée ! Plaque en génération..."
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
    <div className="flex gap-2">
      <Button
        size="sm"
        className="bg-green-600 hover:bg-green-700"
        onClick={() => handleAction("valide")}
        disabled={loading !== null}
      >
        {loading === "valide" ? (
          <Loader2 className="w-4 h-4 animate-spin mr-1" />
        ) : (
          <CheckCircle className="w-4 h-4 mr-1" />
        )}
        Valider
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-red-600 border-red-200 hover:bg-red-50"
        onClick={() => handleAction("rejete")}
        disabled={loading !== null}
      >
        {loading === "rejete" ? (
          <Loader2 className="w-4 h-4 animate-spin mr-1" />
        ) : (
          <XCircle className="w-4 h-4 mr-1" />
        )}
        Rejeter
      </Button>
    </div>
  );
}
