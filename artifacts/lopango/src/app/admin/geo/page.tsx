"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ChevronRight,
  Plus,
  Map,
  Building2,
  Loader2,
  FolderTree,
  Road,
  X,
} from "lucide-react";

interface LieuGeo {
  id: string;
  nom: string;
  type: string;
  parentId: string | null;
  code: string | null;
  actif: boolean;
}

interface Avenue {
  id: string;
  nom: string;
  quartierId: string;
  actif: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  ville: "Ville",
  territoire: "Territoire",
  commune: "Commune",
  secteur: "Secteur",
  chefferie: "Chefferie",
  cite: "Cité",
  quartier: "Quartier",
  village: "Village",
};

const TYPE_COLORS: Record<string, string> = {
  ville: "bg-blue-100 text-blue-700",
  territoire: "bg-indigo-100 text-indigo-700",
  commune: "bg-violet-100 text-violet-700",
  secteur: "bg-purple-100 text-purple-700",
  chefferie: "bg-pink-100 text-pink-700",
  cite: "bg-orange-100 text-orange-700",
  quartier: "bg-emerald-100 text-emerald-700",
  village: "bg-teal-100 text-teal-700",
};

const CHILD_TYPES: Record<string, string[]> = {
  ville: ["commune"],
  territoire: ["secteur", "chefferie", "cite"],
  commune: ["quartier"],
  secteur: ["quartier", "village"],
  chefferie: ["quartier", "village"],
  cite: ["quartier"],
  quartier: [],
  village: [],
};

