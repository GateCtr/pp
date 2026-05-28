import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Shield, QrCode, FileCheck, Smartphone } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">Lopango</h1>
              <p className="text-blue-300/70 text-xs hidden sm:block">Cartographie & Recensement</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/collecteur/login">
              <Button variant="ghost" size="sm" className="text-blue-200 hover:text-white hover:bg-white/10">
                Collecteur
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="sm" className="bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10">
        <section className="container mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm mb-6">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft" />
              <span className="text-blue-200 text-xs font-medium">Plateforme Active</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gradient leading-tight mb-6">
              Système Digital de<br />Cartographie Parcellaire
            </h2>
            <p className="text-blue-200/80 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Plateforme intégrée pour la collecte des données foncières,
              le recensement des ménages et la génération de plaques
              parcellaires connectées avec QR Code.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/collecteur/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/25 h-12 px-8 text-base">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Accès Collecteur
                </Button>
              </Link>
              <Link href="/admin" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 h-12 px-8 text-base backdrop-blur-sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Administration
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto stagger-children">
            {/* Collecteur Card */}
            <Card className="glass border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 group">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white text-lg">Agent Collecteur</CardTitle>
                <CardDescription className="text-blue-200/60">
                  Formulaire terrain optimisé pour smartphone avec mode hors-ligne
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-blue-200/70 mb-4">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
                    Connexion par code d&apos;accès unique
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
                    Formulaire multi-étapes (5 rubriques)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
                    Jusqu&apos;à 10 ménages par parcelle
                  </li>
                </ul>
                <Link href="/collecteur/login">
                  <Button className="w-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30">
                    Connexion Collecteur
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Admin Card */}
            <Card className="glass border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 group">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-6 h-6 text-amber-400" />
                </div>
                <CardTitle className="text-white text-lg">Administration</CardTitle>
                <CardDescription className="text-blue-200/60">
                  Tableau de bord pour validation et génération des plaques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-blue-200/70 mb-4">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400/70" />
                    Validation / Rejet des fiches
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400/70" />
                    Génération automatique des plaques
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400/70" />
                    Gestion des agents collecteurs
                  </li>
                </ul>
                <Link href="/admin">
                  <Button className="w-full bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30">
                    Accès Administrateur
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12 animate-fade-in">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
              Comment ça fonctionne
            </h3>
            <p className="text-blue-200/60 max-w-lg mx-auto text-sm">
              Un processus simplifié de la collecte terrain à la plaque officielle
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto stagger-children">
            {[
              {
                icon: Smartphone,
                title: "1. Collecte Terrain",
                desc: "L'agent remplit le formulaire sur son smartphone et soumet la fiche",
                color: "blue",
              },
              {
                icon: FileCheck,
                title: "2. Validation Admin",
                desc: "L'administrateur vérifie et valide les données collectées",
                color: "indigo",
              },
              {
                icon: QrCode,
                title: "3. Plaque Générée",
                desc: "Une plaque officielle avec QR Code est automatiquement créée",
                color: "violet",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-300 text-center group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-${f.color}-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`w-7 h-7 text-${f.color}-400`} />
                </div>
                <h4 className="text-white font-semibold mb-2 text-sm">{f.title}</h4>
                <p className="text-blue-200/60 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 mt-8">
          <div className="container mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-blue-300/40 text-xs">
              Lopango — Cartographie & Recensement RDC
            </p>
            <p className="text-blue-300/40 text-xs">
              Propulsé par Next.js 16 & Vercel
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
