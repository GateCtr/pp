"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Portal } from "@/components/ui/portal";
import { toast } from "sonner";
import {
  Loader2,
  MapPin,
  X,
  ChevronRight,
  Road,
  Trash2,
} from "lucide-react";

interface LieuGeo {
  id: string;
  nom: string;
  type: string;
}

interface Avenue {
  id: string;
  nom: string;
  quartierId: string;
}

interface Affectation {
  id: string;
  avenueId: string | null;
  avenueNom: string | null;
  quartierId: string | null;
  quartierNom: string | null;
}

interface Props {
  agentId: string;
  agentNom: string;
  onClose: () => void;
  onSaved: () => void;
}

export function AffectationModal({ agentId, agentNom, onClose, onSaved }: Props) {
  const [topLevel, setTopLevel] = useState<LieuGeo[]>([]);
  const [level2, setLevel2] = useState<LieuGeo[]>([]);
  const [level3, setLevel3] = useState<LieuGeo[]>([]);
  const [avenuesList, setAvenuesList] = useState<Avenue[]>([]);
  const [currentAffectations, setCurrentAffectations] = useState<Affectation[]>([]);

  const [sel1, setSel1] = useState<LieuGeo | null>(null);
  const [sel2, setSel2] = useState<LieuGeo | null>(null);
  const [sel3, setSel3] = useState<LieuGeo | null>(null);
  const [selAvenue, setSelAvenue] = useState<Avenue | null>(null);

  const [saving, setSaving] = useState(false);
  const [loadingAffectations, setLoadingAffectations] = useState(true);

  useEffect(() => {
    fetch("/api/geo").then(r => r.json()).then(setTopLevel);
    fetchCurrentAffectations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCurrentAffectations() {
    setLoadingAffectations(true);
    const res = await fetch(`/api/admin/agents/${agentId}/affectation`);
    const data = await res.json();
    setCurrentAffectations(data);
    setLoadingAffectations(false);
  }

  async function selectL1(lieu: LieuGeo) {
    setSel1(lieu); setSel2(null); setSel3(null); setSelAvenue(null);
    setLevel3([]); setAvenuesList([]);
    const res = await fetch(`/api/geo?parentId=${lieu.id}`);
    setLevel2(await res.json());
  }

  async function selectL2(lieu: LieuGeo) {
    setSel2(lieu); setSel3(null); setSelAvenue(null); setAvenuesList([]);
    const res = await fetch(`/api/geo?parentId=${lieu.id}`);
    setLevel3(await res.json());
  }

  async function selectL3(lieu: LieuGeo) {
    setSel3(lieu); setSelAvenue(null);
    const res = await fetch(`/api/geo?avenues=1&quartierId=${lieu.id}`);
    setAvenuesList(await res.json());
  }

  async function handleSave() {
    if (!selAvenue || !sel3) {
      toast.error("Sélectionnez une avenue");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/agents/${agentId}/affectation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avenueId: selAvenue.id,
          quartierId: sel3.id,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Affecté à ${selAvenue.nom}`);
      fetchCurrentAffectations();
      onSaved();
    } catch {
      toast.error("Erreur lors de l'affectation");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(affectationId: string) {
    if (!confirm("Retirer cette affectation ?")) return;
    await fetch(`/api/admin/agents/${agentId}/affectation?affectationId=${affectationId}`, {
      method: "DELETE",
    });
    toast.success("Affectation retirée");
    fetchCurrentAffectations();
    onSaved();
  }

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900">Affecter une zone</h3>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Agent : <strong>{agentNom}</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-5 space-y-5">
            {/* Current affectations */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Zones actuelles
              </p>
              {loadingAffectations ? (
                <div className="flex justify-center py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                </div>
              ) : currentAffectations.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">Aucune affectation active</p>
              ) : (
                <div className="space-y-1.5">
                  {currentAffectations.map((aff) => (
                    <div
                      key={aff.id}
                      className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg group"
                    >
                      <span className="text-xs text-blue-800 flex items-center gap-1.5">
                        <Road className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-gray-500">{aff.quartierNom}</span>
                        <ChevronRight className="w-3 h-3 text-gray-300" />
                        <strong>{aff.avenueNom}</strong>
                      </span>
                      <button
                        onClick={() => handleRemove(aff.id)}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Geographic tree selector */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Ajouter une nouvelle zone
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Level 1 */}
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase">Ville / Territoire</p>
                  <div className="border border-gray-100 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                    {topLevel.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => selectL1(l)}
                        className={`w-full text-left px-2.5 py-2 text-xs transition-colors ${
                          sel1?.id === l.id
                            ? "bg-blue-500 text-white"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {l.nom}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level 2 */}
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase">Commune / Secteur</p>
                  <div className="border border-gray-100 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                    {level2.length === 0 ? (
                      <div className="text-center py-4 text-gray-300 text-[10px]">
                        {sel1 ? "Aucune subdivision" : "—"}
                      </div>
                    ) : level2.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => selectL2(l)}
                        className={`w-full text-left px-2.5 py-2 text-xs transition-colors ${
                          sel2?.id === l.id
                            ? "bg-violet-500 text-white"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {l.nom}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level 3: Quartier */}
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase">Quartier</p>
                  <div className="border border-gray-100 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                    {level3.length === 0 ? (
                      <div className="text-center py-4 text-gray-300 text-[10px]">
                        {sel2 ? "Aucun quartier" : "—"}
                      </div>
                    ) : level3.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => selectL3(l)}
                        className={`w-full text-left px-2.5 py-2 text-xs transition-colors ${
                          sel3?.id === l.id
                            ? "bg-emerald-500 text-white"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {l.nom}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level 4: Avenue */}
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase">Avenue</p>
                  <div className="border border-gray-100 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                    {avenuesList.length === 0 ? (
                      <div className="text-center py-4 text-gray-300 text-[10px]">
                        {sel3 ? "Aucune avenue" : "—"}
                      </div>
                    ) : avenuesList.map((av) => (
                      <button
                        key={av.id}
                        onClick={() => setSelAvenue(av)}
                        className={`w-full text-left px-2.5 py-2 text-xs transition-colors ${
                          selAvenue?.id === av.id
                            ? "bg-orange-400 text-white"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {av.nom}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview */}
              {selAvenue && sel3 && (
                <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-100 rounded-xl flex items-center gap-3">
                  <Road className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{selAvenue.nom}</p>
                    <p className="text-[10px] text-gray-500">
                      {sel1?.nom} › {sel2?.nom} › {sel3.nom}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !selAvenue}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4 mr-2" />
              )}
              Affecter
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
