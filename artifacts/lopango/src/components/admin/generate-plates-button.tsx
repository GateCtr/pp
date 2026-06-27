"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { GeneratePlatesModal } from "./generate-plates-modal";
import type { Parcelle } from "@/db/schema";

interface Props {
  validatedParcelles: Parcelle[];
}

export function GeneratePlatesButton({ validatedParcelles }: Props) {
  const [open, setOpen] = useState(false);

  if (validatedParcelles.length === 0) return null;

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="h-9 px-3 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
        onClick={() => setOpen(true)}
      >
        <Printer className="w-3.5 h-3.5 mr-1.5" />
        Générer plaques ({validatedParcelles.length})
      </Button>

      {open && (
        <GeneratePlatesModal
          parcelles={validatedParcelles}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
