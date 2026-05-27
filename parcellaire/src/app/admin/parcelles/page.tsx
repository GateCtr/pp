import { db } from "@/db";
import { parcelles, agentsCollecteurs } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParcelleActions } from "@/components/admin/parcelle-actions";

export const dynamic = "force-dynamic";

const statusColors = {
  brouillon: "bg-amber-100 text-amber-800",
  valide: "bg-green-100 text-green-800",
  rejete: "bg-red-100 text-red-800",
};

const statusLabels = {
  brouillon: "Brouillon",
  valide: "Validée",
  rejete: "Rejetée",
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Gestion des Parcelles
      </h1>

      {allParcelles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Aucune parcelle enregistrée pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {allParcelles.map(({ parcelle, agent }) => (
            <Card key={parcelle.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {parcelle.avenue} N° {parcelle.numero}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {parcelle.commune} &bull; {parcelle.quartier}
                    </p>
                  </div>
                  <Badge className={statusColors[parcelle.statutValidation]}>
                    {statusLabels[parcelle.statutValidation]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Propriétaire</span>
                    <p className="font-medium">{parcelle.proprietaireNom}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Ménages</span>
                    <p className="font-medium">{parcelle.nombreMenages}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Collecteur</span>
                    <p className="font-medium">{agent?.nom || "—"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Date</span>
                    <p className="font-medium">
                      {parcelle.creeLe
                        ? new Date(parcelle.creeLe).toLocaleDateString("fr-FR")
                        : "—"}
                    </p>
                  </div>
                </div>

                {parcelle.statutValidation === "brouillon" && (
                  <ParcelleActions parcelleId={parcelle.id} />
                )}

                {parcelle.statutValidation === "valide" && parcelle.plaqueImageUrl && (
                  <a
                    href={parcelle.plaqueImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Voir la plaque →
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
