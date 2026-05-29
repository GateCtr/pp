"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Trash2, Save, X, Loader2, Upload, Palette,
  Edit3, Eye, Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Portal } from "@/components/ui/portal";
import type { PlateTemplate, VariantDesign } from "@/db/schema";


const DEFAULT_VARIANT: VariantDesign = {
  name: "Variante 1",
  bgColor: "#1a3a7a",
  borderColor: "#ffffff",
  textColor: "#ffffff",
  accentColor: "#87CEEB",
  fontFamily: "Arial, sans-serif",
  shape: "rounded",
};

const FONT_OPTIONS = [
  "Arial, sans-serif",
  "Georgia, serif",
  "Courier New, monospace",
  "Verdana, sans-serif",
  "Trebuchet MS, sans-serif",
  "Impact, sans-serif",
];

const SHAPE_OPTIONS: { value: VariantDesign["shape"]; label: string }[] = [
  { value: "rectangle", label: "Rectangle" },
  { value: "rounded", label: "Arrondi" },
  { value: "rounded-lg", label: "Très arrondi" },
];

interface Props {
  templates: PlateTemplate[];
}


export function PlaquesTemplatesClient({ templates }: Props) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Plaques Templates</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Designez jusqu&apos;à 5 variantes de plaques parcellaires
          </p>
        </div>
        <Button
          onClick={() => setCreating(true)}
          className="h-10 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20"
          disabled={creating}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Template
        </Button>
      </div>

      {creating && (
        <TemplateEditor
          onClose={() => setCreating(false)}
          onSaved={() => { setCreating(false); router.refresh(); }}
        />
      )}

      {editingId && (
        <TemplateEditor
          template={templates.find((t) => t.id === editingId)}
          onClose={() => setEditingId(null)}
          onSaved={() => { setEditingId(null); router.refresh(); }}
        />
      )}

      {/* Template list */}
      {templates.length === 0 && !creating ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-16 text-center">
            <Palette className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Aucun template créé</p>
            <p className="text-gray-400 text-sm mt-1">
              Créez un template pour commencer à générer des plaques
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={() => setEditingId(template.id)}
              onDeleted={() => router.refresh()}
            />
          ))}
        </div>
      )}
    </div>
  );
}


