"use client";

import { useState } from "react";
import { SearchBar } from "@/components/ui/search-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Edit3, FileText } from "lucide-react";
import type { Parcelle } from "@/db/schema";

interface BrouillonsListProps {
  brouillons: Parcelle[];
}

export function BrouillonsList({ brouillons }: BrouillonsListProps) {
  const [search, setSearch] = useState("");

  const filtered = brouillons.filter((parcelle) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [parcelle.avenue, parcelle.numero, parcelle.commune, parcelle.quartier]
      .some((f) => f?.toLowerCase().includes(q));
  });

  return (
    <div>
      <SearchBar
        placeholder="Rechercher par avenue, numéro, commune, quartier..."
        onSearch={setSearch}
        className="mb-4"
      />

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">
            {search ? "Aucun résultat pour cette recherche" : "Aucun brouillon en cours"}
          </p>
          <p className="text-gray-300 text-xs mt-1">
            {search ? "Essayez avec d'autres termes" : "Vos collectes non soumises apparaîtront ici"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((parcelle) => (
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
                  <a href={`/collecteur/editer/${parcelle.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Edit3 className="w-3 h-3 mr-1.5" />
                      Éditer
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
