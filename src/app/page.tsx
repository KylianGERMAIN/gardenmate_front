"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  getCarePlan,
  waterAll,
  waterPlant,
  removePlant,
  ApiError,
  type CareRecommendation,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { ThirstGauge } from "@/components/thirst-gauge";
import { AddPlantDialog } from "@/components/add-plant-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";

const DAY = 86_400_000;

function describeNext(c: CareRecommendation, now: number): string {
  if (c.status === "NO_SCHEDULE" || !c.nextWateringDate) return "cycle non défini";
  const days = Math.round((new Date(c.nextWateringDate).getTime() - now) / DAY);
  if (days < 0) return `${-days} j de retard`;
  if (days === 0) return "à arroser aujourd'hui";
  if (days === 1) return "à arroser demain";
  return `prochain dans ${days} j`;
}

function gaugePercent(c: CareRecommendation, now: number): number {
  if (c.status === "OVERDUE") return 100;
  if (c.status === "NO_SCHEDULE" || !c.nextWateringDate || !c.adjustedIntervalDays) return 0;
  const days = (new Date(c.nextWateringDate).getTime() - now) / DAY;
  const elapsed = c.adjustedIntervalDays - days;
  return Math.max(4, Math.min(100, (elapsed / c.adjustedIntervalDays) * 100));
}

