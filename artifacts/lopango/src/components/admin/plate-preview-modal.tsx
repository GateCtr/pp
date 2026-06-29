"use client";

import { Button } from "@/components/ui/button";
import { X, Download, Printer } from "lucide-react";
import { Portal } from "@/components/ui/portal";

interface PlatePreviewModalProps {
  plaqueImageUrl: string;
  parcelle: {
    commune: string;
    quartier: string;
    avenue: string;
    numero: string;
  };
  onClose: () => void;
}

export function PlatePreviewModal({
  plaqueImageUrl,
  parcelle,
  onClose,
}: PlatePreviewModalProps) {
  function handleDownload() {
    if (plaqueImageUrl.startsWith("data:image/svg")) {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 2400;
        canvas.height = 1200;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, 2400, 1200);
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `plaque-${parcelle.commune}-${parcelle.avenue}-N${parcelle.numero}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }
          }, "image/png");
        }
      };
      img.src = plaqueImageUrl;
    } else {
      const link = document.createElement("a");
      link.href = plaqueImageUrl;
      link.download = `plaque-${parcelle.commune}-${parcelle.avenue}-N${parcelle.numero}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  function handlePrint() {
    // Ouvrir une nouvelle fenêtre avec le design d'impression DIGIPARC
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const appUrl = window.location.origin;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Plaque - ${parcelle.commune} ${parcelle.avenue} N°${parcelle.numero}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20mm; background: white; }
          .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10mm; padding-bottom: 5mm; border-bottom: 2px solid #1a3a7a; }
          .header-left { display: flex; align-items: center; gap: 10px; }
          .header-left img { width: 32px; height: 32px; }
          .header-left .brand { font-size: 18px; font-weight: bold; color: #1a3a7a; }
          .header-left .sub { font-size: 9px; color: #666; }
          .header-right { font-size: 9px; color: #666; text-align: right; }
          .plate-container { text-align: center; margin: 10mm 0; }
          .plate-container img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .info { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 8mm; padding-top: 5mm; border-top: 1px solid #eee; }
          .info-item label { font-size: 9px; color: #888; display: block; }
          .info-item span { font-size: 12px; font-weight: 600; color: #1a3a7a; }
          .footer { margin-top: 15mm; padding-top: 5mm; border-top: 1px solid #eee; text-align: center; font-size: 8px; color: #999; }
          .footer a { color: #1a3a7a; text-decoration: none; }
          @media print { body { padding: 10mm; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <img src="${appUrl}/favicon-96x96.png" alt="DIGIPARC" />
            <div>
              <div class="brand">DIGIPARC</div>
              <div class="sub">Système de Cartographie & Recensement — RDC</div>
            </div>
          </div>
          <div class="header-right">
            Plaque Parcellaire<br/>
            ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        <div class="plate-container">
          <img src="${plaqueImageUrl}" alt="Plaque parcellaire" />
        </div>

        <div class="info">
          <div class="info-item"><label>Commune</label><span>${parcelle.commune}</span></div>
          <div class="info-item"><label>Quartier</label><span>${parcelle.quartier}</span></div>
          <div class="info-item"><label>Avenue</label><span>${parcelle.avenue}</span></div>
          <div class="info-item"><label>N°</label><span>${parcelle.numero}</span></div>
        </div>

        <div class="footer">
          Généré par <a href="${appUrl}">DIGIPARC</a> — ${appUrl}
        </div>

        <script>
          window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[99999]">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Centered content */}
        <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-auto animate-scale-in overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">
                Aperçu de la plaque parcellaire
              </h3>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Image */}
            <div className="p-6 flex justify-center bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={plaqueImageUrl}
                alt="Plaque parcellaire"
                className="max-w-full max-h-[50vh] rounded-lg shadow-md"
              />
            </div>

            {/* Parcelle info */}
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block">Commune</span>
                  <span className="text-gray-800 font-medium mt-0.5">
                    {parcelle.commune}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Quartier</span>
                  <span className="text-gray-800 font-medium mt-0.5">
                    {parcelle.quartier}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Avenue</span>
                  <span className="text-gray-800 font-medium mt-0.5">
                    {parcelle.avenue}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">N°</span>
                  <span className="text-gray-800 font-medium mt-0.5">
                    {parcelle.numero}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <Button
                size="sm"
                variant="outline"
                className="h-9 px-3 text-xs"
                onClick={handleDownload}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Télécharger PNG
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 px-3 text-xs"
                onClick={handlePrint}
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Imprimer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
