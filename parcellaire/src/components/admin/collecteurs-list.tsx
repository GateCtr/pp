"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/ui/search-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Phone,
  Key,
  Edit3,
  Pause,
  Play,
  Ban,
  RefreshCw,
  Archive,
  Trash2,
  MoreVertical,
  Loader2,
  Check,
  Copy,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { AgentCollecteur } from "@/db/schema";

const statutConfig: Record<
  string,
  { label: string; className: string }
> = {
  actif: {
    label: "Actif",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  suspendu: {
    label: "Suspendu",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  revoque: {
    label: "Révoqué",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  archive: {
    label: "Archivé",
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

interface CollecteursListProps {
  agents: AgentCollecteur[];
}

export function CollecteursList({ agents }: CollecteursListProps) {
  const [search, setSearch] = useState("");
  const activeAgents = agents.filter((a) => a.statut !== "archive");
  const archivedAgents = agents.filter((a) => a.statut === "archive");
  const [showArchived, setShowArchived] = useState(false);

  const filteredActive = activeAgents.filter((a) =>
    [a.nom, a.telephone, a.codeAcces].some((f) =>
      f?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const filteredArchived = archivedAgents.filter((a) =>
    [a.nom, a.telephone, a.codeAcces].some((f) =>
      f?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div>
      <SearchBar
        placeholder="Rechercher un agent..."
        onSearch={setSearch}
        className="mb-4"
      />

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">
          Agents enregistrés
        </h3>
        <span className="text-xs text-gray-400">
          {activeAgents.length} actif{activeAgents.length !== 1 ? "s" : ""}
          {archivedAgents.length > 0 && ` · ${archivedAgents.length} archivé${archivedAgents.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {agents.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <User className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Aucun collecteur enregistré</p>
            <p className="text-gray-400 text-xs mt-1">
              Utilisez le formulaire pour en ajouter
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {filteredActive.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
            {filteredActive.length === 0 && search && (
              <p className="text-center text-gray-400 text-sm py-6">
                Aucun agent actif trouvé pour &quot;{search}&quot;
              </p>
            )}
          </div>

          {archivedAgents.length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-3 transition-colors"
              >
                <Archive className="w-3 h-3" />
                {showArchived ? "Masquer" : "Afficher"} les archivés ({archivedAgents.length})
              </button>
              {showArchived && (
                <div className="space-y-3 opacity-60">
                  {filteredArchived.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                  {filteredArchived.length === 0 && search && (
                    <p className="text-center text-gray-400 text-sm py-6">
                      Aucun agent archivé trouvé pour &quot;{search}&quot;
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AgentCard({ agent }: { agent: AgentCollecteur }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editNom, setEditNom] = useState(agent.nom);
  const [editTelephone, setEditTelephone] = useState(agent.telephone || "");
  const [revealCode, setRevealCode] = useState(false);
  const [currentCode, setCurrentCode] = useState(agent.codeAcces);

  const statut = agent.statut || "actif";
  const config = statutConfig[statut] || statutConfig.actif;

  function maskCode(code: string) {
    if (code.length <= 4) return "••••";
    return code.slice(0, 4) + "••••••";
  }

  async function handleAction(action: string) {
    setLoading(action);
    setMenuOpen(false);

    try {
      const res = await fetch(`/api/collecteurs/${agent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Erreur lors de l'action");
        return;
      }

      const data = await res.json();

      if (action === "regenerer_code" && data.newCode) {
        setCurrentCode(data.newCode);
        setRevealCode(true);
        toast.success(`Nouveau code : ${data.newCode}`, { duration: 8000 });
      } else {
        const messages: Record<string, string> = {
          suspendre: "Agent suspendu",
          reactiver: "Agent réactivé",
          revoquer: "Agent révoqué",
          archiver: "Agent archivé",
        };
        toast.success(messages[action] || "Action effectuée");
      }

      router.refresh();
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(null);
    }
  }

  async function handleEdit() {
    if (!editNom.trim()) {
      toast.error("Le nom est requis");
      return;
    }

    setLoading("edit");
    try {
      const res = await fetch(`/api/collecteurs/${agent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          nom: editNom.trim(),
          telephone: editTelephone.trim() || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Erreur lors de la modification");
        return;
      }

      toast.success("Agent modifié avec succès");
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cet agent ? Cette action est irréversible.")) {
      return;
    }

    setLoading("delete");
    setMenuOpen(false);

    try {
      const res = await fetch(`/api/collecteurs/${agent.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Erreur lors de la suppression");
        return;
      }

      toast.success("Agent supprimé définitivement");
      router.refresh();
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(null);
    }
  }

  function handleConfirmAction(action: string, message: string) {
    if (!window.confirm(message)) return;
    handleAction(action);
  }

  function copyCode() {
    navigator.clipboard.writeText(currentCode);
    toast.success("Code copié !");
  }

  return (
    <Card className="border-0 shadow-md shadow-gray-200/50 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        {editing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Edit3 className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-medium text-gray-700">Modifier l&apos;agent</span>
            </div>
            <Input
              value={editNom}
              onChange={(e) => setEditNom(e.target.value)}
              placeholder="Nom complet"
              className="h-9 text-sm"
            />
            <Input
              value={editTelephone}
              onChange={(e) => setEditTelephone(e.target.value)}
              placeholder="Téléphone"
              className="h-9 text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-8 px-3 text-xs bg-violet-600 hover:bg-violet-700 text-white"
                onClick={handleEdit}
                disabled={loading === "edit"}
              >
                {loading === "edit" ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Check className="w-3 h-3 mr-1" />
                )}
                Enregistrer
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  setEditing(false);
                  setEditNom(agent.nom);
                  setEditTelephone(agent.telephone || "");
                }}
                disabled={loading === "edit"}
              >
                <X className="w-3 h-3 mr-1" />
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-50 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-violet-600" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {agent.nom}
                </p>
                <Badge
                  className={`text-[10px] px-1.5 py-0 border ${config.className}`}
                >
                  {config.label}
                </Badge>
              </div>

              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span
                  className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer group"
                  onClick={() => setRevealCode(!revealCode)}
                  title="Cliquer pour afficher/masquer"
                >
                  <Key className="w-3 h-3 text-gray-300" />
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono group-hover:bg-violet-50 transition-colors">
                    {revealCode ? currentCode : maskCode(currentCode)}
                  </code>
                </span>
                {revealCode && (
                  <button
                    onClick={copyCode}
                    className="text-gray-400 hover:text-violet-500 transition-colors"
                    title="Copier le code"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}
                {agent.telephone && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Phone className="w-3 h-3" />
                    {agent.telephone}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                {agent.creeLe && (
                  <span>
                    Créé le{" "}
                    {new Date(agent.creeLe).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
                {agent.misAJour && agent.misAJour !== agent.creeLe && (
                  <span>
                    · Modifié le{" "}
                    {new Date(agent.misAJour).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Quick status action */}
              {statut === "actif" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 text-xs text-amber-600 border-amber-200 hover:bg-amber-50"
                  onClick={() => handleAction("suspendre")}
                  disabled={loading !== null}
                  title="Suspendre"
                >
                  {loading === "suspendre" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Pause className="w-3.5 h-3.5" />
                  )}
                </Button>
              )}
              {statut === "suspendu" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  onClick={() => handleAction("reactiver")}
                  disabled={loading !== null}
                  title="Réactiver"
                >
                  {loading === "reactiver" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                </Button>
              )}

              {/* More actions menu */}
              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 text-xs text-gray-500"
                  onClick={() => setMenuOpen(!menuOpen)}
                  disabled={loading !== null}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>

                {menuOpen && (
                  <>
                    {/* Backdrop to close menu */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                      <MenuButton
                        icon={<Edit3 className="w-3.5 h-3.5" />}
                        label="Éditer"
                        onClick={() => {
                          setEditing(true);
                          setMenuOpen(false);
                        }}
                      />
                      <MenuButton
                        icon={<RefreshCw className="w-3.5 h-3.5" />}
                        label="Régénérer code"
                        onClick={() => {
                          setMenuOpen(false);
                          handleAction("regenerer_code");
                        }}
                      />

                      {statut === "actif" && (
                        <MenuButton
                          icon={<Pause className="w-3.5 h-3.5" />}
                          label="Suspendre"
                          onClick={() => {
                            setMenuOpen(false);
                            handleAction("suspendre");
                          }}
                        />
                      )}
                      {statut === "suspendu" && (
                        <MenuButton
                          icon={<Play className="w-3.5 h-3.5" />}
                          label="Réactiver"
                          onClick={() => {
                            setMenuOpen(false);
                            handleAction("reactiver");
                          }}
                        />
                      )}
                      {(statut === "actif" || statut === "suspendu") && (
                        <MenuButton
                          icon={<Ban className="w-3.5 h-3.5" />}
                          label="Révoquer"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => {
                            handleConfirmAction(
                              "revoquer",
                              "Êtes-vous sûr de vouloir révoquer cet agent ? Il ne pourra plus accéder au système."
                            );
                          }}
                        />
                      )}

                      <div className="border-t border-gray-100 my-1" />

                      {statut !== "archive" && (
                        <MenuButton
                          icon={<Archive className="w-3.5 h-3.5" />}
                          label="Archiver"
                          className="text-gray-500 hover:bg-gray-50"
                          onClick={() => {
                            setMenuOpen(false);
                            handleAction("archiver");
                          }}
                        />
                      )}
                      <MenuButton
                        icon={<Trash2 className="w-3.5 h-3.5" />}
                        label="Supprimer"
                        className="text-red-600 hover:bg-red-50"
                        onClick={handleDelete}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors ${className}`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}
