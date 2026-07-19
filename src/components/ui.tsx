export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card fade-up p-5">
      <div className="text-sm text-[var(--ink-muted)]">{label}</div>
      <div className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--brand-deep)]">
        {value}
      </div>
      {hint ? <div className="mt-2 text-xs text-[var(--ink-muted)]">{hint}</div> : null}
    </div>
  );
}
