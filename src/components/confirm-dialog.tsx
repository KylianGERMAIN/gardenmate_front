"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

// Confirmation oui/non générique, sur <dialog> natif (Esc / focus-trap gérés).
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmer",
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onCancel}
      onClick={(e) => {
        // Clic sur le backdrop (cible = le <dialog> lui-même) → annule.
        if (!busy && e.target === ref.current) onCancel();
      }}
      className="m-auto w-full max-w-sm rounded-2xl border border-border bg-card p-0 text-foreground backdrop:bg-foreground/30 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col gap-4 p-6">
        <div>
          <h2 className="font-heading text-lg font-medium">{title}</h2>
          {message ? <p className="mt-1.5 text-sm text-muted-foreground">{message}</p> : null}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={busy}>
            Annuler
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm} disabled={busy}>
            {busy ? "…" : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
