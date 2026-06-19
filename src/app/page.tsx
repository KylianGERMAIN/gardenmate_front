"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { StatusBadge, type CareStatus } from "@/components/status-badge";
import { ThirstGauge } from "@/components/thirst-gauge";

type Plant = {
  name: string;
  latin: string;
  status: CareStatus;
  percent: number;
  since: string;
  next: string;
  readings: { k: string; v: string }[];
};

const NEEDS_WATER: Plant[] = [
  {
    name: "Figuier lyre",
    latin: "Ficus lyrata",
    status: "OVERDUE",
    percent: 100,
    since: "arrosé il y a 6 j",
    next: "2 j de retard",
    readings: [
      { k: "expo", v: "plein soleil" },
      { k: "cycle", v: "4 j" },
      { k: "ET₀", v: "4.1 mm" },
    ],
  },
  {
    name: "Monstera",
    latin: "Monstera deliciosa",
    status: "OVERDUE",
    percent: 100,
    since: "arrosé il y a 8 j",
    next: "1 j de retard",
    readings: [
      { k: "expo", v: "mi-ombre" },
      { k: "cycle", v: "7 j" },
      { k: "ET₀", v: "4.1 mm" },
    ],
  },
  {
    name: "Calathea",
    latin: "Calathea orbifolia",
    status: "SOON",
    percent: 82,
    since: "arrosé il y a 4 j",
    next: "à arroser demain",
    readings: [
      { k: "expo", v: "ombre" },
      { k: "cycle", v: "5 j" },
    ],
  },
];

const HEALTHY: Plant[] = [
  {
    name: "Pothos",
    latin: "Epipremnum aureum",
    status: "OK",
    percent: 38,
    since: "arrosé il y a 3 j",
    next: "prochain dans 4 j",
    readings: [
      { k: "expo", v: "mi-ombre" },
      { k: "cycle", v: "9 j" },
    ],
  },
  {
    name: "Langue de belle-mère",
    latin: "Sansevieria trifasciata",
    status: "OK",
    percent: 16,
    since: "arrosé il y a 3 j",
    next: "prochain dans 12 j",
    readings: [
      { k: "expo", v: "plein soleil" },
      { k: "cycle", v: "20 j" },
    ],
  },
  {
    name: "Basilic",
    latin: "Ocimum basilicum",
    status: "NO_SCHEDULE",
    percent: 0,
    since: "aucune fréquence renseignée",
    next: "définir un cycle",
    readings: [{ k: "expo", v: "plein soleil" }],
  },
];

function PlantCard({ plant }: { plant: Plant }) {
  return (
    <article
      className={`rounded-2xl border bg-card p-5 ${
        plant.status === "OVERDUE" ? "border-overdue/30" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-lg font-medium leading-tight">{plant.name}</h3>
          <p className="font-heading text-sm italic text-muted-foreground">{plant.latin}</p>
        </div>
        <StatusBadge status={plant.status} />
      </div>

      <div className="mt-2 flex flex-wrap gap-x-3.5 gap-y-1 font-mono text-[12px] text-muted-foreground">
        {plant.readings.map((r) => (
          <span key={r.k}>
            <span className="text-foreground/40">{r.k}</span> {r.v}
          </span>
        ))}
      </div>

      <div className="mt-4">
        <ThirstGauge status={plant.status} percent={plant.percent} left={plant.since} right={plant.next} />
      </div>
    </article>
  );
}

function GroupHead({ title, count }: { title: string; count: string }) {
  return (
    <div className="mb-3.5 flex items-baseline gap-3">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      <span className="font-mono text-xs text-muted-foreground">{count}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export default function Home() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!user) return null;

  const name = user.email.split("@")[0];
  const initials = user.email.slice(0, 2).toUpperCase();

  async function onLogout() {
    await logout();
    router.replace("/login");
  }

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
          <nav className="hidden gap-6 text-sm text-muted-foreground sm:flex">
            <span className="font-semibold text-foreground">Mon jardin</span>
            <span>Catalogue</span>
            <span>Rappels</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-full border border-border bg-secondary text-[13px] font-semibold text-secondary-foreground">
              {initials}
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
              Mardi 19 juin · Francfort · ET₀ 4.1 mm
            </p>
            <h1 className="mt-3.5 font-heading text-4xl font-medium leading-[1.05] md:text-5xl">
              Bonjour {name}.
              <br />
              <span className="text-overdue">Trois plantes</span> ont soif aujourd&apos;hui.
            </h1>
            <p className="mt-4 max-w-[42ch] text-muted-foreground">
              La météo du jour pousse l&apos;évaporation : tes plantes au soleil avancent plus vite
              que d&apos;habitude. Voici l&apos;ordre des priorités.
            </p>
          </div>
          <div className="flex gap-2.5">
            {[
              { n: "3", l: "en retard", c: "text-overdue" },
              { n: "1", l: "bientôt", c: "text-soon" },
              { n: "6", l: "ça va", c: "text-ok" },
            ].map((s) => (
              <div key={s.l} className="flex-1 rounded-xl border border-border bg-card p-4">
                <b className={`block font-mono text-2xl leading-none ${s.c}`}>{s.n}</b>
                <span className="text-[12.5px] text-muted-foreground">{s.l}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-2.5">
          <Button>💧 Tout arroser</Button>
          <Button variant="outline">Ajouter une plante</Button>
        </div>

        <section className="mt-9">
          <GroupHead title="À arroser" count="03" />
          <div className="grid gap-3">
            {NEEDS_WATER.map((p) => (
              <PlantCard key={p.latin} plant={p} />
            ))}
          </div>
        </section>

        <section className="mt-9">
          <GroupHead title="Ça va" count="06" />
          <div className="grid gap-3">
            {HEALTHY.map((p) => (
              <PlantCard key={p.latin} plant={p} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
