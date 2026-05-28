import { MapPin } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 mt-8">
      <div className="container mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Lopango</p>
              <p className="text-blue-300/50 text-xs">
                Cartographie & Recensement &mdash; RDC
              </p>
            </div>
          </div>

          {/* Powered by */}
          <p className="text-blue-300/40 text-xs">
            Propulsé par{" "}
            <a
              href="https://akollad.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300/70 hover:text-white transition-colors font-medium"
            >
              Akollad
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
