import { db } from "@/db";
import { parcelles, agentsCollecteurs } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ParcelleActions } from "@/components/admin/parcelle-actions";
import { GeneratePlatesButton } from "@/components/admin/generate-plates-button";
import { MapPin, User, Calendar, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const statusConfig = {
  brouillon: {
    label: "En attente",
    class: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  valide: {
    label: "Validée",
    class: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-400",
  },
  rejete: {
    label: "Rejetée",
    class: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-400",
  },
};

export default async function AdminParcellesPage() {
  const allParcelles = await db
    .select({
      parcelle: parcelles,
      agent: agentsCollecteurs,
    })
    .from(parcelles)
    .leftJoin(agentsCollecteurs, eq(parcelles.agentId, agentsCollecteurs.id))
    .orderBy(desc(parcelles.creeLe));

  const brouillons = allParcelles.filter(
    (p) => p.parcelle.statutValidation === "brouillon"
  );
  const autres = allParcelles.filter(
    (p) => p.parcelle.statutValidation !== "brouillon"
  );

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
          <GeneratePlatesButton
            validatedParcelles={allParcelles
              .filter((p) => p.parcelle.statutValidation === "valide")
              .map((p) => p.parcelle)}
          />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-xs font-medium text-amber-700">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {brouillons.length} en attente
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-medium text-emerald-700">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {autres.filter((p) => p.parcelle.statutValidation === "valide").length} validées
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
        <div className="space-y-8">
          {/* Pending section */}
          {brouillons.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-soft" />
                En attente de validation ({brouillons.length})
              </h3>
              <div className="space-y-3 stagger-children">
                {brouillons.map(({ parcelle, agent }) => (
                  <ParcelleCard
                    key={parcelle.id}
                    parcelle={parcelle}
                    agent={agent}
                    showActions
                  />
                ))}
              </div>
            </section>
          )}

          {/* Processed section */}
          {autres.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                Traitées ({autres.length})
              </h3>
              <div className="space-y-3">
                {autres.map(({ parcelle, agent }) => (
                  <ParcelleCard
                    key={parcelle.id}
                    parcelle={parcelle}
                    agent={agent}
                    showActions={false}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function ParcelleCard({
  parcelle,
  agent,
  showActions,
}: {
  parcelle: typeof parcelles.$inferSelect;
  agent: typeof agentsCollecteurs.$inferSelect | null;
  showActions: boolean;
}) {
  const status = statusConfig[parcelle.statutValidation];

  return (
    <Link href={`/admin/parcelles/${parcelle.id}`}>
      <Card className="border-0 shadow-md shadow-gray-200/50 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer">
        <CardContent className="p-4 sm:p-5">
          {/* Top row: address + status */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm truncate">
                  {parcelle.avenue} N° {parcelle.numero}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {parcelle.commune} &bull; Q. {parcelle.quartier}
                </p>
              </div>
            </div>
            <Badge className={`${status.class} border text-[10px] font-semibold px-2 py-0.5 flex-shrink-0`}>
              <div className={`w-1.5 h-1.5 rounded-full ${status.dot} mr-1.5`} />
              {status.label}
            </Badge>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4 pl-[52px]">
            <div>
              <span className="text-gray-400 block">Propriétaire</span>
              <span className="text-gray-700 font-medium flex items-center gap-1 mt-0.5">
                <User className="w-3 h-3 text-gray-300" />
                {parcelle.proprietaireNom}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Ménages</span>
              <span className="text-gray-700 font-medium mt-0.5">{parcelle.nombreMenages || 0}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Collecteur</span>
              <span className="text-gray-700 font-medium mt-0.5">{agent?.nom || "—"}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Date</span>
              <span className="text-gray-700 font-medium flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-gray-300" />
                {parcelle.creeLe
                  ? new Date(parcelle.creeLe).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                    })
                  : "—"}
              </span>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="pl-[52px]" onClick={(e) => e.preventDefault()}>
              <ParcelleActions parcelleId={parcelle.id} />
            </div>
          )}

          {parcelle.statutValidation === "valide" && parcelle.plaqueImageUrl && (
            <div className="pl-[52px]">
              <a
                href={parcelle.plaqueImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
                Voir la plaque générée
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
