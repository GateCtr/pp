"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lock, ChevronRight } from "lucide-react";

interface LieuGeo { id: string; nom: string; type: string; }
interface Avenue { id: string; nom: string; quartierId: string; }

export interface GeoSelection {
  avenueId: string;
  avenueNom: string;
  quartierId: string;
  quartierNom: string;
  commune: string;
  secteur: string;
  quartier: string;
  avenue: string;
  district: string;
}

const LEAF = new Set(["quartier", "village"]);

function buildFields(
  sels: (LieuGeo | null)[],
  avenueNom: string
): Pick<GeoSelection, "commune" | "secteur" | "quartier" | "avenue" | "district"> {
  let district = "", commune = "", secteur = "", quartier = "";
  for (const s of sels) {
    if (!s) continue;
    if (s.type === "ville" || s.type === "territoire") district = s.nom;
    else if (s.type === "commune") commune = s.nom;
    else if (s.type === "secteur" || s.type === "chefferie" || s.type === "cite") secteur = s.nom;
    else if (s.type === "quartier" || s.type === "village") quartier = s.nom;
  }
  return { district, commune, secteur, quartier, avenue: avenueNom };
}

interface Props {
  onSelect: (sel: GeoSelection) => void;
  onClear: () => void;
  selected: GeoSelection | null;
}

