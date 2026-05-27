"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CollectorLoginPage() {
  const [codeAcces, setCodeAcces] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!codeAcces.trim()) {
      toast.error("Veuillez entrer votre code d'accès");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/collector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeAcces: codeAcces.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erreur de connexion");
        return;
      }

      toast.success(`Bienvenue, ${data.agent.nom}`);
      router.push("/collecteur");
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
            <MapPin className="w-6 h-6 text-blue-700" />
          </div>
          <CardTitle className="text-xl">Connexion Agent Collecteur</CardTitle>
          <CardDescription>
            Entrez votre code d&apos;accès unique pour accéder au formulaire de collecte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code d&apos;accès</Label>
              <Input
                id="code"
                type="text"
                placeholder="Entrez votre code..."
                value={codeAcces}
                onChange={(e) => setCodeAcces(e.target.value)}
                autoComplete="off"
                className="text-center text-lg tracking-wider"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
