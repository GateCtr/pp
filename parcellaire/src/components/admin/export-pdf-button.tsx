"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Parcelle } from "@/db/schema";

interface ParcelleWithAgent extends Parcelle {
  agentNom: string;
}

interface ExportPdfButtonProps {
  parcelles: ParcelleWithAgent[];
  filterLabel: string;
}

export function ExportPdfButton({ parcelles, filterLabel }: ExportPdfButtonProps) {
  const [generating, setGenerating] = useState(false);

  async function handleExport() {
    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Colors
      const headerBlue = "#1a3a7a";
      const lightBlue = "#e8f0fe";

      // === HEADER ===
      doc.setFillColor(headerBlue);
      doc.rect(0, 0, pageWidth, 22, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("LOPANGO", 14, 12);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Système de Cartographie & Recensement — RDC", 14, 18);

      // === Filter info ===
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Liste des parcelles — ${filterLabel}`, 14, 32);

      // === Statistics box ===
      const totalParcelles = parcelles.length;
      const validees = parcelles.filter((p) => p.statutValidation === "valide").length;
      const enAttente = parcelles.filter((p) => p.statutValidation === "brouillon").length;
      const rejetees = parcelles.filter((p) => p.statutValidation === "rejete").length;

      doc.setFillColor(lightBlue);
      doc.roundedRect(14, 36, pageWidth - 28, 14, 2, 2, "F");

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(26, 58, 122);

      const statsY = 44;
      const statsSpacing = (pageWidth - 28) / 4;
      const statsX = 20;

      doc.setFont("helvetica", "bold");
      doc.text(`Total: ${totalParcelles}`, statsX, statsY);
      doc.setFont("helvetica", "normal");
      doc.text(`Validées: ${validees}`, statsX + statsSpacing, statsY);
      doc.text(`En attente: ${enAttente}`, statsX + statsSpacing * 2, statsY);
      doc.text(`Rejetées: ${rejetees}`, statsX + statsSpacing * 3, statsY);

      // === Table ===
      const statusLabels: Record<string, string> = {
        brouillon: "En attente",
        valide: "Validée",
        rejete: "Rejetée",
      };

      const tableHead = [["N°", "Avenue", "Numéro", "Commune", "Quartier", "Propriétaire", "Statut", "Date"]];
      const tableBody = parcelles.map((p, i) => [
        String(i + 1),
        p.avenue || "—",
        p.numero || "—",
        p.commune || "—",
        p.quartier || "—",
        p.proprietaireNom || "—",
        statusLabels[p.statutValidation] || p.statutValidation,
        p.creeLe
          ? new Date(p.creeLe).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "—",
      ]);

      autoTable(doc, {
        head: tableHead,
        body: tableBody,
        startY: 54,
        theme: "grid",
        headStyles: {
          fillColor: [26, 58, 122],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          fontSize: 7.5,
          cellPadding: 2,
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 12 },
          1: { cellWidth: 40 },
          2: { halign: "center", cellWidth: 18 },
          3: { cellWidth: 35 },
          4: { cellWidth: 35 },
          5: { cellWidth: 45 },
          6: { halign: "center", cellWidth: 22 },
          7: { halign: "center", cellWidth: 25 },
        },
        margin: { left: 14, right: 14 },
        didDrawPage: () => {
          // Footer on each page
          const now = new Date().toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          doc.setFontSize(7);
          doc.setTextColor(130, 130, 130);
          doc.setFont("helvetica", "italic");
          doc.text(
            `Généré par Lopango — ${now}`,
            pageWidth / 2,
            pageHeight - 8,
            { align: "center" }
          );
        },
      });

      doc.save(`lopango-parcelles-${Date.now()}.pdf`);
      toast.success("PDF exporté avec succès");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-9 px-3 text-xs"
      onClick={handleExport}
      disabled={generating || parcelles.length === 0}
    >
      {generating ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
      ) : (
        <FileDown className="w-3.5 h-3.5 mr-1.5" />
      )}
      Exporter PDF
    </Button>
  );
}