export default function AdminGeoPage() {
  const [topLevel, setTopLevel] = useState<LieuGeo[]>([]);
  const [children, setChildren] = useState<LieuGeo[]>([]);
  const [grandchildren, setGrandchildren] = useState<LieuGeo[]>([]);
  const [avenues, setAvenues] = useState<Avenue[]>([]);
  const [selected, setSelected] = useState<LieuGeo | null>(null);
  const [selectedChild, setSelectedChild] = useState<LieuGeo | null>(null);
  const [selectedGrandchild, setSelectedGrandchild] = useState<LieuGeo | null>(null);

  const [showAddLieu, setShowAddLieu] = useState(false);
  const [showAddAvenue, setShowAddAvenue] = useState(false);
  const [addParent, setAddParent] = useState<LieuGeo | null>(null);
  const [newNom, setNewNom] = useState("");
  const [newType, setNewType] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newAvenueNom, setNewAvenueNom] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTopLevel = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/geo");
    const data = await res.json();
    setTopLevel(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTopLevel(); }, [fetchTopLevel]);

  async function fetchChildren(lieu: LieuGeo) {
    const res = await fetch(`/api/geo?parentId=${lieu.id}`);
    const data = await res.json();
    setChildren(data);
    setGrandchildren([]);
    setAvenues([]);
    setSelectedChild(null);
    setSelectedGrandchild(null);
  }

  async function fetchGrandchildren(lieu: LieuGeo) {
    if (lieu.type === "quartier" || lieu.type === "village") {
      // Fetch avenues instead
      const res = await fetch(`/api/geo?avenues=1&quartierId=${lieu.id}`);
      const data = await res.json();
      setAvenues(data);
      setGrandchildren([]);
    } else {
      const res = await fetch(`/api/geo?parentId=${lieu.id}`);
      const data = await res.json();
      setGrandchildren(data);
      setAvenues([]);
    }
  }

  function openAddLieu(parent: LieuGeo | null) {
    setAddParent(parent);
    const childTypes = parent ? CHILD_TYPES[parent.type] ?? [] : [];
    setNewType(parent ? (childTypes[0] ?? "") : "ville");
    setNewNom("");
    setNewCode("");
    setShowAddLieu(true);
    setShowAddAvenue(false);
  }

  function openAddAvenue(quartier: LieuGeo) {
    setSelectedGrandchild(quartier);
    setNewAvenueNom("");
    setShowAddAvenue(true);
    setShowAddLieu(false);
  }

  async function handleAddLieu() {
    if (!newNom.trim() || !newType) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/geo/lieux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: newNom,
          type: newType,
          parentId: addParent?.id ?? null,
          code: newCode || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${TYPE_LABELS[newType] || newType} ajouté(e)`);
      setShowAddLieu(false);
      setNewNom("");
      // Refresh relevant list
      if (!addParent) {
        fetchTopLevel();
      } else if (addParent.id === selected?.id) {
        fetchChildren(selected);
      } else if (addParent.id === selectedChild?.id) {
        fetchGrandchildren(selectedChild);
      }
    } catch {
      toast.error("Erreur lors de l'ajout");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddAvenue() {
    if (!newAvenueNom.trim() || !selectedGrandchild) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/geo/avenues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: newAvenueNom,
          quartierId: selectedGrandchild.id,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Avenue ajoutée");
      setShowAddAvenue(false);
      setNewAvenueNom("");
      fetchGrandchildren(selectedGrandchild);
    } catch {
      toast.error("Erreur lors de l'ajout");
    } finally {
      setSaving(false);
    }
  }

  async function deleteLieu(lieu: LieuGeo) {
    if (!confirm(`Désactiver "${lieu.nom}" ?`)) return;
    await fetch(`/api/admin/geo/lieux?id=${lieu.id}`, { method: "DELETE" });
    toast.success("Lieu désactivé");
    fetchTopLevel();
  }

  async function deleteAvenue(av: Avenue) {
    if (!confirm(`Désactiver "${av.nom}" ?`)) return;
    await fetch(`/api/admin/geo/avenues?id=${av.id}`, { method: "DELETE" });
    toast.success("Avenue désactivée");
    if (selectedGrandchild) fetchGrandchildren(selectedGrandchild);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>Province du Kongo Central</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600 font-medium">Hiérarchie géographique</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Géographie</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Gérez les villes, territoires, communes, quartiers et avenues du Kongo Central
          </p>
        </div>
        <Button
          onClick={() => openAddLieu(null)}
          className="h-10 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-medium shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {/* Add form */}
      {showAddLieu && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-blue-800">
              {addParent ? `Ajouter sous "${addParent.nom}"` : "Ajouter une ville ou territoire"}
            </p>
            <button onClick={() => setShowAddLieu(false)} className="text-blue-400 hover:text-blue-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger className="h-9 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(addParent ? CHILD_TYPES[addParent.type] ?? [] : ["ville", "territoire"]).map((t) => (
                    <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nom <span className="text-red-400">*</span></Label>
              <Input
                value={newNom}
                onChange={(e) => setNewNom(e.target.value)}
                placeholder="ex: Ngaliema"
                className="h-9 bg-white"
                onKeyDown={(e) => e.key === "Enter" && handleAddLieu()}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Code (optionnel)</Label>
              <Input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="ex: NGA"
                className="h-9 bg-white"
              />
            </div>
          </div>
          <Button size="sm" onClick={handleAddLieu} disabled={saving || !newNom.trim()}>
            {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />}
            Enregistrer
          </Button>
        </div>
      )}

      {showAddAvenue && selectedGrandchild && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-emerald-800">
              Ajouter une avenue dans &ldquo;{selectedGrandchild.nom}&rdquo;
            </p>
            <button onClick={() => setShowAddAvenue(false)} className="text-emerald-400 hover:text-emerald-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-3">
            <Input
              value={newAvenueNom}
              onChange={(e) => setNewAvenueNom(e.target.value)}
              placeholder="ex: Avenue de l'Indépendance"
              className="h-9 bg-white flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleAddAvenue()}
            />
            <Button size="sm" onClick={handleAddAvenue} disabled={saving || !newAvenueNom.trim()}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Ajouter
            </Button>
          </div>
        </div>
      )}

      {/* 3-column tree browser */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: Villes & Territoires */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-700">Villes & Territoires</span>
            </div>
            <button
              onClick={() => openAddLieu(null)}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-gray-50 max-h-[50vh] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
              </div>
            ) : topLevel.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Aucun lieu — cliquez + pour ajouter
              </div>
            ) : (
              topLevel.map((lieu) => (
                <button
                  key={lieu.id}
                  onClick={() => { setSelected(lieu); fetchChildren(lieu); }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-colors group ${
                    selected?.id === lieu.id
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${TYPE_COLORS[lieu.type]}`}>
                      {TYPE_LABELS[lieu.type]}
                    </span>
                    <span className="truncate font-medium">{lieu.nom}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${selected?.id === lieu.id ? "text-blue-400 rotate-90" : "text-gray-300 group-hover:text-gray-400"}`} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Communes / Secteurs */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-semibold text-gray-700">Communes / Secteurs</span>
            </div>
            {selected && (
              <button
                onClick={() => openAddLieu(selected)}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-violet-50 text-gray-400 hover:text-violet-500 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-50 max-h-[50vh] overflow-y-auto">
            {!selected ? (
              <div className="text-center py-8 text-gray-300 text-sm">
                Sélectionnez une ville ou territoire
              </div>
            ) : children.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Aucune subdivision
                <br />
                <button onClick={() => openAddLieu(selected)} className="text-violet-500 hover:underline mt-1 text-xs">
                  + Ajouter
                </button>
              </div>
            ) : (
              children.map((lieu) => (
                <button
                  key={lieu.id}
                  onClick={() => { setSelectedChild(lieu); setSelectedGrandchild(null); setAvenues([]); fetchGrandchildren(lieu); }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-colors group ${
                    selectedChild?.id === lieu.id
                      ? "bg-violet-50 text-violet-700"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${TYPE_COLORS[lieu.type]}`}>
                      {TYPE_LABELS[lieu.type]}
                    </span>
                    <span className="truncate font-medium">{lieu.nom}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${selectedChild?.id === lieu.id ? "text-violet-400 rotate-90" : "text-gray-300 group-hover:text-gray-400"}`} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Quartiers / Avenues */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-gray-700">Quartiers / Avenues</span>
            </div>
            {selectedChild && (
              <button
                onClick={() => openAddLieu(selectedChild)}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-emerald-50 text-gray-400 hover:text-emerald-500 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-50 max-h-[50vh] overflow-y-auto">
            {!selectedChild ? (
              <div className="text-center py-8 text-gray-300 text-sm">
                Sélectionnez une commune ou secteur
              </div>
            ) : grandchildren.length === 0 && avenues.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Aucun quartier
                <br />
                <button onClick={() => openAddLieu(selectedChild)} className="text-emerald-500 hover:underline mt-1 text-xs">
                  + Ajouter un quartier
                </button>
              </div>
            ) : (
              <>
                {grandchildren.map((lieu) => (
                  <div key={lieu.id} className="group">
                    <div
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                        selectedGrandchild?.id === lieu.id
                          ? "bg-emerald-50 text-emerald-700"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                      onClick={() => { setSelectedGrandchild(lieu); openAddAvenue(lieu); fetchGrandchildren(lieu); }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${TYPE_COLORS[lieu.type]}`}>
                          {TYPE_LABELS[lieu.type]}
                        </span>
                        <span className="truncate font-medium text-sm">{lieu.nom}</span>
                      </div>
                      <Road className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-400 flex-shrink-0" />
                    </div>
                  </div>
                ))}

                {/* Avenues list (shown when a quartier is selected) */}
                {avenues.length > 0 && (
                  <div className="bg-gray-50/50 px-4 py-2">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Avenues ({avenues.length})
                    </p>
                    <div className="space-y-1">
                      {avenues.map((av) => (
                        <div key={av.id} className="flex items-center justify-between group py-1">
                          <span className="text-xs text-gray-600 flex items-center gap-1.5">
                            <Road className="w-3 h-3 text-gray-400" />
                            {av.nom}
                          </span>
                          <button
                            onClick={() => deleteAvenue(av)}
                            className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {selectedGrandchild && (
                      <button
                        onClick={() => { setNewAvenueNom(""); setShowAddAvenue(true); setShowAddLieu(false); }}
                        className="mt-2 text-xs text-emerald-500 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Ajouter une avenue
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Badge variant="outline" className="text-xs gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
          2 Villes
        </Badge>
        <Badge variant="outline" className="text-xs gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
          10 Territoires
        </Badge>
        <Badge variant="outline" className="text-xs gap-1.5">
          <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
          Communes &amp; Secteurs
        </Badge>
        <Badge variant="outline" className="text-xs gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          Quartiers &amp; Avenues
        </Badge>
      </div>
    </div>
  );
}
