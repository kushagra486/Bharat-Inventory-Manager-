export type DonutSegment = { name: string; pct: number; color: string };

export function CategoryDonut({ segments, size = 130 }: { segments: DonutSegment[]; size?: number }) {
  const r = 15.9;
  const circumference = 2 * Math.PI * r;
  const arcs = segments.reduce<{ list: { dash: number; offset: number }[]; cumPct: number }>(
    (state, s) => {
      const dash = (s.pct / 100) * circumference;
      const offset = -((state.cumPct / 100) * circumference);
      return { list: [...state.list, { dash, offset }], cumPct: state.cumPct + s.pct };
    },
    { list: [], cumPct: 0 },
  ).list;

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox="0 0 42 42" className="shrink-0">
        <circle cx="21" cy="21" r={r} fill="transparent" stroke="var(--bim-neutral-800)" strokeWidth="6" />
        {segments.map((s, i) => (
          <circle
            key={s.name}
            cx="21"
            cy="21"
            r={r}
            fill="transparent"
            stroke={s.color}
            strokeWidth="6"
            strokeDasharray={`${arcs[i].dash} ${circumference - arcs[i].dash}`}
            strokeDashoffset={arcs[i].offset}
            transform="rotate(-90 21 21)"
          />
        ))}
      </svg>
      <div className="flex flex-1 flex-col gap-1.5">
        {segments.map((s) => (
          <div key={s.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full" style={{ background: s.color }} />
              {s.name}
            </span>
            <span className="text-muted-foreground">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
