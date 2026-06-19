export type CareStatus = "OVERDUE" | "SOON" | "OK" | "NO_SCHEDULE";

const STATUS: Record<CareStatus, { label: string; cls: string }> = {
  OVERDUE: { label: "En retard", cls: "bg-overdue/12 text-overdue border-overdue/30" },
  SOON: { label: "Bientôt", cls: "bg-soon/12 text-soon border-soon/30" },
  OK: { label: "OK", cls: "bg-ok/12 text-ok border-ok/30" },
  NO_SCHEDULE: { label: "Pas de suivi", cls: "bg-no-schedule/12 text-no-schedule border-no-schedule/30" },
};

export function StatusBadge({ status }: { status: CareStatus }) {
  const s = STATUS[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
