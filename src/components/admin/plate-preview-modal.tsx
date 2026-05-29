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
    const link = document.createElement("a");
    link.href = plaqueImageUrl;
    link.download = `plaque-${parcelle.commune}-${parcelle.avenue}-${parcelle.numero}.svg`;
    link.target = "_blank";
    link.click();
  }

  function handlePrint() {
    window.print();
  }

  return (
    <>
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body > *:not(.plate-preview-modal) {
            display: none !important;
          }
          .plate-preview-modal {
            position: static !important;
            background: white !important;
          }
          .plate-preview-modal .no-print {
            display: none !important;
          }
          .plate-preview-modal img {
            max-width: 100% !important;
            width: 600px !important;
            margin: 0 auto !important;
          }
        }
      `}</style>

      {/* Backdrop */}
      <Portal>
      <div
        className="plate-preview-modal fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Modal content */}
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 no-print">
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
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 no-print">
            <Button
              size="sm"
              variant="outline"
              className="h-9 px-3 text-xs"
              onClick={handleDownload}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Télécharger
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
      </Portal>
    </>
  );
}
