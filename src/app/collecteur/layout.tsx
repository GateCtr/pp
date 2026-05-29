import { getCollectorSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

export default async function CollecteurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ne pas vérifier la session pour les routes dans (auth)
  const pathname = ""; // Next.js 14+ : utiliser usePathname() côté client ou headers() côté serveur
  
  // Pour l'instant, vérifions toujours la session
  // Dans une vraie implémentation, il faudrait vérifier si on est dans une route (auth)
  const session = await getCollectorSession();

  if (!session) {
    redirect("/collecteur/(auth)/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <span className="font-semibold text-gray-900 text-sm">Lopango</span>
              <span className="text-gray-400 text-xs ml-2 hidden sm:inline">Collecte terrain</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-blue-700 text-xs font-medium">{session.nom}</span>
            </div>
            <Link
              href="/api/auth/collector/logout"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl animate-fade-in">
        {children}
      </main>
    </div>
  );
}
