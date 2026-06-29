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
  Layers,
  Search,
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
  territoire: ["commune", "secteur", "chefferie", "cite"],
  commune: ["quartier"],
  secteur: ["commune", "quartier", "village"],
  chefferie: ["commune", "quartier", "village"],
  cite: ["quartier"],
  quartier: [],
  village: [],
};

const LEAF = new Set(["quartier", "village"]);

export default function AdminGeoPage() {
  const [level1, setLevel1] = useState<LieuGeo[]>([]);
  const [level2, setLevel2] = useState<LieuGeo[]>([]);
  const [level3, setLevel3] = useState<LieuGeo[]>([]);
  const [level4, setLevel4] = useState<LieuGeo[]>([]);
  const [avenues, setAvenues] = useState<Avenue[]>([]);

  const [sel1, setSel1] = useState<LieuGeo | null>(null);
  const [sel2, setSel2] = useState<LieuGeo | null>(null);
  const [sel3, setSel3] = useState<LieuGeo | null>(null);
  const [sel4, setSel4] = useState<LieuGeo | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LieuGeo[]>([]);
  const [searching, setSearching] = useState(false);

  const [showAddLieu, setShowAddLieu] = useState(false);
  const [showAddAvenue, setShowAddAvenue] = useState(false);
  const [addParent, setAddParent] = useState<LieuGeo | null>(null);
  const [newNom, setNewNom] = useState("");
  const [newType, setNewType] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newAvenueNom, setNewAvenueNom] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLevel1 = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/geo");
    setLevel1(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchLevel1(); }, [fetchLevel1]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/geo?search=${encodeURIComponent(searchQuery.trim())}`);
        setSearchResults(await res.json());
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const refreshLevel2 = useCallback(async (parent: LieuGeo) => {
    const res = await fetch(`/api/geo?parentId=${parent.id}`);
    setLevel2(await res.json());
  }, []);

  const refreshLevel3 = useCallback(async (parent: LieuGeo) => {
    const res = await fetch(`/api/geo?parentId=${parent.id}`);
    setLevel3(await res.json());
  }, []);

  const refreshLevel4 = useCallback(async (parent: LieuGeo) => {
    if (LEAF.has(parent.type)) {
      const res = await fetch(`/api/geo?avenues=1&quartierId=${parent.id}`);
      setAvenues(await res.json());
      setLevel4([]);
    } else {
      const res = await fetch(`/api/geo?parentId=${parent.id}`);
      setLevel4(await res.json());
    }
  }, []);

  const refreshAvenues = useCallback(async (quartier: LieuGeo) => {
    const res = await fetch(`/api/geo?avenues=1&quartierId=${quartier.id}`);
    setAvenues(await res.json());
  }, []);

  async function pickLevel1(lieu: LieuGeo) {
    setSel1(lieu); setSel2(null); setSel3(null); setSel4(null);
    setLevel2([]); setLevel3([]); setLevel4([]); setAvenues([]);
    const res = await fetch(`/api/geo?parentId=${lieu.id}`);
    setLevel2(await res.json());
  }

  async function pickLevel2(lieu: LieuGeo) {
    setSel2(lieu); setSel3(null); setSel4(null);
    setLevel3([]); setLevel4([]); setAvenues([]);
    const res = await fetch(`/api/geo?parentId=${lieu.id}`);
    setLevel3(await res.json());
  }

  async function pickLevel3(lieu: LieuGeo) {
    setSel3(lieu); setSel4(null); setLevel4([]); setAvenues([]);
    if (LEAF.has(lieu.type)) {
      const res = await fetch(`/api/geo?avenues=1&quartierId=${lieu.id}`);
      setAvenues(await res.json());
    } else {
      const res = await fetch(`/api/geo?parentId=${lieu.id}`);
      setLevel4(await res.json());
    }
  }

  async function pickLevel4(lieu: LieuGeo) {
    setSel4(lieu);
    setAvenues([]);
    if (LEAF.has(lieu.type)) {
      const res = await fetch(`/api/geo?avenues=1&quartierId=${lieu.id}`);
      setAvenues(await res.json());
      setShowAddAvenue(true);
      setShowAddLieu(false);
      setNewAvenueNom("");
    }
  }

  function openAddLieu(parent: LieuGeo | null) {
    setAddParent(parent);
    const childTypes = parent ? CHILD_TYPES[parent.type] ?? [] : [];
    setNewType(parent ? (childTypes[0] ?? "") : "ville");
    setNewNom(""); setNewCode("");
    setShowAddLieu(true); setShowAddAvenue(false);
  }

  function openAddAvenue(quartier: LieuGeo) {
    setSel4(quartier);
    setNewAvenueNom("");
    setShowAddAvenue(true); setShowAddLieu(false);
  }

  async function handleAddLieu() {
    if (!newNom.trim() || !newType) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/geo/lieux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: newNom, type: newType, parentId: addParent?.id ?? null, code: newCode || null }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${TYPE_LABELS[newType] || newType} ajouté(e)`);
      setShowAddLieu(false); setNewNom("");
      if (!addParent) fetchLevel1();
      else if (addParent.id === sel1?.id) refreshLevel2(sel1);
      else if (addParent.id === sel2?.id) refreshLevel3(sel2);
      else if (addParent.id === sel3?.id) refreshLevel4(sel3);
    } catch {
      toast.error("Erreur lors de l'ajout");
    } finally { setSaving(false); }
  }

  async function handleAddAvenue() {
    const quartier = (sel4 && LEAF.has(sel4.type) ? sel4 : null)
      ?? (sel3 && LEAF.has(sel3.type) ? sel3 : null);
    if (!newAvenueNom.trim() || !quartier) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/geo/avenues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: newAvenueNom, quartierId: quartier.id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Avenue ajoutée");
      setShowAddAvenue(false); setNewAvenueNom("");
      refreshAvenues(quartier);
    } catch {
      toast.error("Erreur lors de l'ajout");
    } finally { setSaving(false); }
  }

  async function deleteLieu(lieu: LieuGeo) {
    if (!confirm(`Désactiver "${lieu.nom}" ?`)) return;
    await fetch(`/api/admin/geo/lieux?id=${lieu.id}`, { method: "DELETE" });
    toast.success("Lieu désactivé");
    fetchLevel1();
    setSel1(null); setSel2(null); setSel3(null); setSel4(null);
    setLevel2([]); setLevel3([]); setLevel4([]); setAvenues([]);
  }

  async function deleteAvenue(av: Avenue) {
    if (!confirm(`Désactiver "${av.nom}" ?`)) return;
    await fetch(`/api/admin/geo/avenues?id=${av.id}`, { method: "DELETE" });
    toast.success("Avenue désactivée");
    const quartier = (sel4 && LEAF.has(sel4.type) ? sel4 : null)
      ?? (sel3 && LEAF.has(sel3.type) ? sel3 : null);
    if (quartier) refreshAvenues(quartier);
  }

  const activeQuartier = (sel4 && LEAF.has(sel4.type) ? sel4 : null)
    ?? (sel3 && LEAF.has(sel3.type) ? sel3 : null);

  const showCol4 = sel3 !== null;

  const col4IsAvenues = sel3 !== null && LEAF.has(sel3.type);

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
            Gérez les villes, territoires, communes, secteurs, quartiers et avenues
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

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
        {searchQuery && !searching && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une commune, secteur, quartier, avenue… (min. 2 caractères)"
          className="pl-9 h-10 bg-white"
        />
      </div>

      {/* Search results */}
      {searchQuery.trim().length >= 2 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {searching ? "Recherche…" : `${searchResults.length} résultat${searchResults.length !== 1 ? "s" : ""} pour « ${searchQuery} »`}
            </span>
            {searchResults.length > 0 && (
              <button onClick={() => setSearchQuery("")} className="text-xs text-blue-500 hover:underline">Fermer</button>
            )}
          </div>
          {searchResults.length === 0 && !searching ? (
            <div className="text-center py-6 text-gray-400 text-sm">Aucun lieu trouvé</div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {searchResults.map((lieu) => (
                <div
                  key={lieu.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer group"
                  onClick={() => setSearchQuery("")}
                >
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${TYPE_COLORS[lieu.type]}`}>
                    {TYPE_LABELS[lieu.type]}
                  </span>
                  <span className="text-sm font-medium text-gray-800 truncate">{lieu.nom}</span>
                  {lieu.code && (
                    <span className="text-[10px] text-gray-400 font-mono">{lieu.code}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add lieu form */}
      {showAddLieu && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
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
                placeholder="ex: Kisantu"
                className="h-9 bg-white"
                onKeyDown={(e) => e.key === "Enter" && handleAddLieu()}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Code (optionnel)</Label>
              <Input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="ex: KIS"
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

      {/* Add avenue form */}
      {showAddAvenue && activeQuartier && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-emerald-800">
              Ajouter une avenue dans &ldquo;{activeQuartier.nom}&rdquo;
            </p>
            <button onClick={() => setShowAddAvenue(false)} className="text-emerald-400 hover:text-emerald-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-3">
            <Input
              value={newAvenueNom}
              onChange={(e) => setNewAvenueNom(e.target.value)}
              placeholder="ex: Avenue Kingoma"
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

      {/* Breadcrumb path */}
      {sel1 && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 flex-wrap">
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_COLORS[sel1.type]}`}>{TYPE_LABELS[sel1.type]}</span>
          <span className="font-medium text-gray-700">{sel1.nom}</span>
          {sel2 && (<><ChevronRight className="w-3 h-3 text-gray-300" /><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_COLORS[sel2.type]}`}>{TYPE_LABELS[sel2.type]}</span><span className="font-medium text-gray-700">{sel2.nom}</span></>)}
          {sel3 && (<><ChevronRight className="w-3 h-3 text-gray-300" /><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_COLORS[sel3.type]}`}>{TYPE_LABELS[sel3.type]}</span><span className="font-medium text-gray-700">{sel3.nom}</span></>)}
          {sel4 && (<><ChevronRight className="w-3 h-3 text-gray-300" /><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_COLORS[sel4.type]}`}>{TYPE_LABELS[sel4.type]}</span><span className="font-medium text-gray-700">{sel4.nom}</span></>)}
        </div>
      )}

      {/* Column browser — scroll horizontally when 4 columns */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className={`grid gap-4 min-w-0 ${showCol4 ? "grid-cols-4" : "grid-cols-3"}`} style={{ minWidth: showCol4 ? "800px" : undefined }}>

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
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-300" /></div>
              ) : level1.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">Aucun lieu — cliquez + pour ajouter</div>
              ) : level1.map((lieu) => (
                <button
                  key={lieu.id}
                  onClick={() => pickLevel1(lieu)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-colors group ${
                    sel1?.id === lieu.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${TYPE_COLORS[lieu.type]}`}>
                      {TYPE_LABELS[lieu.type]}
                    </span>
                    <span className="truncate font-medium">{lieu.nom}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${sel1?.id === lieu.id ? "text-blue-400 rotate-90" : "text-gray-300 group-hover:text-gray-400"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Subdivisions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-semibold text-gray-700">
                  {sel1 ? `Subdivisions de ${sel1.nom}` : "Subdivisions"}
                </span>
              </div>
              {sel1 && (
                <button
                  onClick={() => openAddLieu(sel1)}
                  className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-violet-50 text-gray-400 hover:text-violet-500 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="divide-y divide-gray-50 max-h-[50vh] overflow-y-auto">
              {!sel1 ? (
                <div className="text-center py-8 text-gray-300 text-sm">Sélectionnez une ville ou territoire</div>
              ) : level2.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Aucune subdivision
                  <br />
                  <button onClick={() => openAddLieu(sel1)} className="text-violet-500 hover:underline mt-1 text-xs">+ Ajouter</button>
                </div>
              ) : level2.map((lieu) => (
                <button
                  key={lieu.id}
                  onClick={() => pickLevel2(lieu)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-colors group ${
                    sel2?.id === lieu.id ? "bg-violet-50 text-violet-700" : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${TYPE_COLORS[lieu.type]}`}>
                      {TYPE_LABELS[lieu.type]}
                    </span>
                    <span className="truncate font-medium">{lieu.nom}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${sel2?.id === lieu.id ? "text-violet-400 rotate-90" : "text-gray-300 group-hover:text-gray-400"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Column 3: Sub-subdivisions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-semibold text-gray-700">
                  {sel2 ? `Contenu de ${sel2.nom}` : "Contenu"}
                </span>
              </div>
              {sel2 && (
                <button
                  onClick={() => openAddLieu(sel2)}
                  className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-purple-50 text-gray-400 hover:text-purple-500 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="divide-y divide-gray-50 max-h-[50vh] overflow-y-auto">
              {!sel2 ? (
                <div className="text-center py-8 text-gray-300 text-sm">Sélectionnez une subdivision</div>
              ) : level3.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Aucun contenu
                  <br />
                  <button onClick={() => openAddLieu(sel2)} className="text-purple-500 hover:underline mt-1 text-xs">+ Ajouter</button>
                </div>
              ) : level3.map((lieu) => (
                <button
                  key={lieu.id}
                  onClick={() => pickLevel3(lieu)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-colors group ${
                    sel3?.id === lieu.id
                      ? LEAF.has(lieu.type) ? "bg-emerald-50 text-emerald-700" : "bg-purple-50 text-purple-700"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${TYPE_COLORS[lieu.type]}`}>
                      {TYPE_LABELS[lieu.type]}
                    </span>
                    <span className="truncate font-medium">{lieu.nom}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${sel3?.id === lieu.id ? "text-purple-400 rotate-90" : "text-gray-300 group-hover:text-gray-400"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Column 4: Quartiers / Avenues (conditional) */}
          {showCol4 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  {col4IsAvenues
                    ? <Road className="w-4 h-4 text-emerald-500" />
                    : <FolderTree className="w-4 h-4 text-emerald-500" />
                  }
                  <span className="text-sm font-semibold text-gray-700">
                    {col4IsAvenues
                      ? `Avenues de ${sel3?.nom}`
                      : `Quartiers de ${sel3?.nom}`}
                  </span>
                </div>
                {sel3 && (
                  <button
                    onClick={() => col4IsAvenues ? openAddAvenue(sel3!) : openAddLieu(sel3!)}
                    className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-emerald-50 text-gray-400 hover:text-emerald-500 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="divide-y divide-gray-50 max-h-[50vh] overflow-y-auto">
                {/* Avenues directly (when sel3 is a quartier/village) */}
                {col4IsAvenues ? (
                  avenues.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      Aucune avenue
                      <br />
                      <button onClick={() => openAddAvenue(sel3!)} className="text-emerald-500 hover:underline mt-1 text-xs">+ Ajouter une avenue</button>
                    </div>
                  ) : (
                    <div className="px-4 py-3 space-y-1">
                      {avenues.map((av) => (
                        <div key={av.id} className="flex items-center justify-between group py-1.5">
                          <span className="text-sm text-gray-600 flex items-center gap-2">
                            <Road className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
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
                      <button
                        onClick={() => openAddAvenue(sel3!)}
                        className="mt-2 text-xs text-emerald-500 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Ajouter une avenue
                      </button>
                    </div>
                  )
                ) : (
                  /* Quartiers/communes (when sel3 is commune/secteur/etc.) */
                  level4.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      Aucun quartier
                      <br />
                      <button onClick={() => openAddLieu(sel3!)} className="text-emerald-500 hover:underline mt-1 text-xs">+ Ajouter</button>
                    </div>
                  ) : (
                    <>
                      {level4.map((lieu) => (
                        <div key={lieu.id}>
                          <div
                            className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors group text-sm ${
                              sel4?.id === lieu.id ? "bg-emerald-50 text-emerald-700" : "hover:bg-gray-50 text-gray-700"
                            }`}
                            onClick={() => pickLevel4(lieu)}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${TYPE_COLORS[lieu.type]}`}>
                                {TYPE_LABELS[lieu.type]}
                              </span>
                              <span className="truncate font-medium">{lieu.nom}</span>
                            </div>
                            <Road className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-400 flex-shrink-0" />
                          </div>
                          {/* Avenues inline when this quartier is selected */}
                          {sel4?.id === lieu.id && avenues.length > 0 && (
                            <div className="bg-gray-50/60 px-4 py-2 border-t border-gray-50">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                                Avenues ({avenues.length})
                              </p>
                              <div className="space-y-1">
                                {avenues.map((av) => (
                                  <div key={av.id} className="flex items-center justify-between group py-1">
                                    <span className="text-xs text-gray-600 flex items-center gap-1.5">
                                      <Road className="w-3 h-3 text-gray-400" />{av.nom}
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
                              <button
                                onClick={() => { setShowAddAvenue(true); setShowAddLieu(false); setNewAvenueNom(""); }}
                                className="mt-2 text-xs text-emerald-500 hover:underline flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" /> Ajouter une avenue
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Badge variant="outline" className="text-xs gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
          Villes
        </Badge>
        <Badge variant="outline" className="text-xs gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
          Territoires
        </Badge>
        <Badge variant="outline" className="text-xs gap-1.5">
          <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
          Communes
        </Badge>
        <Badge variant="outline" className="text-xs gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
          Secteurs
        </Badge>
        <Badge variant="outline" className="text-xs gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          Quartiers &amp; Avenues
        </Badge>
      </div>
    </div>
  );
}
