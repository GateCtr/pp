"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/ui/search-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParcelleActions } from "@/components/admin/parcelle-actions";
import {
  MapPin,
  User,
  Calendar,
  ExternalLink,
  FileText,
  Archive,
  Trash2,
  MoreVertical,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Parcelle } from "@/db/schema";

interface ParcelleWithAgent extends Parcelle {
  agentNom: string | null;
}

interface ParcellesListClientProps {
  allParcelles: ParcelleWithAgent[];
}

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

export function ParcellesListClient({ allParcelles }: ParcellesListClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = allParcelles.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [p.commune, p.quartier, p.avenue, p.numero, p.proprietaireNom]
      .some((f) => f?.toLowerCase().includes(q));
  });

  const brouillons = filtered.filter((p) => p.statutValidation === "brouillon");
  const autres = filtered.filter((p) => p.statutValidation !== "brouillon");

  async function handleArchive(id: string) {
    if (!window.confirm("Êtes-vous sûr de vouloir archiver cette parcelle ?")) return;
    try {
      const res = await fetch(`/api/parcelles/${id}/archive`, { method: "POST" });
      if (!res.ok) {
        toast.error("Erreur lors de l'archivage");
        return;
      }
      toast.success("Parcelle archivée");
      router.refresh();
    } catch {
      toast.error("Erreur de connexion");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette parcelle ? Cette action est irréversible.")) return;
    try {
      const res = await fetch(`/api/parcelles/${id}/archive`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Erreur lors de la suppression");
        return;
      }
      toast.success("Parcelle supprimée");
      router.refresh();
    } catch {
      toast.error("Erreur de connexion");
    }
  }

  return (
    <div>
      <SearchBar
        placeholder="Rechercher par commune, quartier, avenue, numéro, propriétaire..."
        onSearch={setSearch}
        className="mb-6"
      />

      {filtered.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              {search ? "Aucun résultat pour cette recherche" : "Aucune parcelle enregistrée"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {search ? "Essayez avec d'autres termes" : "Les fiches collectées apparaîtront ici"}
            </p>
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
                {brouillons.map((parcelle) => (
                  <ParcelleCard
                    key={parcelle.id}
                    parcelle={parcelle}
                    showActions
                    menuOpen={openMenu === parcelle.id}
                    onToggleMenu={() =>
                      setOpenMenu(openMenu === parcelle.id ? null : parcelle.id)
                    }
                    onCloseMenu={() => setOpenMenu(null)}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
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
                {autres.map((parcelle) => (
                  <ParcelleCard
                    key={parcelle.id}
                    parcelle={parcelle}
                    showActions={false}
                    menuOpen={openMenu === parcelle.id}
                    onToggleMenu={() =>
                      setOpenMenu(openMenu === parcelle.id ? null : parcelle.id)
                    }
                    onCloseMenu={() => setOpenMenu(null)}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
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
  showActions,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  onArchive,
  onDelete,
}: {
  parcelle: ParcelleWithAgent;
  showActions: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const status = statusConfig[parcelle.statutValidation];

  return (
    <Card className="border-0 shadow-md shadow-gray-200/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        {/* Top row: address + status + menu */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <Link href={`/admin/parcelles/${parcelle.id}`} className="flex items-start gap-3 min-w-0 flex-1">
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
          </Link>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className={`${status.class} border text-[10px] font-semibold px-2 py-0.5`}>
              <div className={`w-1.5 h-1.5 rounded-full ${status.dot} mr-1.5`} />
              {status.label}
            </Badge>
            {/* Actions dropdown */}
            <div className="relative">
              <button
                onClick={onToggleMenu}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={onCloseMenu} />
                  <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                    <Link
                      href={`/admin/parcelles/${parcelle.id}`}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={onCloseMenu}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Voir détail
                    </Link>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-600 hover:bg-amber-50 transition-colors"
                      onClick={() => {
                        onCloseMenu();
                        onArchive(parcelle.id);
                      }}
                    >
                      <Archive className="w-3.5 h-3.5" />
                      Archiver
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => {
                        onCloseMenu();
                        onDelete(parcelle.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Supprimer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
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
            <span className="text-gray-700 font-medium mt-0.5">{parcelle.agentNom || "—"}</span>
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

        {/* Validation actions for brouillons */}
        {showActions && (
          <div className="pl-[52px]">
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
            >
              <ExternalLink className="w-3 h-3" />
              Voir la plaque générée
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
