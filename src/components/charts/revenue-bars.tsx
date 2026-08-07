export function RevenueBars({
  data,
  height = 150,
}: {
  data: { day: string; value: number }[];
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value));
  const barWidth = 26;
  const gap = 12;
  const width = data.length * (barWidth + gap);

  return (
    <div className="flex flex-col gap-1">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 4);
          const isLast = i === data.length - 1;
          return (
            <rect
              key={d.day}
              x={i * (barWidth + gap) + gap / 2}
              y={height - h}
              width={barWidth}
              height={h}
              rx={5}
              fill={isLast ? "var(--primary)" : "var(--bim-accent-700)"}
            />
          );
        })}
      </svg>
      <div className="flex justify-between px-1 text-[10px] text-muted-foreground">
        {data.map((d) => (
          <span key={d.day}>{d.day}</span>
        ))}
      </div>
    </div>
  );
}