// ============ TEMPLATE CARD ============
function TemplateCard({
  template,
  onEdit,
  onDeleted,
}: {
  template: PlateTemplate;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const variants = (typeof template.variants === "string"
    ? JSON.parse(template.variants)
    : template.variants) as VariantDesign[];

  async function handleDelete() {
    if (!window.confirm("Supprimer ce template ?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/plate-templates/${template.id}`, { method: "DELETE" });
      toast.success("Template supprimé");
      onDeleted();
    } catch {
      toast.error("Erreur");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card className="border-0 shadow-md shadow-gray-200/50 hover:shadow-lg transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900">{template.nom}</h3>
              <Badge className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 border">
                {variants.length} variante{variants.length > 1 ? "s" : ""}
              </Badge>
            </div>
            {template.description && (
              <p className="text-sm text-gray-500 mb-3">{template.description}</p>
            )}
            {/* Variant color swatches */}
            <div className="flex items-center gap-2">
              {variants.map((v, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 border border-gray-100">
                  <div
                    className="w-5 h-5 rounded border border-gray-200"
                    style={{ backgroundColor: v.bgColor }}
                  />
                  <span className="text-[10px] text-gray-600 font-medium">{v.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Assets preview */}
            <div className="flex items-center gap-1 mr-2">
              {template.flagUrl && (
                <div className="w-8 h-6 rounded border border-gray-200 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={template.flagUrl} alt="Drapeau" className="w-full h-full object-cover" />
                </div>
              )}
              {template.sealUrl && (
                <div className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={template.sealUrl} alt="Sceau" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <Button size="sm" variant="outline" className="h-8 px-3 text-xs" onClick={onEdit}>
              <Edit3 className="w-3 h-3 mr-1" /> Éditer
            </Button>
            <Button
              size="sm" variant="outline"
              className="h-8 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleDelete} disabled={deleting}
            >
              {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


// ============ TEMPLATE EDITOR (Modal) ============
function TemplateEditor({
  template,
  onClose,
  onSaved,
}: {
  template?: PlateTemplate;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!template;
  const existingVariants = template
    ? ((typeof template.variants === "string"
        ? JSON.parse(template.variants)
        : template.variants) as VariantDesign[])
    : [{ ...DEFAULT_VARIANT }];

  const [nom, setNom] = useState(template?.nom || "");
  const [description, setDescription] = useState(template?.description || "");
  const [variants, setVariants] = useState<VariantDesign[]>(existingVariants);
  const [flagUrl, setFlagUrl] = useState(template?.flagUrl || "");
  const [sealUrl, setSealUrl] = useState(template?.sealUrl || "");
  const [saving, setSaving] = useState(false);
  const [uploadingFlag, setUploadingFlag] = useState(false);
  const [uploadingSeal, setUploadingSeal] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(0);

  function addVariant() {
    if (variants.length >= 5) { toast.error("Maximum 5 variantes"); return; }
    setVariants([...variants, {
      ...DEFAULT_VARIANT,
      name: `Variante ${variants.length + 1}`,
      bgColor: ["#1a3a7a", "#1b5e20", "#4a148c", "#b71c1c", "#e65100"][variants.length] || "#1a3a7a",
    }]);
  }

  function updateVariant(idx: number, field: keyof VariantDesign, value: string) {
    const updated = [...variants];
    (updated[idx] as unknown as Record<string, string>)[field] = value;
    setVariants(updated);
  }

  function removeVariant(idx: number) {
    if (variants.length <= 1) { toast.error("Au moins une variante requise"); return; }
    setVariants(variants.filter((_, i) => i !== idx));
    if (previewIdx >= variants.length - 1) setPreviewIdx(0);
  }

  async function uploadFile(type: "flag" | "seal") {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/svg+xml,image/webp";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const setter = type === "flag" ? setUploadingFlag : setUploadingSeal;
      setter(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("type", type);
        const res = await fetch("/api/uploads", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error); return; }
        if (type === "flag") setFlagUrl(data.url);
        else setSealUrl(data.url);
        toast.success(`${type === "flag" ? "Drapeau" : "Sceau"} uploadé`);
      } catch { toast.error("Erreur upload"); }
      finally { setter(false); }
    };
    input.click();
  }

  async function handleSave() {
    if (!nom.trim()) { toast.error("Nom requis"); return; }
    setSaving(true);
    try {
      const body = { nom, description, variants, flagUrl: flagUrl || null, sealUrl: sealUrl || null };
      const url = isEdit ? `/api/plate-templates/${template!.id}` : "/api/plate-templates";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const e = await res.json(); toast.error(e.error); return; }
      toast.success(isEdit ? "Template mis à jour" : "Template créé !");
      onSaved();
    } catch { toast.error("Erreur"); }
    finally { setSaving(false); }
  }

  const activeVariant = variants[previewIdx] || variants[0];


  return (
    <Portal>
    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-8 overflow-y-auto">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl animate-scale-in mb-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Palette className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {isEdit ? "Modifier le Template" : "Nouveau Template"}
              </h3>
              <p className="text-xs text-gray-500">Designez vos variantes de plaques</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Name & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-600">Nom du template *</Label>
              <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex: Standard Kinshasa" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-600">Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description optionnelle" className="h-10" />
            </div>
          </div>

          {/* Assets upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-xs font-medium text-gray-600">Drapeau national</Label>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-[10px]" onClick={() => uploadFile("flag")} disabled={uploadingFlag}>
                    {uploadingFlag ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Upload className="w-3 h-3 mr-1" />}
                    Upload
                  </Button>
                </div>
                {flagUrl ? (
                  <div className="w-16 h-12 rounded border border-gray-200 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={flagUrl} alt="Drapeau" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-12 rounded border border-dashed border-gray-300 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-xs font-medium text-gray-600">Sceau communal (rond)</Label>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-[10px]" onClick={() => uploadFile("seal")} disabled={uploadingSeal}>
                    {uploadingSeal ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Upload className="w-3 h-3 mr-1" />}
                    Upload
                  </Button>
                </div>
                {sealUrl ? (
                  <div className="w-12 h-12 rounded-full border border-gray-200 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sealUrl} alt="Sceau" className="w-full h-full object-cover rounded-full" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full border border-dashed border-gray-300 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>


          {/* Variants editor */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-semibold text-gray-900">Variantes ({variants.length}/5)</Label>
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={addVariant} disabled={variants.length >= 5}>
                <Plus className="w-3 h-3 mr-1" /> Ajouter
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Variants list */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {variants.map((v, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      previewIdx === i ? "border-blue-300 bg-blue-50/50 shadow-sm" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setPreviewIdx(i)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Input
                        value={v.name}
                        onChange={(e) => updateVariant(i, "name", e.target.value)}
                        className="h-7 text-xs font-semibold border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex items-center gap-1">
                        <button
                          className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-blue-600"
                          onClick={(e) => { e.stopPropagation(); setPreviewIdx(i); }}
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-red-600"
                          onClick={(e) => { e.stopPropagation(); removeVariant(i); }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <ColorField label="Fond" value={v.bgColor} onChange={(val) => updateVariant(i, "bgColor", val)} />
                      <ColorField label="Bordure" value={v.borderColor} onChange={(val) => updateVariant(i, "borderColor", val)} />
                      <ColorField label="Texte" value={v.textColor} onChange={(val) => updateVariant(i, "textColor", val)} />
                      <ColorField label="Accent" value={v.accentColor} onChange={(val) => updateVariant(i, "accentColor", val)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <span className="text-[9px] text-gray-500">Police</span>
                        <select
                          value={v.fontFamily}
                          onChange={(e) => updateVariant(i, "fontFamily", e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full h-7 text-[10px] rounded border border-gray-200 bg-white px-1"
                        >
                          {FONT_OPTIONS.map((f) => (
                            <option key={f} value={f}>{f.split(",")[0]}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500">Forme</span>
                        <select
                          value={v.shape}
                          onChange={(e) => updateVariant(i, "shape", e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full h-7 text-[10px] rounded border border-gray-200 bg-white px-1"
                        >
                          {SHAPE_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>


              {/* Live Preview */}
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-[10px] text-gray-500 mb-3 font-medium">Aperçu — {activeVariant.name}</p>
                <PlatePreview variant={activeVariant} flagUrl={flagUrl} sealUrl={sealUrl} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={onClose} disabled={saving} className="h-10 px-5">
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-10 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {isEdit ? "Enregistrer" : "Créer le template"}
            </Button>
          </div>
        </div>
      </div>
    </div>
    </Portal>
  );
}


// ============ HELPERS ============
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <span className="text-[9px] text-gray-500">{label}</span>
      <div className="flex items-center gap-1 mt-0.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-6 h-6 rounded border border-gray-200 cursor-pointer p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-6 text-[9px] font-mono border border-gray-200 rounded px-1"
        />
      </div>
    </div>
  );
}

function PlatePreview({ variant, flagUrl, sealUrl }: { variant: VariantDesign; flagUrl: string; sealUrl: string }) {
  const rx = variant.shape === "rectangle" ? "4" : variant.shape === "rounded" ? "10" : "18";

  return (
    <svg viewBox="0 0 360 180" className="w-full max-w-[320px] drop-shadow-lg">
      {/* Outer frame */}
      <rect x="2" y="2" width="356" height="176" rx={rx} fill={variant.borderColor} />
      {/* Inner bg */}
      <rect x="6" y="6" width="348" height="168" rx={String(Math.max(0, Number(rx) - 2))} fill={variant.bgColor} />

      {/* Flag */}
      {flagUrl ? (
        <image href={flagUrl} x="16" y="14" width="44" height="30" preserveAspectRatio="xMidYMid meet" />
      ) : (
        <rect x="16" y="14" width="44" height="30" rx="2" fill="#007FFF" opacity="0.5" />
      )}

      {/* Seal (always round) */}
      <clipPath id="sealClip">
        <circle cx="326" cy="30" r="16" />
      </clipPath>
      {sealUrl ? (
        <image href={sealUrl} x="310" y="14" width="32" height="32" clipPath="url(#sealClip)" preserveAspectRatio="xMidYMid slice" />
      ) : (
        <circle cx="326" cy="30" r="16" fill="none" stroke={variant.borderColor} strokeWidth="1" opacity="0.5" />
      )}

      {/* Text */}
      <text x="180" y="24" textAnchor="middle" fill={variant.accentColor} fontSize="6" fontFamily={variant.fontFamily}>COMMUNE DE</text>
      <text x="180" y="38" textAnchor="middle" fill={variant.textColor} fontSize="11" fontWeight="bold" fontFamily={variant.fontFamily}>NGIRI NGIRI</text>
      <text x="180" y="56" textAnchor="middle" fill={variant.accentColor} fontSize="8" fontWeight="bold" fontFamily={variant.fontFamily}>QUARTIER ELENGESA</text>

      {/* White band for avenue */}
      <rect x="14" y="64" width="332" height="28" rx="3" fill={variant.borderColor} opacity="0.15" />
      <text x="180" y="82" textAnchor="middle" fill={variant.textColor} fontSize="12" fontWeight="bold" fontFamily={variant.fontFamily}>AVENUE ELENGESA</text>

      {/* N° */}
      <text x="130" y="140" textAnchor="middle" fill={variant.accentColor} fontSize="32" fontWeight="bold" fontFamily={variant.fontFamily}>N° 6</text>

      {/* QR placeholder with seal center */}
      <rect x="290" y="100" width="48" height="48" rx="4" fill="white" />
      <rect x="294" y="104" width="10" height="10" rx="1" fill="none" stroke="#1e293b" strokeWidth="1.5" />
      <rect x="296" y="106" width="6" height="6" fill="#1e293b" />
      <rect x="324" y="104" width="10" height="10" rx="1" fill="none" stroke="#1e293b" strokeWidth="1.5" />
      <rect x="326" y="106" width="6" height="6" fill="#1e293b" />
      <rect x="294" y="132" width="10" height="10" rx="1" fill="none" stroke="#1e293b" strokeWidth="1.5" />
      <rect x="296" y="134" width="6" height="6" fill="#1e293b" />
      {/* Seal in QR center */}
      <clipPath id="qrSealClip">
        <circle cx="314" cy="124" r="8" />
      </clipPath>
      {sealUrl ? (
        <image href={sealUrl} x="306" y="116" width="16" height="16" clipPath="url(#qrSealClip)" preserveAspectRatio="xMidYMid slice" />
      ) : (
        <circle cx="314" cy="124" r="8" fill="#f0f0f0" stroke="#ddd" strokeWidth="0.5" />
      )}
    </svg>
  );
}
