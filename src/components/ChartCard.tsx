import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnimatedNumber } from "./AnimatedNumber";
import { C, GRID, AXIS } from "@/lib/colors";
import { timeStr } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: Array<{ t: number; v: number }>;
  color?: string;
  unit?: string;
  decimals?: number;
  height?: number;
  domain?: [number | "auto", number | "auto"];
  className?: string;
  badge?: React.ReactNode;
  current?: number;
}

export function ChartCard({
  title,
  subtitle,
  data,
  color = C.blue,
  unit = "",
  decimals = 1,
  height = 180,
  domain,
  className,
  badge,
  current,
}: ChartCardProps) {
  const gid = title.replace(/[^a-zA-Z0-9]/g, "");
  const series = data.map((d) => ({ label: timeStr(d.t), v: +d.v.toFixed(2) }));
  const last = current ?? data[data.length - 1]?.v ?? 0;

  return (
    <div
      className={cn(
        "glass flex flex-col gap-3 rounded-xl p-4 shadow-sm transition-colors duration-300 hover:border-white/20",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[13px] font-medium text-foreground">{title}</h3>
            {badge}
          </div>
          <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
        <div className="text-right">
          <AnimatedNumber
            value={last}
            decimals={decimals}
            suffix={unit ? ` ${unit}` : ""}
            className="text-lg font-semibold"
          />
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">live</p>
        </div>
      </div>

      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${gid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: AXIS, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              minTickGap={48}
            />
            <YAxis
              tick={{ fill: AXIS, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={38}
              domain={domain ?? ["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                background: "#17213a",
                border: "1px solid rgba(148,163,184,0.2)",
                borderRadius: 10,
                fontSize: 12,
                color: "#e2e8f0",
              }}
              labelStyle={{ color: "#94a3b8", fontSize: 11 }}
              formatter={(val) => [`${Number(val).toFixed(decimals)}${unit ? ` ${unit}` : ""}`, title]}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={1.8}
              fill={`url(#grad-${gid})`}
              isAnimationActive={true}
              animationDuration={400}
              dot={false}
              activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
