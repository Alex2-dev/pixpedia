/** Barre de progression en blocs pixel. */
export function Progress({
  owned,
  total,
  label,
}: {
  owned: number;
  total: number;
  label?: string;
}) {
  const pct = total > 0 ? (owned / total) * 100 : 0;
  const complete = total > 0 && owned >= total;
  return (
    <div className={`progress${complete ? ' is-complete' : ''}`}>
      <div
        className="progress__bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={owned}
        aria-label={label}
      >
        {/* Au moins un bloc visible dès la première carte, même dans un set de 100 000. */}
        <span style={{ width: owned > 0 ? `max(${pct}%, 6px)` : 0 }} />
      </div>
      <span className="progress__count px-label">
        {owned} / {total}
      </span>
    </div>
  );
}
