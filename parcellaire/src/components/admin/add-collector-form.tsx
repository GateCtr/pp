"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AddCollectorForm() {
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

  return (
    <Card className="border-0 shadow-md shadow-gray-200/50 sticky top-24">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-900">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-violet-600" />
          </div>
          Nouvel Agent
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">
              Nom complet <span className="text-red-400">*</span>
            </Label>
            <Input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Nom de l'agent"
              className="h-10 bg-gray-50/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">Téléphone</Label>
            <Input
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+243 ..."
              className="h-10 bg-gray-50/50"
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
                className="h-10 font-mono text-sm tracking-wider bg-gray-50/50"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateCode}
                className="h-10 px-3 flex-shrink-0"
                title="Générer automatiquement"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-10 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-medium shadow-md shadow-violet-500/20"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            Ajouter l&apos;agent
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
