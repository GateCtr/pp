import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Smartphone, ArrowRight } from "lucide-react";

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
              Prêt à digitaliser votre<br />
              <span className="text-gradient">cartographie parcellaire ?</span>
            </h3>
            <p className="text-blue-200/70 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
              Rejoignez les agents collecteurs qui utilisent déjà Lopango pour
              sécuriser et accélérer le recensement foncier en RDC.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/collecteur/login">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/25 h-13 px-8 text-base rounded-xl">
                  <Smartphone className="w-5 h-5 mr-2" />
                  Commencer maintenant
                </Button>
              </Link>
              <a
                href="https://akollad.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-blue-300/80 hover:text-white transition-colors text-sm font-medium"
              >
                En savoir plus sur Akollad
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
