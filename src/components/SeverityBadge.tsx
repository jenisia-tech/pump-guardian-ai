import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/simulation";

const MAP: Record<
  Severity,
  { label: string; dot: string; text: string; ring: string }
> = {
  ok: {
    label: "Normal",
    dot: "bg-green-500",
    text: "text-green-500",
    ring: "border-green-500/25 bg-green-500/8",
  },
  info: {
    label: "Info",
    dot: "bg-sky-400",
    text: "text-sky-400",
    ring: "border-sky-400/25 bg-sky-400/8",
  },
  warning: {
    label: "Warning",
    dot: "bg-orange-500",
    text: "text-orange-500",
    ring: "border-orange-500/25 bg-orange-500/8",
  },
  critical: {
    label: "Critical",
    dot: "bg-red-500",
    text: "text-red-500",
    ring: "border-red-500/30 bg-red-500/10",
  },
};

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  const m = MAP[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        m.ring,
        m.text,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

export function SeverityDot({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  const m = MAP[severity];
  return <span className={cn("size-2 rounded-full", m.dot, className)} />;
}
