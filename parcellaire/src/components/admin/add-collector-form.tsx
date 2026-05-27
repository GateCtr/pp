"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus } from "lucide-react";
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

      toast.success("Agent collecteur ajouté !");
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Ajouter un Agent
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Nom complet *</Label>
            <Input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Nom de l'agent"
            />
          </div>
          <div className="space-y-1">
            <Label>Téléphone</Label>
            <Input
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+243..."
            />
          </div>
          <div className="space-y-1">
            <Label>Code d&apos;accès *</Label>
            <div className="flex gap-2">
              <Input
                value={codeAcces}
                onChange={(e) => setCodeAcces(e.target.value)}
                placeholder="Code unique"
                className="font-mono"
              />
              <Button type="button" variant="outline" size="sm" onClick={generateCode}>
                Générer
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            Ajouter
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
