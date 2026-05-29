"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { toast } from "sonner";
import Link from "next/link";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Back button */}
      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center gap-2 text-blue-300/70 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Retour</span>
      </Link>

      <div className="w-full max-w-sm relative z-10 animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="xl" className="shadow-xl shadow-blue-500/25" />
          </div>
          <h1 className="text-white font-bold text-xl">Lopango</h1>
          <p className="text-blue-300/60 text-sm mt-1">Portail Agent Collecteur</p>
        </div>

        {/* Login Card */}
        <Card className="glass-light shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg text-gray-900">Connexion Agent</CardTitle>
            <CardDescription className="text-gray-500">
              Entrez votre code d&apos;accès pour commencer la collecte
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-gray-700 text-sm font-medium">
                  Code d&apos;accès
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="code"
                    type="text"
                    placeholder="AGT-XXXXXX"
                    value={codeAcces}
                    onChange={(e) => setCodeAcces(e.target.value.toUpperCase())}
                    autoComplete="off"
                    autoFocus
                    className="pl-10 h-12 text-center text-lg font-mono tracking-widest bg-gray-50 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/25 transition-all duration-200"
                disabled={loading}
              >
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

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-center text-xs text-gray-400">
                Code fourni par votre administrateur.
                <br />
                Contactez-le si vous n&apos;en avez pas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
