"use client";

import { useEffect, useRef, useState } from "react";
import { getPlants, addPlant, ApiError, type Plant } from "@/lib/api";
import { Button } from "@/components/ui/button";

const SUNLIGHT_LABEL: Record<Plant["sunlightLevel"], string> = {
  FULL_SUN: "plein soleil",
  PARTIAL_SHADE: "mi-ombre",
  SHADE: "ombre",
};

export function AddPlantDialog({
  userId,
  onAdded,
}: {
  userId: string;
  onAdded: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

  // Pilote le <dialog> natif (gère Esc / focus-trap tout seul).
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Recherche debouncée : refetch 300 ms après la dernière frappe.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        setResults(await getPlants(query.trim() || undefined));
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Impossible de charger le catalogue");
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [open, query]);

  async function onPick(plant: Plant) {
    setAdding(plant.id);
    setError(null);
    try {
      await addPlant(userId, plant.id);
      setOpen(false);
      onAdded();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible d'ajouter cette plante");
    } finally {
      setAdding(null);
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Ajouter une plante
      </Button>

      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          // Clic sur le backdrop (la cible est le <dialog> lui-même) → ferme.
          if (e.target === ref.current) setOpen(false);
        }}
        className="m-auto w-full max-w-md rounded-2xl border border-border bg-card p-0 text-foreground backdrop:bg-foreground/30 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-heading text-xl font-medium">Ajouter une plante</h2>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Fermer
            </Button>
          </div>

          <input
            type="search"
            autoFocus
            placeholder="Rechercher une espèce…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          {error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="grid h-72 auto-rows-min content-start gap-1.5 overflow-y-auto">
            {loading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Recherche…</p>
            ) : results.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aucune espèce trouvée.
              </p>
            ) : (
              results.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={adding !== null}
                  onClick={() => void onPick(p)}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 text-left transition-colors hover:bg-secondary disabled:opacity-50"
                >
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {SUNLIGHT_LABEL[p.sunlightLevel]}
                      {p.wateringFrequency ? ` · cycle ${p.wateringFrequency} j` : ""}
                    </span>
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {adding === p.id ? "ajout…" : "+"}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
