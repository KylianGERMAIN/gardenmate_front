import type { CareStatus } from "./status-badge";

const FILL: Record<CareStatus, string> = {
  OVERDUE: "bg-overdue",
  SOON: "bg-soon",
  OK: "bg-ok",
  NO_SCHEDULE: "bg-no-schedule",
};

/**
 * Jauge de soif — le geste signature : on lit l'état d'arrosage d'un coup d'œil.
 * `percent` = avancement du cycle (0 = juste arrosé, 100 = sec).
 */
export function ThirstGauge({
  status,
  percent,
  left,
  right,
}: {
  status: CareStatus;
  percent: number;
  left: string;
  right: string;
}) {
  return (
    <div>
      <div className="relative h-2 overflow-hidden rounded-full border border-border bg-secondary">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${FILL[status]}`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[11px] text-muted-foreground">
        <span>{left}</span>
        <span className={status === "OVERDUE" ? "font-semibold text-overdue" : ""}>{right}</span>
      </div>
    </div>
  );
}
