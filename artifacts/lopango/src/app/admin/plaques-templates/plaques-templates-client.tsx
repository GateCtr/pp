"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, X, Loader2, Upload, Palette, Edit3, Eye, Image as ImageIcon, Check } from "lucide-react";
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
  avenueColor: "#c8a84b",
};

const FONT_OPTIONS: { value: string; label: string }[] = [
  { value: "Arial, sans-serif",                      label: "Arial" },
  { value: "Verdana, sans-serif",                    label: "Verdana" },
  { value: "Trebuchet MS, sans-serif",               label: "Trebuchet MS" },
  { value: "Impact, sans-serif",                     label: "Impact" },
  { value: "Georgia, serif",                         label: "Georgia" },
  { value: "'Times New Roman', serif",               label: "Times New Roman" },
  { value: "Courier New, monospace",                 label: "Courier New" },
  { value: "'Oswald', sans-serif",                   label: "Oswald" },
  { value: "'Bebas Neue', sans-serif",               label: "Bebas Neue" },
  { value: "'Anton', sans-serif",                    label: "Anton" },
  { value: "'Montserrat', sans-serif",               label: "Montserrat" },
  { value: "'Raleway', sans-serif",                  label: "Raleway" },
  { value: "'Barlow Condensed', sans-serif",         label: "Barlow Condensed" },
  { value: "'Roboto Condensed', sans-serif",         label: "Roboto Condensed" },
  { value: "'Ubuntu', sans-serif",                   label: "Ubuntu" },
  { value: "'Playfair Display', serif",              label: "Playfair Display" },
  { value: "'Cinzel', serif",                        label: "Cinzel" },
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
        <div className="flex items-start gap-4">
          {/* Plate Preview */}
          <div className="flex-shrink-0 w-48 hidden sm:block">
            <PlatePreview
              variant={variants[0]}
              flagUrl={template.flagUrl || ""}
              sealUrl={template.sealUrl || ""}
            />
          </div>

          {/* Info */}
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
            <div className="flex items-center gap-2 flex-wrap">
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

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
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



// ============ ASSETS MANAGER MODAL ============
function AssetsManager({
  type,
  onSelect,
  onClose,
}: {
  type: "flag" | "seal";
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [assets, setAssets] = useState<{ id: string; url: string; filename: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  async function fetchAssets() {
    setLoading(true);
    try {
      const res = await fetch(`/api/assets?type=${type}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAssets(data);
    } catch {
      toast.error("Erreur lors du chargement des assets");
    } finally {
      setLoading(false);
    }
  }


  async function handleUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/svg+xml,image/webp";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("type", type);
        const res = await fetch("/api/uploads", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error || "Erreur upload"); return; }
        toast.success(`${type === "flag" ? "Drapeau" : "Sceau"} uploadé`);
        // Refresh list from DB
        await fetchAssets();
      } catch {
        toast.error("Erreur upload");
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Supprimer cet asset ?")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/assets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setAssets((prev) => prev.filter((a) => a.id !== id));
        toast.success("Asset supprimé");
      } else {
        toast.error("Erreur suppression");
      }
    } catch {
      toast.error("Erreur");
    } finally {
      setDeletingId(null);
    }
  }


  const title = type === "flag" ? "Drapeaux" : "Sceaux";

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999]">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        {/* Content - centered with scroll */}
        <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Gérer les {title}</h3>
                  <p className="text-xs text-gray-500">
                    Sélectionnez ou uploadez un {type === "flag" ? "drapeau" : "sceau"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>


            <div className="p-6">
              {/* Upload button */}
              <div className="mb-4">
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="h-9 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Uploader un nouveau {type === "flag" ? "drapeau" : "sceau"}
                </Button>
              </div>

              {/* Assets grid */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : assets.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Aucun {type === "flag" ? "drapeau" : "sceau"} disponible</p>
                  <p className="text-gray-400 text-sm mt-1">Uploadez-en un pour commencer</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="group relative border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className={`aspect-square flex items-center justify-center bg-gray-50 p-2 ${type === "seal" ? "rounded-full mx-auto w-3/4 mt-2" : ""}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={asset.url} alt={type} className="w-full h-full object-contain" />
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <Button
                          size="sm"
                          className="h-7 px-2 text-[10px] bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => { onSelect(asset.url); onClose(); }}
                        >
                          <Check className="w-3 h-3 mr-1" /> Sélectionner
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-[10px] bg-white/90 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDelete(asset.id)}
                          disabled={deletingId === asset.id}
                        >
                          {deletingId === asset.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Portal>
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
  const [previewIdx, setPreviewIdx] = useState(0);
  const [assetsType, setAssetsType] = useState<"flag" | "seal" | null>(null);

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
    <>
      {/* Assets Manager sub-modal */}
      {assetsType && (
        <AssetsManager
          type={assetsType}
          onSelect={(url) => {
            if (assetsType === "flag") setFlagUrl(url);
            else setSealUrl(url);
          }}
          onClose={() => setAssetsType(null)}
        />
      )}

      <Portal>
        <div className="fixed inset-0 z-[9999]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          {/* Content - centered with scroll */}
          <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-auto">
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
                    <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex: Standard Kongo Central" className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">Description</Label>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description optionnelle" className="h-10" />
                  </div>
                </div>

                {/* Assets selection (no upload here — opens AssetsManager) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Flag */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <Label className="text-xs font-medium text-gray-600 mb-3 block">Drapeau national</Label>
                      {flagUrl ? (
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-12 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={flagUrl} alt="Drapeau" className="w-full h-full object-contain" />
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-xs"
                            onClick={() => setAssetsType("flag")}
                          >
                            <Edit3 className="w-3 h-3 mr-1" /> Changer
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-12 rounded border border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="w-5 h-5 text-gray-300" />
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-xs"
                            onClick={() => setAssetsType("flag")}
                          >
                            <ImageIcon className="w-3 h-3 mr-1" /> Sélectionner
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>


                  {/* Seal */}
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <Label className="text-xs font-medium text-gray-600 mb-3 block">Sceau communal (rond)</Label>
                      {sealUrl ? (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full border border-gray-200 overflow-hidden flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={sealUrl} alt="Sceau" className="w-full h-full object-cover rounded-full" />
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-xs"
                            onClick={() => setAssetsType("seal")}
                          >
                            <Edit3 className="w-3 h-3 mr-1" /> Changer
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full border border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="w-5 h-5 text-gray-300" />
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-xs"
                            onClick={() => setAssetsType("seal")}
                          >
                            <ImageIcon className="w-3 h-3 mr-1" /> Sélectionner
                          </Button>
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
                          <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                            <span className="text-[9px] font-semibold text-amber-600 uppercase tracking-wider">Bandeau Avenue</span>
                            <div className="mt-1">
                              <ColorField label="Couleur du bandeau" value={v.avenueColor || v.borderColor} onChange={(val) => updateVariant(i, "avenueColor", val)} highlight />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <span className="text-[9px] text-gray-500">Police</span>
                              <select
                                value={v.fontFamily}
                                onChange={(e) => updateVariant(i, "fontFamily", e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full h-7 text-[10px] rounded border border-gray-200 bg-white px-1"
                                style={{ fontFamily: v.fontFamily }}
                              >
                                {FONT_OPTIONS.map((f) => (
                                  <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
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
        </div>
      </Portal>
    </>
  );
}



// ============ HELPERS ============
function ColorField({ label, value, onChange, highlight }: { label: string; value: string; onChange: (v: string) => void; highlight?: boolean }) {
  return (
    <div onClick={(e) => e.stopPropagation()} className={highlight ? "p-1.5 rounded-lg bg-amber-50 border border-amber-200" : ""}>
      <span className={`text-[9px] ${highlight ? "text-amber-700 font-medium" : "text-gray-500"}`}>{label}</span>
      <div className="flex items-center gap-1 mt-0.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-7 rounded cursor-pointer p-0 ${highlight ? "w-10 border-2 border-amber-300" : "w-6 border border-gray-200"}`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-6 text-[9px] font-mono rounded px-1 ${highlight ? "border border-amber-300 bg-white" : "border border-gray-200"}`}
        />
      </div>
    </div>
  );
}


function PlatePreview({ variant, flagUrl, sealUrl }: { variant: VariantDesign; flagUrl: string; sealUrl: string }) {
  // viewBox mirrors 2400×1100 at scale 360/2400 = 0.15 → height = 165
  const rx = variant.shape === "rectangle" ? "3" : variant.shape === "rounded" ? "8" : "14";
  const innerRx = String(Math.max(0, Number(rx) - 1));
  const aColor = variant.avenueColor || variant.borderColor;

  return (
    <svg viewBox="0 0 360 165" className="w-full max-w-[320px] drop-shadow-lg">
      {/* Outer frame */}
      <rect x="1" y="1" width="358" height="163" rx={rx} fill={variant.borderColor} />
      {/* Inner bg */}
      <rect x="3" y="3" width="354" height="159" rx={innerRx} fill={variant.bgColor} />

      {/* Flag (top left, with margin from border) */}
      {flagUrl ? (
        <image href={flagUrl} x="18" y="4" width="29" height="20" preserveAspectRatio="xMidYMid meet" />
      ) : (
        <g transform="translate(18,4)">
          <rect width="29" height="20" fill="#007FFF" rx="1" opacity="0.7"/>
          <polygon points="0,14 0,20 22,6 22,0 29,0 29,6 6,20 0,20" fill="#CE1021" opacity="0.7"/>
        </g>
      )}

      {/* Seal (top right, with margin from border) */}
      <clipPath id="prvSealClip"><circle cx="338" cy="13" r="12" /></clipPath>
      {sealUrl ? (
        <image href={sealUrl} x="326" y="1" width="24" height="24" clipPath="url(#prvSealClip)" preserveAspectRatio="xMidYMid slice" />
      ) : (
        <circle cx="338" cy="13" r="12" fill="none" stroke={variant.borderColor} strokeWidth="1" opacity="0.4" />
      )}

      {/* Commune name */}
      <text x="180" y="26" textAnchor="middle" fill={variant.textColor} fontSize="15" fontWeight="bold" fontFamily={variant.fontFamily}>MATADI</text>

      {/* Separator */}
      <line x1="10" y1="32" x2="350" y2="32" stroke={variant.borderColor} strokeWidth="0.5" opacity="0.25" />

      {/* Quartier */}
      <text x="180" y="42" textAnchor="middle" fill={variant.accentColor} fontSize="9" fontWeight="600" fontFamily={variant.fontFamily}>QUARTIER MVUZI</text>

      {/* Avenue band */}
      <rect x="3" y="48" width="354" height="36" fill={aColor} />
      {/* Avenue name */}
      <text x="180" y="70" textAnchor="middle" fill={variant.textColor} fontSize="14" fontWeight="bold" fontFamily={variant.fontFamily}>AVENUE DE L&apos;INDÉPENDANCE</text>

      {/* Vertical separator */}
      <line x1="240" y1="86" x2="240" y2="162" stroke={variant.borderColor} strokeWidth="0.5" opacity="0.2" />

      {/* N° — same size as numero */}
      <text x="122" y="114" textAnchor="middle" fill={variant.accentColor} fontSize="36" fontWeight="bold" fontFamily={variant.fontFamily} letterSpacing="1">N°</text>
      {/* Numero */}
      <text x="122" y="153" textAnchor="middle" fill={variant.textColor} fontSize="36" fontWeight="bold" fontFamily={variant.fontFamily}>15</text>

      {/* QR mock — right edge aligns with seal right edge (338+12=350) */}
      <rect x="277" y="86" width="73" height="73" rx="2" fill="white" opacity="0.9"/>
      <rect x="280" y="89" width="11" height="11" rx="1" fill="none" stroke="#1e293b" strokeWidth="1.2" />
      <rect x="282" y="91" width="7" height="7" fill="#1e293b" />
      <rect x="298" y="89" width="11" height="11" rx="1" fill="none" stroke="#1e293b" strokeWidth="1.2" />
      <rect x="300" y="91" width="7" height="7" fill="#1e293b" />
      <rect x="280" y="107" width="11" height="11" rx="1" fill="none" stroke="#1e293b" strokeWidth="1.2" />
      <rect x="282" y="109" width="7" height="7" fill="#1e293b" />
      <clipPath id="prvQrSealClip"><circle cx="313" cy="122" r="8" /></clipPath>
      {sealUrl ? (
        <image href={sealUrl} x="305" y="114" width="16" height="16" clipPath="url(#prvQrSealClip)" preserveAspectRatio="xMidYMid slice" />
      ) : (
        <circle cx="313" cy="122" r="8" fill="#f0f0f0" stroke="#ddd" strokeWidth="0.5" />
      )}
    </svg>
  );
}
