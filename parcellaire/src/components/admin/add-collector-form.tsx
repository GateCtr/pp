"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, Shuffle, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AddCollectorModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [codeAcces, setCodeAcces] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim() || !codeAcces.trim()) {
      toast.error("Nom et code d'accès requis");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/collecteurs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: nom.trim(),
          telephone: telephone.trim() || null,
          codeAcces: codeAcces.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Erreur");
        return;
      }

      toast.success("Agent collecteur ajouté avec succès !");
      setNom("");
      setTelephone("");
      setCodeAcces("");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  function generateCode() {
    const code = `AGT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setCodeAcces(code);
  }

  function handleClose() {
    if (!loading) {
      setOpen(false);
      setNom("");
      setTelephone("");
      setCodeAcces("");
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={() => setOpen(true)}
        className="h-10 px-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-medium shadow-md shadow-violet-500/20"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Ajouter un agent
      </Button>

      {/* Modal Backdrop + Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Nouvel Agent Collecteur
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Créez un accès pour un agent terrain
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Nom complet <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Nom de l'agent"
                  className="h-11 bg-gray-50/50"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Téléphone
                </Label>
                <Input
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+243 ..."
                  className="h-11 bg-gray-50/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Code d&apos;accès <span className="text-red-400">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={codeAcces}
                    onChange={(e) => setCodeAcces(e.target.value.toUpperCase())}
                    placeholder="AGT-XXXXXX"
                    className="h-11 font-mono text-sm tracking-wider bg-gray-50/50"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateCode}
                    className="h-11 px-4 flex-shrink-0"
                    title="Générer automatiquement"
                  >
                    <Shuffle className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-gray-400">
                  Ce code sera utilisé par l&apos;agent pour se connecter
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 h-11"
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium shadow-md shadow-violet-500/20"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  Ajouter
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