function PlantCard({
  c,
  now,
  onWater,
  onDelete,
}: {
  c: CareRecommendation;
  now: number;
  onWater: (userPlantId: string) => Promise<void>;
  onDelete: (userPlantId: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState<null | "water" | "delete">(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function water() {
    setBusy("water");
    try {
      await onWater(c.userPlantId);
    } finally {
      setBusy(null);
    }
  }

  async function confirmRemove() {
    setBusy("delete");
    try {
      await onDelete(c.userPlantId);
      setConfirmOpen(false);
    } finally {
      setBusy(null);
    }
  }

  return (
    <article
      className={`rounded-2xl border bg-card p-5 ${
        c.status === "OVERDUE" ? "border-overdue/30" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-heading text-lg font-medium leading-tight">{c.plantName}</h3>
        <StatusBadge status={c.status} />
      </div>

      <div className="mt-2 flex flex-wrap gap-x-3.5 gap-y-1 font-mono text-[12px] text-muted-foreground">
        {c.adjustedIntervalDays ? (
          <span>
            <span className="text-foreground/40">cycle</span> {c.adjustedIntervalDays} j
          </span>
        ) : null}
        <span>
          <span className="text-foreground/40">besoin</span>{" "}
          {c.factors.source === "weather" ? "météo réelle" : "saison"}
        </span>
      </div>

      <div className="mt-4">
        <ThirstGauge
          status={c.status}
          percent={gaugePercent(c, now)}
          left={c.factors.source === "weather" ? "ajusté météo" : "ajusté saison"}
          right={describeNext(c, now)}
        />
      </div>

      <div className="mt-4 flex gap-2">
        <Button size="sm" variant="outline" onClick={water} disabled={busy !== null}>
          {busy === "water" ? "Arrosage…" : "💧 Arroser"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setConfirmOpen(true)}
          disabled={busy !== null}
          className="text-muted-foreground"
        >
          {busy === "delete" ? "Suppression…" : "Retirer"}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`Retirer ${c.plantName} ?`}
        message="Cette plante sera retirée de ton jardin."
        confirmLabel="Retirer"
        busy={busy === "delete"}
        onConfirm={confirmRemove}
        onCancel={() => setConfirmOpen(false)}
      />
    </article>
  );
}

function GroupHead({ title, count }: { title: string; count: number }) {
  return (
    <div className="mb-3.5 flex items-baseline gap-3">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      <span className="font-mono text-xs text-muted-foreground">
        {String(count).padStart(2, "0")}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export default function Home() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();

  const [plans, setPlans] = useState<CareRecommendation[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watering, setWatering] = useState(false);
  // Figé au montage : un dashboard est un instantané (rafraîchi via load() sur action).
  const [now] = useState(() => Date.now());

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setPlans(await getCarePlan(user.id));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible de charger ton jardin");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch initial au montage : tous les setState sont dans les callbacks async
  // (pas dans le corps synchrone de l'effet) pour éviter les renders en cascade.
  // load() ci-dessus sert aux refetch manuels (retry / après action).
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getCarePlan(user.id)
      .then((p) => {
        if (!cancelled) setPlans(p);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof ApiError ? e.message : "Impossible de charger ton jardin");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) return null;

  const all = plans ?? [];
  const needsWater = all.filter((c) => c.status === "OVERDUE" || c.status === "SOON");
  const healthy = all.filter((c) => c.status === "OK" || c.status === "NO_SCHEDULE");
  const overdue = all.filter((c) => c.status === "OVERDUE").length;
  const soon = all.filter((c) => c.status === "SOON").length;
  const ok = all.filter((c) => c.status === "OK").length;
  const name = user.email.split("@")[0];

  async function onWaterAll() {
    if (!user) return;
    setWatering(true);
    try {
      await waterAll(user.id);
      await load();
    } catch {
      /* l'erreur de rechargement est gérée par load() */
    } finally {
      setWatering(false);
    }
  }

  async function onWaterOne(userPlantId: string) {
    if (!user) return;
    setError(null);
    try {
      await waterPlant(user.id, userPlantId);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Arrosage impossible");
    }
  }

  async function onDeleteOne(userPlantId: string) {
    if (!user) return;
    setError(null);
    try {
      await removePlant(user.id, userPlantId);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Suppression impossible");
    }
  }

  async function onLogout() {
    await logout();
    router.replace("/login");
  }

  const subtitle = loading
    ? "On récupère ton jardin…"
    : overdue > 0
      ? `${overdue} plante${overdue > 1 ? "s ont" : " a"} soif aujourd'hui.`
      : soon > 0
        ? `${soon} plante${soon > 1 ? "s" : ""} à arroser bientôt.`
        : all.length > 0
          ? "Tout est au vert. Rien à arroser."
          : "Ton jardin est encore vide.";

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-background/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5 font-heading text-xl">
            <span className="grid size-7 place-items-center rounded-[9px] bg-verdant text-[15px] text-[#eaf3ec]">
              ❧
            </span>
            GardenMate
          </div>
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-full border border-border bg-secondary text-[13px] font-semibold text-secondary-foreground">
              {user.email.slice(0, 2).toUpperCase()}
            </div>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 pb-20">
        <section className="grid items-end gap-10 pt-14 pb-7 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Ton jardin · aujourd&apos;hui
            </p>
            <h1 className="mt-3.5 font-heading text-4xl font-medium leading-[1.05] md:text-5xl">
              Bonjour {name}.
              <br />
              <span className={overdue > 0 ? "text-overdue" : "text-ok"}>{subtitle}</span>
            </h1>
          </div>
          <div className="flex gap-2.5">
            {[
              { n: overdue, l: "en retard", c: "text-overdue" },
              { n: soon, l: "bientôt", c: "text-soon" },
              { n: ok, l: "ça va", c: "text-ok" },
            ].map((s) => (
              <div key={s.l} className="flex-1 rounded-xl border border-border bg-card p-4">
                <b className={`block font-mono text-2xl leading-none ${s.c}`}>{s.n}</b>
                <span className="text-[12.5px] text-muted-foreground">{s.l}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-2.5">
          <Button onClick={onWaterAll} disabled={watering || needsWater.length === 0}>
            {watering ? "Arrosage…" : "💧 Tout arroser"}
          </Button>
          <AddPlantDialog userId={user.id} onAdded={() => void load()} />
        </div>

        {loading ? (
          <div className="mt-10 grid place-items-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
            <p className="text-sm text-muted-foreground">On récupère ton jardin…</p>
            <p className="font-mono text-[11px] text-muted-foreground">
              le serveur gratuit peut mettre ~30 s à se réveiller
            </p>
          </div>
        ) : error ? (
          <div className="mt-10 grid place-items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 py-16 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              Réessayer
            </Button>
          </div>
        ) : all.length === 0 ? (
          <div className="mt-10 grid place-items-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
            <p className="font-heading text-xl">Ton jardin t&apos;attend 🌱</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Ajoute ta première plante avec le bouton « Ajouter une plante » ci-dessus pour
              suivre quand elle a besoin d&apos;eau.
            </p>
          </div>
        ) : (
          <>
            {needsWater.length > 0 ? (
              <section className="mt-9">
                <GroupHead title="À arroser" count={needsWater.length} />
                <div className="grid gap-3">
                  {needsWater.map((c) => (
                    <PlantCard
                      key={c.userPlantId}
                      c={c}
                      now={now}
                      onWater={onWaterOne}
                      onDelete={onDeleteOne}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {healthy.length > 0 ? (
              <section className="mt-9">
                <GroupHead title="Ça va" count={healthy.length} />
                <div className="grid gap-3">
                  {healthy.map((c) => (
                    <PlantCard
                      key={c.userPlantId}
                      c={c}
                      now={now}
                      onWater={onWaterOne}
                      onDelete={onDeleteOne}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </main>
    </>
  );
}
