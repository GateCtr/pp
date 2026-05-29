import { db } from "@/db";
import { parcelles } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getCollectorSession } from "@/lib/auth";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrouillonsList } from "@/components/collecteur/brouillons-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CollecteurPage() {
  const session = await getCollectorSession();

  // Le proxy gère la redirection — si on arrive ici sans session,
  // on affiche un état vide plutôt que de rediriger (évite la boucle)
  if (!session) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Chargement de la session...</p>
        <script dangerouslySetInnerHTML={{ __html: `window.location.reload()` }} />
      </div>
    );
  }

  const mesBrouillons = await db
    .select()
    .from(parcelles)
    .where(
      and(
        eq(parcelles.agentId, session.agentId),
        eq(parcelles.statutValidation, "brouillon")
      )
    )
    .orderBy(desc(parcelles.creeLe));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Mes Collectes
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gérez vos fiches parcellaires en cours
          </p>
        </div>
        <a href="/collecteur/nouvelle">
          <Button className="h-10 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nouvelle Collecte</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </a>
      </div>

      {/* Mes Brouillons Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-amber-500" />
          <h2 className="text-base font-semibold text-gray-800">
            Mes Brouillons
          </h2>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
            {mesBrouillons.length}
          </span>
        </div>

        <BrouillonsList brouillons={mesBrouillons} />
      </div>
    </div>
  );
}
