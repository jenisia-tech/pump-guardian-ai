export function fmt(v: number, decimals = 1) {
  return v.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtInt(v: number) {
  return Math.round(v).toLocaleString("en-US");
}

export function fmtMoney(v: number) {
  return "₹" + Math.round(v).toLocaleString("en-IN");
}

export function fmtInrCompact(v: number) {
  if (v >= 100000) return "₹" + (v / 100000).toFixed(1) + "L";
  if (v >= 1000) return "₹" + (v / 1000).toFixed(0) + "K";
  return "₹" + Math.round(v);
}

export function timeStr(ts: number) {
  return new Date(ts).toLocaleTimeString("en-GB", { hour12: false });
}

export function dateStr(ts: number) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function dateTimeStr(ts: number) {
  return `${dateStr(ts)} · ${timeStr(ts)}`;
}

export function relativeTime(ts: number) {
  const diff = Date.now() - ts;
  const s = Math.round(diff / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export const TICK_LABEL = (t: number) => timeStr(t);
