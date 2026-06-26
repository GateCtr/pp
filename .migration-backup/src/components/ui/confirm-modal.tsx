"use client";

import { Button } from "@/components/ui/button";
import { Portal } from "@/components/ui/portal";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <Portal>
      <div className="fixed inset-0 z-[99999]">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in">
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 text-center">
              <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center ${
                isDanger ? "bg-red-50" : "bg-amber-50"
              }`}>
                {isDanger ? (
                  <Trash2 className="w-7 h-7 text-red-500" />
                ) : (
                  <AlertTriangle className="w-7 h-7 text-amber-500" />
                )}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">{message}</p>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-11"
                  onClick={onCancel}
                  disabled={loading}
                >
                  {cancelLabel}
                </Button>
                <Button
                  className={`flex-1 h-11 text-white ${
                    isDanger
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                  onClick={onConfirm}
                  disabled={loading}
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  )}
                  {confirmLabel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
