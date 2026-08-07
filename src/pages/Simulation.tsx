import { motion } from "framer-motion";
import {
  Activity,
  CircleDot,
  HeartPulse,
  OctagonAlert,
  RefreshCw,
  ShieldCheck,
  Waves,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { ChartCard } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Button } from "@/components/ui/button";
import { C } from "@/lib/colors";
import { fmt } from "@/lib/format";
import {
  MODE_LABEL,
  simulation,
  useHistory,
  useSimMode,
  useSimulation,
  type Severity,
  type SimMode,
} from "@/lib/simulation";

const MODES: Array<{
  id: SimMode;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  severity: Severity;
  accent: string;
  activeCls: string;
}> = [
  {
    id: "healthy",
    icon: ShieldCheck,
    desc: "All vitals inside the healthy envelope.",
    severity: "ok",
    accent: "text-green-500",
    activeCls: "border-green-500/50 bg-green-500/10",
  },
  {
    id: "bearing",
    icon: HeartPulse,
    desc: "BPFO, temperature and RMS drift upward; health decays.",
    severity: "warning",
    accent: "text-orange-500",
    activeCls: "border-orange-500/50 bg-orange-500/10",
  },
  {
    id: "cavitation",
    icon: Waves,
    desc: "HF vibration spikes; efficiency and suction head drop.",
    severity: "warning",
    accent: "text-orange-500",
    activeCls: "border-orange-500/50 bg-orange-500/10",
  },
  {
    id: "combined",
    icon: Activity,
    desc: "Bearing wear and cavitation accelerate together.",
    severity: "critical",
    accent: "text-red-500",
    activeCls: "border-red-500/60 bg-red-500/10",
  },
  {
    id: "shutdown",
    icon: OctagonAlert,
    desc: "Emergency stop — critical alarms, RUL under 48 h.",
    severity: "critical",
    accent: "text-red-500",
    activeCls: "border-red-500/60 bg-red-500/15",
  },
];

const RECOMMENDATIONS: Record<SimMode, { title: string; body: string; action: string }> = {
  healthy: {
    title: "Continue routine monitoring",
    body: "No fault signatures present. BPFO, temperature and vibration are all within ISO 10816-3 Zone A/B.",
    action: "Next scheduled inspection: 90 days.",
  },
  bearing: {
    title: "Bearing maintenance recommended",
    body: "Outer-race defect progressing. Temperature and BPFO confirm lubricant breakdown at the defect site.",
    action: "Lubricate bearing · inspect alignment · schedule replacement in next planned window.",
  },
  cavitation: {
    title: "Cavitation rectification required",
    body: "High-frequency band energy confirms bubble collapse. Efficiency loss tracks vapour fraction in the impeller.",
    action: "Check suction strainer · raise NPSH margin · inspect impeller for pitting.",
  },
  combined: {
    title: "Immediate intervention required",
    body: "Two degradation mechanisms are active and mutually accelerating. Unload the pump to slow progression.",
    action: "Plan dual-scope maintenance window within 72 hours.",
  },
  shutdown: {
    title: "Emergency shutdown",
    body: "Bearing health critically low. Do not restart until teardown inspection of the drive-end bearing.",
    action: "Shutdown pump within 48 hours · lock out / tag out · dispatch crew with replacement kit.",
  },
};

