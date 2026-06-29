"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Printer, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Portal } from "@/components/ui/portal";
import type { Parcelle, VariantDesign } from "@/db/schema";

interface PlateTemplateData {
  id: string;
  nom: string;
  variants: string | VariantDesign[];
  flagUrl: string | null;
  sealUrl: string | null;
}

interface GeneratePlatesModalProps {
  parcelles: Parcelle[];
  onClose: () => void;
}

export function GeneratePlatesModal({ parcelles, onClose }: GeneratePlatesModalProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState<PlateTemplateData[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ generated: number; failed: number } | null>(null);

  const eligible = parcelles.filter(
    (p) => (p.variantIndex == null) && (p.templateId == null)
  );
  const alreadyAssigned = parcelles.filter(
    (p) => (p.variantIndex != null) || (p.templateId != null)
  );

  useEffect(() => {
    fetch("/api/plate-templates").then((r) => r.json()).then((data) => setTemplates(Array.isArray(data) ? data : [])).catch(() => toast.error("Erreur chargement templates")).finally(() => setLoadingTemplates(false));
  }, []);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const variants: VariantDesign[] = selectedTemplate ? (typeof selectedTemplate.variants === "string" ? JSON.parse(selectedTemplate.variants) : selectedTemplate.variants) : [];

  async function handleGenerate() {
    if (!selectedTemplateId || selectedVariantIdx === null) { toast.error("Sélectionnez un template et une variante"); return; }
    if (eligible.length === 0) { toast.error("Aucune parcelle éligible"); return; }
    setGenerating(true);
    try {
      const res = await fetch("/api/parcelles/generate-plates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ parcelleIds: eligible.map((p) => p.id), templateId: selectedTemplateId, variantIndex: selectedVariantIdx }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Erreur"); return; }
      setResult({ generated: data.generated, failed: data.failed });
      toast.success(`${data.generated} plaque(s) générée(s) !`);
      router.refresh();
    } catch { toast.error("Erreur de connexion"); }
    finally { setGenerating(false); }
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[99999]">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg my-auto animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Printer className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Générer les Plaques</h3>
                  <p className="text-xs text-gray-500">{eligible.length} parcelle(s) éligible(s)</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {alreadyAssigned.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800"><strong>{alreadyAssigned.length}</strong> parcelle(s) ont déjà une variante assignée (non modifiable).</p>
                </div>
              )}

              {result ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                  <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-emerald-800">{result.generated} plaque(s) générée(s)</p>
                  {result.failed > 0 && <p className="text-xs text-red-600 mt-1">{result.failed} échec(s)</p>}
                  <Button size="sm" className="mt-3" onClick={onClose}>Fermer</Button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">1. Choisir un template</p>
                    {loadingTemplates ? (
                      <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
                    ) : templates.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4 text-center">Aucun template. Créez-en un dans Plaques Templates.</p>
                    ) : (
                      <div className="space-y-2 max-h-[150px] overflow-y-auto">
                        {templates.map((t) => (
                          <Card key={t.id} className={`cursor-pointer border transition-all ${selectedTemplateId === t.id ? "border-blue-300 bg-blue-50/50 shadow-sm" : "border-gray-200 hover:border-gray-300"}`} onClick={() => { setSelectedTemplateId(t.id); setSelectedVariantIdx(null); }}>
                            <CardContent className="p-3 flex items-center gap-3">
                              {t.sealUrl && <div className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden flex-shrink-0">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={t.sealUrl} alt="" className="w-full h-full object-cover" /></div>}
                              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{t.nom}</p><p className="text-[10px] text-gray-400">{(typeof t.variants === "string" ? JSON.parse(t.variants) : t.variants).length} variante(s)</p></div>
                              {selectedTemplateId === t.id && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedTemplate && variants.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">2. Choisir une variante (non modifiable)</p>
                      <div className="flex flex-wrap gap-2">
                        {variants.map((v, i) => (
                          <button key={i} onClick={() => setSelectedVariantIdx(i)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${selectedVariantIdx === i ? "border-blue-300 bg-blue-50 shadow-sm" : "border-gray-200 hover:border-gray-300"}`}>
                            <div className="w-6 h-6 rounded border border-gray-200" style={{ backgroundColor: v.bgColor }} />
                            <span className="text-xs font-medium text-gray-700">{v.name}</span>
                            {selectedVariantIdx === i && <Check className="w-3 h-3 text-blue-600" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedVariantIdx !== null && (
                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="flex items-center justify-between text-xs"><span className="text-gray-600">Parcelles à générer :</span><Badge className="bg-blue-50 text-blue-700 border-blue-200 border">{eligible.length}</Badge></div>
                      <div className="flex items-center justify-between text-xs mt-1.5"><span className="text-gray-600">Template :</span><span className="font-medium text-gray-900">{selectedTemplate?.nom}</span></div>
                      <div className="flex items-center justify-between text-xs mt-1.5"><span className="text-gray-600">Variante :</span><div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded border border-gray-200" style={{ backgroundColor: variants[selectedVariantIdx]?.bgColor }} /><span className="font-medium text-gray-900">{variants[selectedVariantIdx]?.name}</span></div></div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <Button variant="outline" onClick={onClose} disabled={generating} className="flex-1 h-10">Annuler</Button>
                    <Button onClick={handleGenerate} disabled={generating || !selectedTemplateId || selectedVariantIdx === null || eligible.length === 0} className="flex-1 h-10 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md shadow-emerald-500/20">
                      {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Printer className="w-4 h-4 mr-2" />}
                      Générer {eligible.length} plaque(s)
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
