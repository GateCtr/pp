import { Card, CardContent } from "@/components/ui/card";
import { XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-scale-in">
        {/* Error indicator */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-rose-500 shadow-xl shadow-red-500/25 mb-4">
            <XCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Parcelle Non Trouvée</h1>
          <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
            Cette parcelle n&apos;est pas enregistrée ou n&apos;a pas encore été validée
            dans le système de cartographie parcellaire.
          </p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardContent className="p-6 text-center">
            <div className="space-y-3 text-sm text-gray-500">
              <p>Raisons possibles :</p>
              <ul className="text-left space-y-2 text-xs">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                  Le QR code est invalide ou corrompu
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                  La parcelle est en cours de validation
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                  La fiche a été rejetée par l&apos;administration
                </li>
              </ul>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l&apos;accueil
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
