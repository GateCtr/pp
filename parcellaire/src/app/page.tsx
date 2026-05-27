import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      {/* Header */}
      <header className="border-b border-blue-600/50 bg-blue-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-800" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Parcellaire RDC</h1>
              <p className="text-blue-200 text-xs">Système Digital de Cartographie</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Cartographie & Recensement Parcellaire
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Plateforme digitale intégrée pour la collecte des données foncières,
            le recensement des ménages et la génération de plaques parcellaires connectées.
          </p>
        </div>

        {/* Access Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Collecteur */}
          <Card className="bg-white/10 backdrop-blur border-blue-400/30 text-white hover:bg-white/15 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-green-300" />
              </div>
              <CardTitle className="text-xl">Agent Collecteur</CardTitle>
              <CardDescription className="text-blue-200">
                Accédez au formulaire de collecte terrain pour enregistrer les données parcellaires.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/collecteur/login">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Connexion Collecteur
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin */}
          <Card className="bg-white/10 backdrop-blur border-blue-400/30 text-white hover:bg-white/15 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-amber-300" />
              </div>
              <CardTitle className="text-xl">Administration</CardTitle>
              <CardDescription className="text-blue-200">
                Tableau de bord pour valider les fiches, gérer les agents et générer les plaques.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                  Accès Administrateur
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              title: "Collecte Terrain",
              desc: "Formulaires optimisés pour smartphones avec mode hors-ligne",
            },
            {
              title: "Plaques Connectées",
              desc: "Génération automatique de plaques bleues avec QR Code intelligent",
            },
            {
              title: "Base Centralisée",
              desc: "Données sécurisées avec validation administrative multi-niveaux",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-xl bg-white/5 border border-blue-400/20"
            >
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-blue-200 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
