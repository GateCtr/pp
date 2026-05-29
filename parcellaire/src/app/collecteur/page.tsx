import { db } from "@/db";
import { parcelles } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getCollectorSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Edit3, MapPin, Calendar, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CollecteurPage() {
  const session = await getCollectorSession();
  if (!session) redirect("/collecteur/login");

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
        <Link href="/collecteur/nouvelle">
          <Button className="h-10 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nouvelle Collecte</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </Link>
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

        {mesBrouillons.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-medium">
              Aucun brouillon en cours
            </p>
            <p className="text-gray-300 text-xs mt-1">
              Vos collectes non soumises apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mesBrouillons.map((parcelle) => (
              <Card
                key={parcelle.id}
                className="border-0 shadow-md shadow-gray-200/50 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <span className="font-semibold text-gray-900 text-sm truncate">
                          {parcelle.avenue} N° {parcelle.numero}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span>{parcelle.commune}</span>
                        <span className="text-gray-300">•</span>
                        <span>{parcelle.quartier}</span>
                        {parcelle.creeLe && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(parcelle.creeLe).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Link href={`/collecteur/editer/${parcelle.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Edit3 className="w-3 h-3 mr-1.5" />
                        Éditer
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
