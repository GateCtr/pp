import { ArrowRight } from "lucide-react";

export function LandingCTA() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-20">
      <div className="max-w-3xl mx-auto text-center">
        <div className="relative rounded-3xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 p-10 sm:p-16 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-blue-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl sm:text-4xl font-bold text-white mb-4">
              Digitalisez votre<br />
              <span className="text-gradient">gestion parcellaire</span>
            </h3>
            <p className="text-blue-200/70 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
              DIGIPARC centralise la collecte terrain, la validation administrative
              et la génération de plaques officielles avec QR Code — le tout dans
              un seul système sécurisé.
            </p>

            <a
              href="https://akollad.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors text-sm font-medium"
            >
              Développé par Akollad
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
