import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Smartphone, ArrowRight } from "lucide-react";
import { HeroIllustration } from "./illustrations/hero-illustration";

export function LandingHero() {
  return (
    <section className="container mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="text-center lg:text-left animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm mb-6">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft" />
            <span className="text-blue-200 text-xs font-medium">Plateforme Active &mdash; RDC</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-bold text-gradient leading-[1.1] mb-6">
            Cartographie &<br />Recensement<br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Parcellaire Digital
            </span>
          </h2>

          <p className="text-blue-200/80 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
            Plateforme intégrée de collecte foncière, recensement des ménages
            et génération automatique de plaques parcellaires connectées avec QR Code.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
            <Link href="/collecteur/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/25 h-13 px-8 text-base rounded-xl">
                <Smartphone className="w-5 h-5 mr-2" />
                Commencer la Collecte
              </Button>
            </Link>
            <a href="#etapes" className="group flex items-center gap-2 text-blue-300/80 hover:text-white transition-colors text-sm font-medium">
              Voir comment ça marche
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 mt-10 justify-center lg:justify-start">
            <div>
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-blue-300/60 text-xs">Digital & Mobile</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white">QR Code</p>
              <p className="text-blue-300/60 text-xs">Vérification Instant.</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white">PWA</p>
              <p className="text-blue-300/60 text-xs">Mode Hors-ligne</p>
            </div>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="hidden lg:flex items-center justify-center animate-fade-in">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}
