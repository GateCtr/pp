import { db } from "@/db";
import { parcelles, agentsCollecteurs } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { GeneratePlatesButton } from "@/components/admin/generate-plates-button";
import { ExportPdfButton } from "@/components/admin/export-pdf-button";
import { FileText } from "lucide-react";
import { ParcellesListClient } from "@/components/admin/parcelles-list-client";

export const dynamic = "force-dynamic";

export default async function AdminParcellesPage() {
  const allParcelles = await db
    .select({
      parcelle: parcelles,
      agent: agentsCollecteurs,
    })
    .from(parcelles)
    .leftJoin(agentsCollecteurs, eq(parcelles.agentId, agentsCollecteurs.id))
    .orderBy(desc(parcelles.creeLe));

  const brouillonsCount = allParcelles.filter(
    (p) => p.parcelle.statutValidation === "brouillon"
  ).length;
  const validesCount = allParcelles.filter(
    (p) => p.parcelle.statutValidation === "valide"
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Parcelles</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {allParcelles.length} parcelle{allParcelles.length !== 1 ? "s" : ""} enregistrée{allParcelles.length !== 1 ? "s" : ""}
          </p>
        </div>
        {/* Summary badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <ExportPdfButton
            parcelles={allParcelles.map(({ parcelle, agent }) => ({
              ...parcelle,
              agentNom: agent?.nom || "—",
            }))}
            filterLabel="Toutes les parcelles"
          />
          <GeneratePlatesButton
            validatedParcelles={allParcelles
              .filter((p) => p.parcelle.statutValidation === "valide")
              .map((p) => p.parcelle)}
          />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-xs font-medium text-amber-700">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {brouillonsCount} en attente
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-medium text-emerald-700">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {validesCount} validées
          </div>
        </div>
      </div>

      {allParcelles.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Aucune parcelle enregistrée</p>
            <p className="text-gray-400 text-sm mt-1">Les fiches collectées apparaîtront ici</p>
          </CardContent>
        </Card>
      ) : (
        <ParcellesListClient
          allParcelles={allParcelles.map(({ parcelle, agent }) => ({
            ...parcelle,
            agentNom: agent?.nom || null,
          }))}
        />
      )}
    </div>
  );
}
