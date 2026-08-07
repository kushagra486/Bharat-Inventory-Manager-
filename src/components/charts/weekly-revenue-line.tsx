// `yPoints` are SVG y-coordinates directly (0 = top), one per x-step across a
// 280-wide viewBox — matching the design's own pre-plotted polyline.
export function WeeklyRevenueLine({ yPoints, height = 90 }: { yPoints: number[]; height?: number }) {
  const width = 280;
  const step = width / (yPoints.length - 1);
  const coords = yPoints.map((y, i) => `${i * step},${y}`);

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline points={coords.join(" ")} fill="none" stroke="var(--primary)" strokeWidth="2.5" />
    </svg>
  );
}