export function GeoSelector({ onSelect, onClear, selected }: Props) {
  const [level1, setLevel1] = useState<LieuGeo[]>([]);
  const [level2, setLevel2] = useState<LieuGeo[]>([]);
  const [level3, setLevel3] = useState<LieuGeo[]>([]);
  const [level4, setLevel4] = useState<LieuGeo[]>([]);
  const [avenuesList, setAvenuesList] = useState<Avenue[]>([]);

  const [sel1, setSel1] = useState<LieuGeo | null>(null);
  const [sel2, setSel2] = useState<LieuGeo | null>(null);
  const [sel3, setSel3] = useState<LieuGeo | null>(null);
  const [sel4, setSel4] = useState<LieuGeo | null>(null);

  const [loadingN, setLoadingN] = useState<number | null>(null);

  useEffect(() => {
    setLoadingN(1);
    fetch("/api/geo").then(r => r.json()).then(d => {
      setLevel1(d);
      setLoadingN(null);
    });
  }, []);

  async function pick1(id: string) {
    const l = level1.find(x => x.id === id);
    if (!l) return;
    setSel1(l); setSel2(null); setSel3(null); setSel4(null);
    setLevel2([]); setLevel3([]); setLevel4([]); setAvenuesList([]);
    setLoadingN(2);
    const res = await fetch(`/api/geo?parentId=${l.id}`);
    setLevel2(await res.json());
    setLoadingN(null);
  }

  async function pick2(id: string) {
    const l = level2.find(x => x.id === id);
    if (!l) return;
    setSel2(l); setSel3(null); setSel4(null);
    setLevel3([]); setLevel4([]); setAvenuesList([]);
    setLoadingN(3);
    const res = await fetch(`/api/geo?parentId=${l.id}`);
    setLevel3(await res.json());
    setLoadingN(null);
  }

  async function pick3(id: string) {
    const l = level3.find(x => x.id === id);
    if (!l) return;
    setSel3(l); setSel4(null); setLevel4([]); setAvenuesList([]);
    if (LEAF.has(l.type)) {
      setLoadingN(5);
      const res = await fetch(`/api/geo?avenues=1&quartierId=${l.id}`);
      setAvenuesList(await res.json());
    } else {
      setLoadingN(4);
      const res = await fetch(`/api/geo?parentId=${l.id}`);
      setLevel4(await res.json());
    }
    setLoadingN(null);
  }

  async function pick4(id: string) {
    const l = level4.find(x => x.id === id);
    if (!l) return;
    setSel4(l); setAvenuesList([]);
    setLoadingN(5);
    const res = await fetch(`/api/geo?avenues=1&quartierId=${l.id}`);
    setAvenuesList(await res.json());
    setLoadingN(null);
  }

  function pickAvenue(id: string) {
    const av = avenuesList.find(x => x.id === id);
    if (!av) return;
    const leafNode = (sel4 && LEAF.has(sel4.type) ? sel4 : null)
      ?? (sel3 && LEAF.has(sel3.type) ? sel3 : null);
    if (!leafNode) return;
    const fields = buildFields([sel1, sel2, sel3, sel4], av.nom);
    onSelect({
      avenueId: av.id,
      avenueNom: av.nom,
      quartierId: leafNode.id,
      quartierNom: leafNode.nom,
      ...fields,
    });
  }

  if (selected) {
    return (
      <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            Localisation sélectionnée dans l&apos;arbre géographique
          </div>
          <button onClick={onClear} className="text-xs text-blue-500 hover:underline">
            Modifier
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600">
          {selected.district && (
            <>
              <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-medium">{selected.district}</span>
              <ChevronRight className="w-3 h-3 text-gray-300" />
            </>
          )}
          {selected.secteur && (
            <>
              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">{selected.secteur}</span>
              <ChevronRight className="w-3 h-3 text-gray-300" />
            </>
          )}
          {selected.commune && (
            <>
              <span className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 font-medium">{selected.commune}</span>
              <ChevronRight className="w-3 h-3 text-gray-300" />
            </>
          )}
          {selected.quartier && (
            <>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">Q/{selected.quartier}</span>
              <ChevronRight className="w-3 h-3 text-gray-300" />
            </>
          )}
          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">{selected.avenue}</span>
        </div>
      </div>
    );
  }

  const leafNode = (sel4 && LEAF.has(sel4.type) ? sel4 : null)
    ?? (sel3 && LEAF.has(sel3.type) ? sel3 : null);
  const showAvenues = leafNode !== null;
  const noAvenues = showAvenues && avenuesList.length === 0 && loadingN !== 5;

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 italic">
        Naviguez dans l&apos;arbre géographique pour sélectionner l&apos;avenue de la parcelle
      </p>

      <div className="space-y-1">
        <Label className="text-xs text-gray-500">Ville / Territoire</Label>
        <Select onValueChange={pick1} value={sel1?.id ?? ""}>
          <SelectTrigger className="h-11 bg-gray-50/50">
            <SelectValue placeholder={loadingN === 1 ? "Chargement…" : "Sélectionner…"} />
          </SelectTrigger>
          <SelectContent>
            {level1.map(l => <SelectItem key={l.id} value={l.id}>{l.nom}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {sel1 && (
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Subdivision</Label>
          <Select onValueChange={pick2} value={sel2?.id ?? ""} disabled={loadingN === 2}>
            <SelectTrigger className="h-11 bg-gray-50/50">
              <SelectValue placeholder={loadingN === 2 ? "Chargement…" : level2.length === 0 ? "Aucune subdivision" : "Sélectionner…"} />
            </SelectTrigger>
            <SelectContent>
              {level2.map(l => <SelectItem key={l.id} value={l.id}>{l.nom}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {sel2 && level3.length > 0 && (
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Niveau suivant</Label>
          <Select onValueChange={pick3} value={sel3?.id ?? ""} disabled={loadingN === 3}>
            <SelectTrigger className="h-11 bg-gray-50/50">
              <SelectValue placeholder={loadingN === 3 ? "Chargement…" : "Sélectionner…"} />
            </SelectTrigger>
            <SelectContent>
              {level3.map(l => <SelectItem key={l.id} value={l.id}>{l.nom}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {sel3 && level4.length > 0 && (
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Quartier / Village</Label>
          <Select onValueChange={pick4} value={sel4?.id ?? ""} disabled={loadingN === 4}>
            <SelectTrigger className="h-11 bg-gray-50/50">
              <SelectValue placeholder={loadingN === 4 ? "Chargement…" : "Sélectionner…"} />
            </SelectTrigger>
            <SelectContent>
              {level4.map(l => <SelectItem key={l.id} value={l.id}>{l.nom}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {showAvenues && !noAvenues && (
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Avenue / Rue <span className="text-red-400">*</span></Label>
          <Select onValueChange={pickAvenue} disabled={loadingN === 5}>
            <SelectTrigger className="h-11 bg-gray-50/50">
              <SelectValue placeholder={loadingN === 5 ? "Chargement…" : "Sélectionner l'avenue…"} />
            </SelectTrigger>
            <SelectContent>
              {avenuesList.map(av => <SelectItem key={av.id} value={av.id}>{av.nom}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {noAvenues && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 p-2.5 rounded-lg">
          Aucune avenue enregistrée pour ce quartier. Contactez votre administrateur.
        </p>
      )}
    </div>
  );
}
