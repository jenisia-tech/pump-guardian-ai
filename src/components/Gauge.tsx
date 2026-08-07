import { cn } from "@/lib/utils";
import { C } from "@/lib/colors";

interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
  decimals?: number;
  /** % of scale where color turns from green to orange */
  warnAt?: number;
  /** % of scale where color turns from orange to red */
  critAt?: number;
  size?: number;
  className?: string;
}

export function Gauge({
  value,
  min = 0,
  max = 100,
  label,
  unit,
  decimals = 0,
  warnAt = 70,
  critAt = 40,
  size = 168,
  className,
}: GaugeProps) {
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const pct100 = pct * 100;
  const color =
    pct100 >= warnAt ? C.green : pct100 >= critAt ? C.orange : C.red;

  // 240° arc, top-center start, sweeping clockwise
  const r = 62;
  const cx = 100;
  const cy = 100;
  const a0 = 210; // start (left-low)
  const a1 = -30; // end (right-low)
  const polar = (angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const s = polar(a0);
  const e = polar(a1);
  const arc = `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 1 0 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg
        width={size}
        height={size * 0.62}
        viewBox="0 0 200 124"
        className="overflow-visible text-foreground"
      >
        <path
          d={arc}
          pathLength={100}
          stroke="rgba(148,163,184,0.15)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={arc}
          pathLength={100}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="100"
          strokeDashoffset={100 - pct * 100}
          style={{ transition: "stroke-dashoffset 0.7s ease, stroke 0.5s ease" }}
        />
        {Array.from({ length: 11 }).map((_, i) => {
          const a = a0 - ((a0 - a1) * i) / 10;
          const p = polar(a);
          const len = i % 5 === 0 ? 7 : 4;
          const nx = ((p.x - cx) / r) * len;
          const ny = ((p.y - cy) / r) * len;
          return (
            <line
              key={i}
              x1={p.x - nx}
              y1={p.y - ny}
              x2={p.x}
              y2={p.y}
              stroke="rgba(148,163,184,0.45)"
              strokeWidth={i % 5 === 0 ? 1.4 : 1}
            />
          );
        })}
        <text
          x="100"
          y="86"
          textAnchor="middle"
          className="numeric"
          fill="currentColor"
          style={{ fontSize: 27, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
        >
          {value.toFixed(decimals)}
        </text>
        <text
          x="100"
          y="103"
          textAnchor="middle"
          fill="#94a3b8"
          style={{ fontSize: 11, letterSpacing: 1.2 }}
        >
          {unit ?? ""}
        </text>
      </svg>
      {label && (
        <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
      )}
    </div>
  );
}