export default function Simulation() {
  const s = useSimulation();
  const mode = useSimMode();
  const history = useHistory(90);
  const rec = RECOMMENDATIONS[mode];

  const rows = [
    { metric: "Bearing temperature", unit: "°C", value: s.bearingTemp, healthy: "50–55", failure: "→ 75" },
    { metric: "Bearing vibration", unit: "g", value: s.bearingVibration, healthy: "0.5–1.0", failure: "2–3 (bearing) · 4–5 (cav)" },
    { metric: "BPFO peak", unit: "g", value: s.bpfo, healthy: "0.03", failure: "→ 0.17" },
    { metric: "HF vibration", unit: "g", value: s.hfVibration, healthy: "0.4", failure: "spikes → 3.9" },
    { metric: "Pump efficiency", unit: "%", value: s.efficiency, healthy: "96", failure: "→ 71–76" },
    { metric: "Cavitation risk", unit: "%", value: s.cavitationRisk, healthy: "2", failure: "→ 78+" },
    { metric: "Bearing health", unit: "%", value: s.bearingHealth, healthy: "98", failure: "→ 30–55" },
    { metric: "Remaining useful life", unit: "days", value: s.rul, healthy: "183", failure: "→ < 2" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Simulation Control Panel"
        description="Inject fault scenarios and watch the monitoring stack react exactly as it would in the field."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Active scenario</span>
            <SeverityBadge severity={s.status === "Running" ? "ok" : s.status === "Stopped" ? "critical" : s.status === "Critical" ? "critical" : "warning"} />
            <span className="text-[13px] font-semibold text-foreground">{MODE_LABEL[mode]}</span>
          </div>
        }
      />

      {/* mode buttons */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODES.map((m, i) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          return (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              onClick={() => simulation.setMode(m.id)}
              className={cn(
                "group flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-300",
                isActive
                  ? m.activeCls
                  : "glass hover:-translate-y-0.5 hover:border-white/20",
              )}
            >
              <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/60", m.accent)}>
                <Icon className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold text-foreground">{m.id === "healthy" ? "Healthy Mode" : MODE_LABEL[m.id]}</p>
                <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">{m.desc}</p>
                {isActive && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn("mt-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider", m.accent)}>
                    <CircleDot className="size-3" /> Active now
                  </motion.p>
                )}
              </div>
            </motion.button>
          );
        })}

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          onClick={() => simulation.reset()}
          className="group flex items-start gap-3 rounded-xl border border-dashed border-border/70 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/60 text-primary">
            <RefreshCw className="size-4.5 transition-transform duration-500 group-hover:rotate-180" />
          </div>
          <div>
            <p className="text-[13.5px] font-semibold text-foreground">Reset</p>
            <p className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">
              Return every value to the healthy baseline and clear the alert log.
            </p>
          </div>
        </motion.button>
      </div>

      {/* telemetry table + charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="glass rounded-xl p-5"
        >
          <div className="mb-2 flex items-center gap-2">
            <Zap className="size-4 text-primary" />
            <h3 className="text-[13px] font-medium">Telemetry snapshot</h3>
          </div>
          <div className="divide-y divide-border/40">
            {rows.map((r) => (
              <div key={r.metric} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] text-foreground">{r.metric}</p>
                  <p className="text-[10.5px] text-muted-foreground">healthy {r.healthy}</p>
                </div>
                <div className="text-right">
                  <p className={cn("numeric text-[13.5px] font-semibold", r.value > (r.metric === "Pump efficiency" || r.metric === "Bearing health" || r.metric === "Remaining useful life" ? 60 : 2.5) ? "text-foreground" : "text-foreground")}>
                    {fmt(r.value, r.value < 1 ? 2 : 1)} {r.unit}
                  </p>
                  <p className="text-[10px] text-muted-foreground">scenario → {r.failure}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 lg:col-span-2">
          <ChartCard
            title="Bearing temperature progression"
            subtitle="Simulated fault ramp · °C"
            data={history.map((h) => ({ t: h.t, v: h.temp }))}
            color={C.orange}
            unit="°C"
            decimals={1}
            height={150}
            domain={[40, 85]}
          />
          <ChartCard
            title="BPFO peak progression"
            subtitle="Outer-race defect amplitude · g"
            data={history.map((h) => ({ t: h.t, v: h.bpfo }))}
            color={C.cyan}
            unit="g"
            decimals={3}
            height={150}
          />
          <div className="glass flex flex-col gap-2 rounded-xl p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">AI recommendation</p>
            <p className="text-[14px] font-semibold text-foreground">{rec.title}</p>
            <p className="text-[12.5px] leading-relaxed text-muted-foreground">{rec.body}</p>
            <p className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-[12.5px] font-medium text-primary">{rec.action}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
